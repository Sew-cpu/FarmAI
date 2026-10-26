import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  ArrowUpDown,
  Tag,
  Warehouse,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import { Animal, AnimalStatus, Species } from '../types/farm';
import { HealthBadge } from './ui/HealthBadge';
import { EmptyState } from './ui/EmptyState';
import { ConfirmModal } from './ui/ConfirmModal';

export const AnimalsView: React.FC = () => {
  const { animals, barns, addAnimal, updateAnimal, deleteAnimal, quickDiagnoseAnimal } = useFarm();
  const { success, error, info } = useToast();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBarn, setSelectedBarn] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'tagId' | 'name' | 'weight' | 'date'>('tagId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);
  const [deletingAnimal, setDeletingAnimal] = useState<Animal | null>(null);

  // Form states for Add / Edit
  const [formTagId, setFormTagId] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState<Species>('Bò');
  const [formBreed, setFormBreed] = useState('');
  const [formGender, setFormGender] = useState<'Đực' | 'Cái'>('Cái');
  const [formBirthDate, setFormBirthDate] = useState('2024-06-01');
  const [formWeight, setFormWeight] = useState<number | ''>(450);
  const [formBarnId, setFormBarnId] = useState(barns[0]?.id || '');
  const [formStatus, setFormStatus] = useState<AnimalStatus>('healthy');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Listen for global quick add event (e.g. from Mobile Bottom Nav or Dashboard)
  useEffect(() => {
    const handleOpenAddEvent = () => handleOpenAdd();
    window.addEventListener('farmpro-open-add-animal', handleOpenAddEvent);
    return () => window.removeEventListener('farmpro-open-add-animal', handleOpenAddEvent);
  }, [barns]);

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
    setFormErrors({});
  };

  const handleOpenAdd = () => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    setEditingAnimal(null);
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
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formTagId.trim()) {
      errs.tagId = 'Mã thẻ tai không được để trống';
    } else {
      // Check duplicate tagId
      const duplicate = animals.find(
        (a) => a.tagId.toLowerCase() === formTagId.trim().toLowerCase() && a.id !== editingAnimal?.id
      );
      if (duplicate) {
        errs.tagId = 'Mã thẻ tai này đã tồn tại trong đàn';
      }
    }

    if (!formName.trim()) {
      errs.name = 'Tên hoặc số hiệu vật nuôi không được để trống';
    }

    if (!formBreed.trim()) {
      errs.breed = 'Vui lòng nhập giống loài';
    }

    if (formWeight === '' || Number(formWeight) <= 0) {
      errs.weight = 'Cân nặng phải là số dương lớn hơn 0';
    }

    if (!formBarnId) {
      errs.barnId = 'Vui lòng chọn khu vực chuồng nuôi';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      error('Lỗi dữ liệu đầu vào', 'Vui lòng kiểm tra lại các trường thông tin màu đỏ.');
      return;
    }

    if (editingAnimal) {
      updateAnimal(editingAnimal.id, {
        tagId: formTagId.trim().toUpperCase(),
        name: formName.trim(),
        species: formSpecies,
        breed: formBreed.trim(),
        gender: formGender,
        birthDate: formBirthDate,
        weightKg: Number(formWeight),
        barnId: formBarnId,
        status: formStatus,
        notes: formNotes.trim(),
        lastCheckupDate: new Date().toISOString().split('T')[0],
      });
      success('Cập nhật thành công', `Đã lưu thông tin cho vật nuôi ${formName}.`);
      setEditingAnimal(null);
    } else {
      addAnimal({
        tagId: formTagId.trim().toUpperCase(),
        name: formName.trim(),
        species: formSpecies,
        breed: formBreed.trim(),
        gender: formGender,
        birthDate: formBirthDate,
        weightKg: Number(formWeight),
        barnId: formBarnId,
        status: formStatus,
        notes: formNotes.trim(),
        vaccinationHistory: [],
        lastCheckupDate: new Date().toISOString().split('T')[0],
      });
      success('Thêm vật nuôi thành công', `Đã đăng ký mã thẻ ${formTagId.toUpperCase()} vào đàn.`);
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingAnimal) return;
    deleteAnimal(deletingAnimal.id);
    success('Đã xóa vật nuôi', `Đã xóa thẻ ${deletingAnimal.tagId} (${deletingAnimal.name}) khỏi hệ thống.`);
    setDeletingAnimal(null);
  };

  // Filter & Search animals
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchSearch =
        debouncedSearch === '' ||
        animal.tagId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        animal.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        animal.breed.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        animal.species.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
      const matchStatus = selectedStatus === 'all' || animal.status === selectedStatus;
      const matchBarn = selectedBarn === 'all' || animal.barnId === selectedBarn;

      return matchSearch && matchSpecies && matchStatus && matchBarn;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'tagId') comparison = a.tagId.localeCompare(b.tagId);
      else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'weight') comparison = a.weightKg - b.weightKg;
      else if (sortBy === 'date') comparison = (a.lastCheckupDate || '').localeCompare(b.lastCheckupDate || '');

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [animals, debouncedSearch, selectedSpecies, selectedStatus, selectedBarn, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecies('all');
    setSelectedStatus('all');
    setSelectedBarn('all');
  };

  const speciesOptions = ['all', 'Bò', 'Heo', 'Gà', 'Vịt', 'Dê', 'Cừu', 'Khác'];
  const statusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'healthy', label: 'Khỏe mạnh' },
    { value: 'monitoring', label: 'Cần theo dõi' },
    { value: 'sick', label: 'Đang điều trị' },
    { value: 'isolated', label: 'Cách ly' },
    { value: 'pregnant', label: 'Mang thai' },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <PawPrint className="w-6 h-6 text-emerald-600" />
            Quản Lý Đàn Vật Nuôi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <strong>{animals.length}</strong> cá thể • Đang hiển thị: <strong>{filteredAnimals.length}</strong> kết quả
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Vật Nuôi</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        {/* Row 1: Search & View Mode */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Instant Search with Debounce */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo mã thẻ tai (VD: BO-0102), tên, giống loài..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Table/Grid toggle */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem dạng bảng chuẩn"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Bảng</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem dạng thẻ card"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Thẻ</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors"
              title={`Đang sắp xếp: ${sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
            <Filter className="w-3 h-3" /> Loài:
          </span>
          {speciesOptions.map((species) => (
            <button
              key={species}
              onClick={() => setSelectedSpecies(species)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedSpecies === species
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {species === 'all' ? 'Tất cả loài' : species}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border-0 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Barn Dropdown */}
          <select
            value={selectedBarn}
            onChange={(e) => setSelectedBarn(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border-0 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            <option value="all">Tất cả chuồng</option>
            {barns.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {(selectedSpecies !== 'all' || selectedStatus !== 'all' || selectedBarn !== 'all' || searchTerm) && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" /> Đặt lại lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredAnimals.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="Không tìm thấy vật nuôi phù hợp"
          description={
            searchTerm || selectedSpecies !== 'all' || selectedStatus !== 'all'
              ? 'Không có cá thể nào khớp với bộ lọc hiện tại. Hãy thử tìm từ khóa khác hoặc đặt lại bộ lọc.'
              : 'Trang trại hiện chưa có dữ liệu vật nuôi. Hãy thêm mới cá thể đầu tiên vào đàn.'
          }
          actionText={
            searchTerm || selectedSpecies !== 'all' || selectedStatus !== 'all'
              ? 'Đặt lại bộ lọc'
              : 'Thêm vật nuôi mới'
          }
          onAction={
            searchTerm || selectedSpecies !== 'all' || selectedStatus !== 'all'
              ? resetFilters
              : handleOpenAdd
          }
        />
      ) : viewMode === 'table' ? (
        /* Desktop Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Thẻ Tai</th>
                  <th className="py-3.5 px-4">Tên & Giống Loài</th>
                  <th className="py-3.5 px-4">Khu Vực Chuồng</th>
                  <th className="py-3.5 px-4">Thể Trọng / Giới Tính</th>
                  <th className="py-3.5 px-4">Trạng Thái Sức Khỏe</th>
                  <th className="py-3.5 px-4">Khám Gần Nhất</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAnimals.map((animal) => {
                  const barn = barns.find((b) => b.id === animal.barnId);
                  return (
                    <tr
                      key={animal.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Tag ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/70">
                          {animal.tagId}
                        </span>
                      </td>

                      {/* Name & Breed */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {animal.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {animal.species} • {animal.breed}
                        </div>
                      </td>

                      {/* Barn */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {barn ? barn.name : 'Chưa phân chuồng'}
                        </span>
                      </td>

                      {/* Weight & Gender */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{animal.weightKg} kg</div>
                        <div className="text-[11px] text-slate-400">{animal.gender}</div>
                      </td>

                      {/* Health Status Badge */}
                      <td className="py-3 px-4">
                        <HealthBadge status={animal.status} size="sm" />
                      </td>

                      {/* Last Checkup */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {animal.lastCheckupDate || 'Chưa cập nhật'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick AI Diagnose */}
                          <button
                            onClick={() => quickDiagnoseAnimal(animal)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 transition-all"
                            title="Khám bệnh bằng Bác sĩ Thú Y AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setViewingAnimal(animal)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Xem hồ sơ chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(animal)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingAnimal(animal)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa vật nuôi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mobile / Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map((animal) => {
            const barn = barns.find((b) => b.id === animal.barnId);
            return (
              <div
                key={animal.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/70">
                      {animal.tagId}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                      {animal.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {animal.species} • {animal.breed}
                    </p>
                  </div>
                  <HealthBadge status={animal.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Thể trọng</span>
                    <strong className="text-slate-800">{animal.weightKg} kg</strong> ({animal.gender})
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Chuồng nuôi</span>
                    <strong className="text-slate-800 truncate block">
                      {barn ? barn.name : 'Chưa phân'}
                    </strong>
                  </div>
                </div>

                {animal.notes && (
                  <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-xl">
                    "{animal.notes}"
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    onClick={() => quickDiagnoseAnimal(animal)}
                    className="flex-1 min-h-[44px] px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Khám AI</span>
                  </button>

                  <button
                    onClick={() => setViewingAnimal(animal)}
                    className="min-h-[44px] px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Hồ sơ
                  </button>

                  <button
                    onClick={() => handleOpenEdit(animal)}
                    className="min-h-[44px] p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                    title="Sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingAnimal(animal)}
                    className="min-h-[44px] p-2.5 border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add or Edit Animal */}
      {(isAddModalOpen || editingAnimal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <PawPrint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                    {editingAnimal ? `Cập Nhật Hồ Sơ: ${editingAnimal.tagId}` : 'Đăng Ký Vật Nuôi Mới Vào Đàn'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập thông tin nhận dạng, thể trọng và chuồng nuôi
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingAnimal(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* 2-column layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Tag ID */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    Mã thẻ tai (Tag ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTagId}
                    onChange={(e) => setFormTagId(e.target.value.toUpperCase())}
                    placeholder="VD: BO-0102 hoặc HEO-304"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden font-mono text-xs uppercase ${
                      formErrors.tagId ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.tagId && <p className="text-[11px] text-rose-600 font-medium">{formErrors.tagId}</p>}
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    Tên / Số hiệu cá thể <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Bò Sữa Daisy, Heo thịt đàn B2"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden text-xs ${
                      formErrors.name ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-rose-600 font-medium">{formErrors.name}</p>}
                </div>

                {/* Species */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Loài gia súc / gia cầm</label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value as Species)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  >
                    <option value="Bò">Bò (Gia súc lớn)</option>
                    <option value="Heo">Heo / Lợn</option>
                    <option value="Gà">Gà</option>
                    <option value="Vịt">Vịt</option>
                    <option value="Dê">Dê</option>
                    <option value="Cừu">Cừu</option>
                    <option value="Khác">Loài khác</option>
                  </select>
                </div>

                {/* Breed */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    Giống loài chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    placeholder="VD: Holstein Friesian thuần, Yorkshire, Duroc"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-xs ${
                      formErrors.breed ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.breed && <p className="text-[11px] text-rose-600 font-medium">{formErrors.breed}</p>}
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Giới tính</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Đực' | 'Cái')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  >
                    <option value="Cái">Cái (Female)</option>
                    <option value="Đực">Đực (Male)</option>
                  </select>
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    Trọng lượng hiện tại (kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="VD: 540"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-xs ${
                      formErrors.weight ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.weight && <p className="text-[11px] text-rose-600 font-medium">{formErrors.weight}</p>}
                </div>

                {/* Barn */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Khu vực chuồng nuôi</label>
                  <select
                    value={formBarnId}
                    onChange={(e) => setFormBarnId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  >
                    {barns.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.species})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Health Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Trạng thái sức khỏe</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AnimalStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold"
                  >
                    <option value="healthy">Khỏe mạnh bình thường</option>
                    <option value="monitoring">Cần theo dõi (monitoring)</option>
                    <option value="sick">Đang điều trị y tế (sick)</option>
                    <option value="isolated">Cách ly kiểm dịch (isolated)</option>
                    <option value="pregnant">Đang mang thai (pregnant)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Ghi chú triệu chứng & thú y lâm sàng</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="VD: Sốt nhẹ 39.8°C, bỏ ăn bữa chiều qua, thở dốc và ho ngắt quãng..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Form buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAnimal(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow active:scale-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAnimal ? 'Lưu Thay Đổi' : 'Đăng Ký Vật Nuôi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Animal Profile */}
      {viewingAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {viewingAnimal.tagId}
                </span>
                <h3 className="font-extrabold text-xl text-slate-900 mt-2">{viewingAnimal.name}</h3>
                <p className="text-xs text-slate-500">
                  {viewingAnimal.species} • {viewingAnimal.breed}
                </p>
              </div>
              <HealthBadge status={viewingAnimal.status} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Thể trọng</span>
                <strong className="text-slate-800 text-sm">{viewingAnimal.weightKg} kg</strong> ({viewingAnimal.gender})
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Vị trí chuồng nuôi</span>
                <strong className="text-slate-800 text-sm">
                  {barns.find((b) => b.id === viewingAnimal.barnId)?.name || 'Chưa phân chuồng'}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Ngày sinh dự kiến</span>
                <strong className="text-slate-800 font-mono">{viewingAnimal.birthDate}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 text-[10px] block">Khám lâm sàng gần nhất</span>
                <strong className="text-slate-800 font-mono">
                  {viewingAnimal.lastCheckupDate || 'Chưa ghi nhận'}
                </strong>
              </div>
            </div>

            {viewingAnimal.notes && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <strong className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Ghi chú lâm sàng:
                </strong>
                <p className="leading-relaxed">{viewingAnimal.notes}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setViewingAnimal(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const target = viewingAnimal;
                  setViewingAnimal(null);
                  quickDiagnoseAnimal(target);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Khám Bệnh Cùng AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deletingAnimal}
        title="Xác nhận xóa vật nuôi"
        message={`Bạn có chắc chắn muốn xóa cá thể ${deletingAnimal?.tagId} (${deletingAnimal?.name}) khỏi hệ thống? Hành động này sẽ cập nhật lại số lượng chuồng trại.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingAnimal(null)}
      />
    </div>
  );
};
