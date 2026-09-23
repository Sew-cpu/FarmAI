import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  X,
  Save,
  Filter,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { CareTask } from '../types/farm';

export const ScheduleView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted, setActiveTab } = useFarm();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CareTask | null>(null);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<CareTask['category']>('Vắc xin');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<CareTask['priority']>('Cao');
  const [taskAssignedTo, setTaskAssignedTo] = useState('BS. Nguyễn Mai Lan');
  const [taskNotes, setTaskNotes] = useState('');

  const handleOpenAdd = () => {
    setTaskTitle('');
    setTaskCategory('Vắc xin');
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    setTaskPriority('Cao');
    setTaskAssignedTo('BS. Nguyễn Mai Lan');
    setTaskNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: CareTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskCategory(task.category);
    setTaskDueDate(task.dueDate);
    setTaskPriority(task.priority);
    setTaskAssignedTo(task.assignedTo || '');
    setTaskNotes(task.notes || '');
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskTitle,
        category: taskCategory,
        dueDate: taskDueDate,
        priority: taskPriority,
        assignedTo: taskAssignedTo,
        notes: taskNotes,
      });
      setEditingTask(null);
    } else {
      addTask({
        title: taskTitle,
        category: taskCategory,
        dueDate: taskDueDate,
        priority: taskPriority,
        status: 'pending',
        assignedTo: taskAssignedTo,
        notes: taskNotes,
        isAiGenerated: false,
      });
      setIsAddModalOpen(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            Lịch Trình Chăm Sóc & Tiêm Phòng
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {pendingCount} công việc cần làm, {completedCount} đã hoàn thành
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Generator trigger */}
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tạo Lịch Tự Động Bằng AI
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm Việc Mới
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tất cả danh mục
          </button>
          <button
            onClick={() => setFilterCategory('Vắc xin')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterCategory === 'Vắc xin'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            💉 Vắc xin & Thú y
          </button>
          <button
            onClick={() => setFilterCategory('Cho ăn & Dinh dưỡng')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterCategory === 'Cho ăn & Dinh dưỡng'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🌾 Cho ăn & Dinh dưỡng
          </button>
          <button
            onClick={() => setFilterCategory('Vệ sinh chuồng')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterCategory === 'Vệ sinh chuồng'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🧼 Vệ sinh & Khử trùng
          </button>
          <button
            onClick={() => setFilterCategory('Kiểm tra sức khỏe')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterCategory === 'Kiểm tra sức khỏe'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🩺 Khám sức khỏe
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              filterStatus === 'all' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              filterStatus === 'pending'
                ? 'bg-blue-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Chưa xong ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Đã xong ({completedCount})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-xs ${
                  isDone
                    ? 'bg-stone-50 border-stone-200 opacity-75'
                    : 'bg-white border-stone-200 hover:border-emerald-300 shadow-xs'
                }`}
              >
                {/* Complete checkbox */}
                <button
                  type="button"
                  onClick={() => toggleTaskCompleted(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-stone-300 hover:border-emerald-500 bg-white'
                  }`}
                  title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </button>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-bold text-sm ${
                        isDone ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {task.title}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                      {task.category}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === 'Cao'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Trung bình'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Ưu tiên: {task.priority}
                    </span>

                    {task.isAiGenerated && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Gợi ý
                      </span>
                    )}
                  </div>

                  {task.notes && (
                    <p className={`text-stone-600 ${isDone ? 'line-through text-stone-400' : ''}`}>
                      {task.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-400 pt-0.5">
                    <span className="flex items-center gap-1 font-medium text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      Ngày thực hiện: {task.dueDate}
                    </span>
                    {task.assignedTo && (
                      <span>Người phụ trách: <strong className="text-stone-700">{task.assignedTo}</strong></span>
                    )}
                  </div>
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    title="Chỉnh sửa công việc"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn muốn xóa công việc: "${task.title}"?`)) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-stone-400 text-xs">
            Không tìm thấy công việc nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Task */}
      {(isAddModalOpen || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingTask ? 'Cập Nhật Lịch Trình' : 'Thêm Công Việc Chăm Sóc Mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTask(null);
                }}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tên công việc *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Tiêm vắc xin LMLM, Phun thuốc sát trùng, Cân đo đàn heo..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Phân loại</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Vắc xin">Vắc xin</option>
                    <option value="Cho ăn & Dinh dưỡng">Cho ăn & Dinh dưỡng</option>
                    <option value="Vệ sinh chuồng">Vệ sinh chuồng</option>
                    <option value="Kiểm tra sức khỏe">Kiểm tra sức khỏe</option>
                    <option value="Điều trị">Điều trị</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cao">Cao</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Thấp">Thấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Hạn thực hiện *</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Người phụ trách</label>
                  <input
                    type="text"
                    value={taskAssignedTo}
                    onChange={(e) => setTaskAssignedTo(e.target.value)}
                    placeholder="BS. Lan, Kỹ sư Minh..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Hướng dẫn / Ghi chú</label>
                <textarea
                  rows={3}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Ghi chú liều lượng thuốc, cách pha sát trùng, lưu ý bảo hộ..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTask(null);
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
                  {editingTask ? 'Cập Nhật' : 'Lưu Công Việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
