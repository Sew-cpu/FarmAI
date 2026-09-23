import React, { useState } from 'react';
import {
  PawPrint,
  Plus,
  Search,
  Filter,
  HeartPulse,
  Sparkles,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  Syringe,
  Scale,
  Calendar,
  Grid,
  List,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Animal, AnimalStatus, Species } from '../types/farm';

export const AnimalsView: React.FC = () => {
  const { animals, barns, addAnimal, updateAnimal, deleteAnimal, quickDiagnoseAnimal } = useFarm();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBarn, setSelectedBarn] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);

  // Form states for Add / Edit
  const [formTagId, setFormTagId] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState<Species>('Bò');
  const [formBreed, setFormBreed] = useState('');
  const [formGender, setFormGender] = useState<'Đực' | 'Cái'>('Cái');
  const [formBirthDate, setFormBirthDate] = useState('2024-06-01');
  const [formWeight, setFormWeight] = useState(450);
  const [formBarnId, setFormBarnId] = useState(barns[0]?.id || '');
  const [formStatus, setFormStatus] = useState<AnimalStatus>('healthy');
  const [formNotes, setFormNotes] = useState('');

  // Vaccine history entry in modal
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState(new Date().toISOString().split('T')[0]);

  // Open Edit Modal with existing data
  const handleOpenEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormTagId(animal.tagId);
    setFormName(animal.name);
    setFormSpecies(animal.species);
    setFormBreed(animal.breed);
    setFormGender(animal.gender);
    setFormBirthDate(animal.birthDate);
    setFormWeight(animal.weightKg);
    setFormBarnId(animal.barnId);
    setFormStatus(animal.status);
    setFormNotes(animal.notes || '');
  };

  const handleOpenAdd = () => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    setFormTagId(`VN-${nextNum}`);
    setFormName(`Vật nuôi #${nextNum}`);
    setFormSpecies('Bò');
    setFormBreed('Bò lai Zebu F1');
    setFormGender('Cái');
    setFormBirthDate('2024-06-01');
    setFormWeight(380);
    setFormBarnId(barns[0]?.id || '');
    setFormStatus('healthy');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAnimal) {
      updateAnimal(editingAnimal.id, {
        tagId: formTagId,
        name: formName,
        species: formSpecies,
        breed: formBreed,
        gender: formGender,
        birthDate: formBirthDate,
        weightKg: Number(formWeight),
        barnId: formBarnId,
        status: formStatus,
        notes: formNotes,
      });
      setEditingAnimal(null);
    } else {
      addAnimal({
        tagId: formTagId,
        name: formName,
        species: formSpecies,
        breed: formBreed,
        gender: formGender,
        birthDate: formBirthDate,
        weightKg: Number(formWeight),
        barnId: formBarnId,
        status: formStatus,
        notes: formNotes,
        vaccinationHistory: vaccineName
          ? [{ vaccineName, date: vaccineDate, nextDueDate: '2027-01-01' }]
          : [],
        lastCheckupDate: new Date().toISOString().split('T')[0],
      });
      setIsAddModalOpen(false);
    }
  };

  // Filter animals
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
    const matchesStatus = selectedStatus === 'all' || animal.status === selectedStatus;
    const matchesBarn = selectedBarn === 'all' || animal.barnId === selectedBarn;

    return matchesSearch && matchesSpecies && matchesStatus && matchesBarn;
  });

  const getStatusBadge = (status: AnimalStatus) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Khỏe mạnh
          </span>
        );
      case 'monitoring':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3" />
            Đang theo dõi
          </span>
        );
      case 'sick':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <HeartPulse className="w-3 h-3" />
            Đang điều trị
          </span>
        );
      case 'isolated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <AlertTriangle className="w-3 h-3" />
            Cách ly y tế
          </span>
        );
      case 'pregnant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
            Đang mang thai
          </span>
        );
    }
  };

  const getBarnName = (barnId: string) => {
    const barn = barns.find((b) => b.id === barnId);
    return barn ? barn.name : 'Chưa xếp chuồng';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-emerald-600" />
            Quản Lý Đàn Vật Nuôi
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Tổng cộng {animals.length} cá thể/đàn gia súc gia cầm trong cơ sở
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-stone-200/70 rounded-xl text-stone-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
              title="Xem dạng lưới"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm Vật Nuôi Mới
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã thẻ tai, tên, giống..."
              className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Species */}
          <div>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Tất cả loài (Bò, Heo, Gà, Dê...)</option>
              <option value="Bò">Bò</option>
              <option value="Heo">Heo</option>
              <option value="Gà">Gà</option>
              <option value="Dê">Dê</option>
              <option value="Vịt">Vịt</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Tất cả tình trạng sức khỏe</option>
              <option value="healthy">Khỏe mạnh</option>
              <option value="monitoring">Đang theo dõi</option>
              <option value="sick">Đang điều trị</option>
              <option value="isolated">Cách ly y tế</option>
              <option value="pregnant">Đang mang thai</option>
            </select>
          </div>

          {/* Barn */}
          <div>
            <select
              value={selectedBarn}
              onChange={(e) => setSelectedBarn(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Tất cả các khu chuồng</option>
              {barns.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAnimals.map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-4 space-y-3">
                {/* Header: Tag ID & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                    {animal.tagId}
                  </span>
                  {getStatusBadge(animal.status)}
                </div>

                {/* Name & Breed */}
                <div>
                  <h4 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {animal.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">{animal.breed}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] py-1 bg-stone-50 rounded-xl px-2.5 text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-stone-400" />
                    <span>{animal.weightKg} kg</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{animal.gender}</span>
                  </div>
                </div>

                {/* Barn */}
                <p className="text-[11px] text-stone-500 truncate">
                  📍 <span className="font-medium text-stone-700">{getBarnName(animal.barnId)}</span>
                </p>

                {/* Notes or Alert */}
                {animal.notes && (
                  <p className="text-[11px] text-stone-600 bg-amber-50/70 border border-amber-200/60 p-2 rounded-lg line-clamp-2">
                    {animal.notes}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1">
                {/* AI Consult Button */}
                <button
                  onClick={() => quickDiagnoseAnimal(animal)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Hỏi Bác sĩ AI chẩn đoán cho con vật này"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Khám cùng AI
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingAnimal(animal)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                    title="Xem chi tiết hồ sơ"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(animal)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa vật nuôi ${animal.name} (${animal.tagId})?`)) {
                        deleteAnimal(animal.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Mã thẻ tai</th>
                  <th className="p-3.5">Tên vật nuôi & Giống</th>
                  <th className="p-3.5">Loài</th>
                  <th className="p-3.5">Chuồng trại</th>
                  <th className="p-3.5">Cân nặng</th>
                  <th className="p-3.5">Trạng thái sức khỏe</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{animal.tagId}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-900">{animal.name}</div>
                      <div className="text-[11px] text-stone-500">{animal.breed}</div>
                    </td>
                    <td className="p-3.5 font-medium text-stone-700">{animal.species}</td>
                    <td className="p-3.5 text-stone-600">{getBarnName(animal.barnId)}</td>
                    <td className="p-3.5 font-medium text-stone-800">{animal.weightKg} kg</td>
                    <td className="p-3.5">{getStatusBadge(animal.status)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => quickDiagnoseAnimal(animal)}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Hỏi AI
                        </button>
                        <button
                          onClick={() => setViewingAnimal(animal)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(animal)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn muốn xóa ${animal.tagId}?`)) deleteAnimal(animal.id);
                          }}
                          className="p-1 text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Animal */}
      {(isAddModalOpen || editingAnimal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingAnimal ? 'Cập Nhật Hồ Sơ Vật Nuôi' : 'Thêm Vật Nuôi / Đàn Nuôi Mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingAnimal(null);
                }}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Mã thẻ tai (Tag ID) *</label>
                  <input
                    type="text"
                    value={formTagId}
                    onChange={(e) => setFormTagId(e.target.value)}
                    placeholder="BO-0101, HEO-202..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tên gọi / Ký hiệu *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Bò Sữa Bella, Đàn heo B2..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Loài *</label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value as Species)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Bò">Bò</option>
                    <option value="Heo">Heo</option>
                    <option value="Gà">Gà</option>
                    <option value="Dê">Dê</option>
                    <option value="Vịt">Vịt</option>
                    <option value="Cừu">Cừu</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Giống loài</label>
                  <input
                    type="text"
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    placeholder="Holstein Friesian, Angus..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Giới tính</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Đực' | 'Cái')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cái">Cái</option>
                    <option value="Đực">Đực</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Ngày sinh / Ngày nhập</label>
                  <input
                    type="date"
                    value={formBirthDate}
                    onChange={(e) => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Khu chuồng</label>
                  <select
                    value={formBarnId}
                    onChange={(e) => setFormBarnId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {barns.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Tình trạng sức khỏe</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as AnimalStatus)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                >
                  <option value="healthy">Khỏe mạnh (Bình thường)</option>
                  <option value="monitoring">Đang theo dõi (Có dấu hiệu bất thường)</option>
                  <option value="sick">Đang điều trị (Bị ốm/sốt/ho)</option>
                  <option value="isolated">Cách ly y tế (Cách ly phòng dịch)</option>
                  <option value="pregnant">Đang mang thai</option>
                </select>
              </div>

              {!editingAnimal && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                    Mũi vắc xin gần nhất (nếu có):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Tên vắc xin (LMLM, Dịch tả...)"
                      value={vaccineName}
                      onChange={(e) => setVaccineName(e.target.value)}
                      className="px-2.5 py-1.5 border border-stone-300 rounded-lg"
                    />
                    <input
                      type="date"
                      value={vaccineDate}
                      onChange={(e) => setVaccineDate(e.target.value)}
                      className="px-2.5 py-1.5 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-stone-700 mb-1">Ghi chú lâm sàng / Dinh dưỡng</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú về tiền sử bệnh, dị ứng thức ăn, năng suất sữa..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAnimal(null);
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingAnimal ? 'Cập Nhật' : 'Lưu Vật Nuôi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animal Detail Dossier Modal */}
      {viewingAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-emerald-400 font-bold text-xs">{viewingAnimal.tagId}</span>
                <h3 className="font-bold text-base">{viewingAnimal.name}</h3>
              </div>
              <button onClick={() => setViewingAnimal(null)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div>
                  <span className="text-stone-400">Loài & Giống:</span>
                  <p className="font-bold text-stone-800">{viewingAnimal.species} - {viewingAnimal.breed}</p>
                </div>
                <div>
                  <span className="text-stone-400">Tình trạng:</span>
                  <div className="mt-0.5">{getStatusBadge(viewingAnimal.status)}</div>
                </div>
                <div>
                  <span className="text-stone-400">Trọng lượng:</span>
                  <p className="font-bold text-stone-800">{viewingAnimal.weightKg} kg</p>
                </div>
                <div>
                  <span className="text-stone-400">Chuồng nuôi:</span>
                  <p className="font-bold text-stone-800">{getBarnName(viewingAnimal.barnId)}</p>
                </div>
              </div>

              {/* Vaccine History */}
              <div>
                <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                  <Syringe className="w-4 h-4 text-emerald-600" />
                  Lịch Sử Tiêm Chủng Vắc Xin
                </h4>
                {viewingAnimal.vaccinationHistory && viewingAnimal.vaccinationHistory.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewingAnimal.vaccinationHistory.map((v, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between"
                      >
                        <span className="font-semibold text-stone-800">{v.vaccineName}</span>
                        <span className="text-stone-500 font-mono text-[11px]">Đã tiêm: {v.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">Chưa ghi nhận lịch sử tiêm chủng</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-bold text-stone-900 mb-1">Ghi Chú & Bệnh Sử</h4>
                <p className="p-3 bg-stone-50 rounded-xl text-stone-700 leading-relaxed border border-stone-200">
                  {viewingAnimal.notes || 'Không có ghi chú bất thường.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const target = viewingAnimal;
                    setViewingAnimal(null);
                    quickDiagnoseAnimal(target);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Khám Bệnh Ngay Với AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
