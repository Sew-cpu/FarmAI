import React, { useState } from 'react';
import {
  FileHeart,
  Plus,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  X,
  Save,
  User,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { HealthLog } from '../types/farm';

export const HealthLogsView: React.FC = () => {
  const { healthLogs, animals, addHealthLog, updateHealthLog, setActiveTab, setAiPromptPrefill } = useFarm();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [veterinarian, setVeterinarian] = useState('BS. Nguyễn Mai Lan');
  const [status, setStatus] = useState<HealthLog['status']>('Đang điều trị');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setSelectedAnimalId(animals[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setSymptoms('');
    setDiagnosis('');
    setTreatment('');
    setVeterinarian('BS. Nguyễn Mai Lan');
    setStatus('Đang điều trị');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find((a) => a.id === selectedAnimalId);
    if (!animal) return;

    addHealthLog({
      animalId: animal.id,
      animalTag: animal.tagId,
      animalName: animal.name,
      date,
      symptoms,
      diagnosis,
      treatment,
      veterinarian,
      status,
      notes,
    });

    setIsAddModalOpen(false);
  };

  const handleConsultAiAboutLog = (log: HealthLog) => {
    const prompt = `Tôi cần hội chẩn thú y với bác sĩ AI về ca bệnh sau:
- Bệnh nhân: ${log.animalName} (${log.animalTag})
- Ngày phát hiện: ${log.date}
- Triệu chứng: ${log.symptoms}
- Chẩn đoán sơ bộ: ${log.diagnosis}
- Phác đồ đang điều trị: ${log.treatment}
- Tình trạng hiện tại: ${log.status}

Xin bác sĩ đánh giá phác đồ trên đã tối ưu chưa, có cần đổi kháng sinh hoặc bổ sung thuốc trợ sức/giảm đau nào không?`;

    setAiPromptPrefill(prompt);
    setActiveTab('ai-advisor');
  };

  const filteredLogs = healthLogs.filter((log) => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSearch =
      log.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <FileHeart className="w-6 h-6 text-red-600" />
            Hồ Sơ Bệnh Án & Nhật Ký Thú Y
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Lưu vết lịch sử khám bệnh, triệu chứng, thuốc điều trị và hội chẩn cùng bác sĩ AI
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Ghi Nhận Ca Bệnh Mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tất cả ca bệnh
          </button>
          <button
            onClick={() => setStatusFilter('Đang điều trị')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              statusFilter === 'Đang điều trị'
                ? 'bg-red-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Đang điều trị
          </button>
          <button
            onClick={() => setStatusFilter('Theo dõi thêm')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              statusFilter === 'Theo dõi thêm'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Theo dõi thêm
          </button>
          <button
            onClick={() => setStatusFilter('Chuyển cách ly')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              statusFilter === 'Chuyển cách ly'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Chuyển cách ly
          </button>
          <button
            onClick={() => setStatusFilter('Đã khỏi')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              statusFilter === 'Đã khỏi'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Đã khỏi bệnh
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã thẻ, chẩn đoán..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:border-red-200 transition-all space-y-3.5 text-xs"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                  {log.animalTag}
                </span>
                <h3 className="font-bold text-sm text-stone-900">{log.animalName}</h3>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Ngày ghi nhận: {log.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    log.status === 'Đang điều trị'
                      ? 'bg-red-100 text-red-800'
                      : log.status === 'Chuyển cách ly'
                      ? 'bg-purple-100 text-purple-800'
                      : log.status === 'Theo dõi thêm'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {log.status}
                </span>

                <button
                  onClick={() => handleConsultAiAboutLog(log)}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  Hội Chẩn Cùng AI
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 font-medium block">Triệu chứng quan sát:</span>
                <p className="font-semibold text-stone-800 leading-relaxed">{log.symptoms}</p>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 font-medium block">Chẩn đoán kết luận:</span>
                <p className="font-semibold text-stone-800 leading-relaxed text-red-700">
                  {log.diagnosis}
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 font-medium block">Phác đồ điều trị & Thuốc:</span>
                <p className="font-semibold text-stone-800 leading-relaxed">{log.treatment}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>Bác sĩ phụ trách: <strong className="text-stone-700">{log.veterinarian}</strong></span>
              {log.notes && <span>Lưu ý: {log.notes}</span>}
              <div className="flex items-center gap-1">
                <span className="text-stone-400">Đổi trạng thái:</span>
                <select
                  value={log.status}
                  onChange={(e) => updateHealthLog(log.id, { status: e.target.value as any })}
                  className="px-2 py-0.5 border border-stone-300 rounded-lg bg-white text-stone-700 font-medium"
                >
                  <option value="Đang điều trị">Đang điều trị</option>
                  <option value="Theo dõi thêm">Theo dõi thêm</option>
                  <option value="Chuyển cách ly">Chuyển cách ly</option>
                  <option value="Đã khỏi">Đã khỏi</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Health Log Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-red-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Ghi Nhận Ca Bệnh & Hồ Sơ Điều Trị</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Chọn vật nuôi bị bệnh *</label>
                  <select
                    value={selectedAnimalId}
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.tagId} - {a.name} ({a.species})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Ngày phát hiện *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Triệu chứng quan sát *</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Sốt cao, bỏ ăn, chảy nước mắt, tiêu chảy..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Chẩn đoán kết luận *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Viêm phổi phức hợp, Viêm vú, Cảm nóng..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Phác đồ điều trị & Thuốc sử dụng *</label>
                <textarea
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Tiêm bắp Florfenicol 1ml/15kg + Anagin hạ sốt + B Complex..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Bác sĩ / Kỹ thuật viên</label>
                  <input
                    type="text"
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tình trạng xử lý</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="Đang điều trị">Đang điều trị</option>
                    <option value="Theo dõi thêm">Theo dõi thêm</option>
                    <option value="Chuyển cách ly">Chuyển cách ly</option>
                    <option value="Đã khỏi">Đã khỏi</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Lưu Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
