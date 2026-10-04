import React, { useState } from 'react';
import {
  FileCode2,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Clock,
  Send,
  PlusCircle,
  Lightbulb,
  FileCheck,
  ShieldCheck,
  Bug,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface DecomposedTask {
  id: string;
  category: 'Backend / Database' | 'Frontend / UI' | 'Security & Integration' | 'Testing & QA';
  title: string;
  description: string;
  definitionOfDone: string;
  estimatedHours: number;
}

interface AnalysisData {
  rawRequirement: string;
  overview: {
    coreGoal: string;
    scope: string;
  };
  ambiguities: Array<{
    aspect: string;
    unclearPoint: string;
    proposedSolution: string;
  }>;
  markdownReport: string;
  decomposedTasks: DecomposedTask[];
  timestamp: string;
  executionTimeMs: number;
}

const SAMPLE_REQUIREMENTS = [
  {
    title: 'Hệ thống IoT Giám Sát Chuồng Trại',
    category: 'Nông Nghiệp Thông Minh',
    text: 'Xây dựng hệ thống giám sát nhiệt độ và độ ẩm chuồng trại bằng cảm biến IoT, tự động kích hoạt giàn phun sương làm mát khi nhiệt độ vượt 32°C và cảnh báo khẩn cấp qua SMS/Zalo cho chủ trại.',
  },
  {
    title: 'Đăng Nhập Sinh Trắc Học & OTP Zalo',
    category: 'Mẫu Đề Bài SDLC',
    text: 'Thêm tính năng đăng nhập bằng sinh trắc học (Fingerprint/FaceID) và gửi mã OTP xác thực qua Zalo cho ứng dụng di động ngân hàng, hỗ trợ khôi phục tài khoản khi mất thiết bị.',
  },
  {
    title: 'Dự Báo Tồn Kho Thức Ăn & Vắc Xin',
    category: 'Quản Lý Kho Vận',
    text: 'Quản lý tồn kho thức ăn và dược phẩm thú y, tự động phân tích tốc độ tiêu thụ theo quy mô đàn gia súc và gửi đề xuất đặt hàng trước 5 ngày khi chạm ngưỡng an toàn.',
  },
];

export const RequirementsAgentView: React.FC = () => {
  const { addBatchTasks, barns } = useFarm();

  const [inputRequirement, setInputRequirement] = useState(SAMPLE_REQUIREMENTS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedTasksSuccess, setAddedTasksSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'ambiguities' | 'tasks'>('report');

  const handleRunAnalysis = async (customText?: string) => {
    const textToRun = customText || inputRequirement;
    if (!textToRun.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAddedTasksSuccess(false);

    try {
      const res = await fetch('/api/ai/requirements-agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: textToRun }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi phân tích Requirements Agent');
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Requirements Agent Error:', err);
      alert(err.message || 'Lỗi kết nối với Requirements Agent');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportTasksToFarm = () => {
    if (!analysisResult || !analysisResult.decomposedTasks.length) return;

    const targetBarnId = barns[0]?.id || 'barn-01';
    const newTasks = analysisResult.decomposedTasks.map((t, idx) => ({
      title: `[${t.category}] ${t.title}`,
      description: `${t.description}\n\nTiêu chí hoàn thành (DoD): ${t.definitionOfDone}`,
      assignedTo: 'Đội Kỹ Thuật FarmPro',
      priority: idx === 0 ? ('Cao' as const) : ('Trung bình' as const),
      category: 'Khác' as const,
      barnId: targetBarnId,
      dueDate: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending' as const,
    }));

    addBatchTasks(newTasks);
    setAddedTasksSuccess(true);
    setTimeout(() => setAddedTasksSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 shadow-xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <FileCode2 className="w-3.5 h-3.5" />
              <span>AI-Augmented SDLC: Requirements Engineering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              AI Requirements Agent
              <span className="text-xs px-2.5 py-1 bg-indigo-400 text-indigo-950 font-black rounded-lg uppercase tracking-wide">
                Senior BA & Architect
              </span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tiếp nhận yêu cầu thô (Raw Requirement), tự động bóc tách mục tiêu cốt lõi, phát hiện điểm mập mờ (Ambiguities), dự báo rủi ro kỹ thuật và phân rã cây công việc (Task Decomposition) theo chuẩn Definition of Done (DoD).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-[11px] text-slate-300 font-medium">Quy Trình Chuẩn</div>
              <div className="text-lg font-bold text-indigo-300">4 Bước BA</div>
              <div className="text-[10px] text-slate-400">Tóm tắt - Rủi ro - Giải pháp - Phân rã</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-[11px] text-slate-300 font-medium">Tích Hợp Sẵn</div>
              <div className="text-lg font-bold text-emerald-300">1-Chạm Sync</div>
              <div className="text-[10px] text-slate-400">Đồng bộ lịch trang trại</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input & Sample Requirements Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            Chọn Yêu Cầu Mẫu Thử Nghiệm Nhanh
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_REQUIREMENTS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputRequirement(s.text);
                  handleRunAnalysis(s.text);
                }}
                className="text-left p-3.5 rounded-2xl border border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-indigo-600 mb-1">
                  <span>{s.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold mb-1.5">{s.category}</div>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{s.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="req-input" className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
              Nhập Yêu Cầu Tính Năng Thô (Raw Requirement)
            </label>
            <span className="text-[11px] text-stone-400">Hỗ trợ tiếng Việt hoặc tiếng Anh</span>
          </div>
          <textarea
            id="req-input"
            rows={4}
            value={inputRequirement}
            onChange={(e) => setInputRequirement(e.target.value)}
            placeholder="Mô tả sơ bộ tính năng hoặc bài toán bạn muốn hệ thống phân tích..."
            className="w-full rounded-2xl border border-stone-200 p-4 text-sm text-stone-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none leading-relaxed bg-stone-50/50"
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AI Requirements Agent sẵn sàng phân tích</span>
          </div>

          <button
            type="button"
            disabled={isAnalyzing || !inputRequirement.trim()}
            onClick={() => handleRunAnalysis()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center gap-2.5 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang Phân Tích & Phân Rã SDLC...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Phân Tích Nghiệp Vụ Bằng AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-fade-in">
          {/* Result Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã Phân Tích Thành Công
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                Hồ Sơ Đặc Tả Yêu Cầu Kỹ Thuật (SRS & SDLC Spec)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Thời gian xử lý: <strong>{analysisResult.executionTimeMs} ms</strong> • Phân rã:{' '}
                <strong>{analysisResult.decomposedTasks.length} tác vụ cụ thể</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã Sao Chép' : 'Sao Chép Báo Cáo'}</span>
              </button>

              <button
                type="button"
                onClick={handleImportTasksToFarm}
                disabled={addedTasksSuccess}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                {addedTasksSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã Thêm Vào Lịch Trình!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Thêm Tasks Vào Trang Trại</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Báo Cáo Toàn Diện (Markdown)
            </button>
            <button
              onClick={() => setActiveTab('ambiguities')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'ambiguities'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-amber-300" />
              Điểm Mập Mờ & Ngoại Lệ ({analysisResult.ambiguities.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              Cây Phân Rã Công Việc ({analysisResult.decomposedTasks.length})
            </button>
          </div>

          {/* Tab 1: Markdown Report */}
          {activeTab === 'report' && (
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-stone-800 leading-relaxed font-normal">
                {analysisResult.markdownReport}
              </pre>
            </div>
          )}

          {/* Tab 2: Ambiguities & Edge Cases */}
          {activeTab === 'ambiguities' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
                <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Phân tích Điểm Mập Mờ (Ambiguity Analysis):</strong> AI Requirements Agent đóng vai trò Senior BA đã rà soát và phát hiện các rủi ro kỹ thuật tiềm ẩn cần làm rõ trước khi bắt đầu lập trình.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.ambiguities.map((a, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{a.aspect}</span>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">Điểm chưa rõ:</div>
                      <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{a.unclearPoint}</p>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Giải pháp đề xuất:</div>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{a.proposedSolution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Tasks Decomposition Tree */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs leading-relaxed flex items-start gap-3">
                <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Cây Phân Rã Công Việc (Task Decomposition Tree):</strong> Các nhiệm vụ được chuẩn hóa theo phân hệ, quy định rõ mục tiêu và Tiêu chí Hoàn Thành (Definition of Done - DoD) sẵn sàng phân công cho lập trình viên.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.decomposedTasks.map((t) => (
                  <div key={t.id} className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-stone-100 text-stone-700">
                        {t.category}
                      </span>
                      <span className="text-xs text-stone-400 font-mono font-bold">~{t.estimatedHours}h</span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <span className="text-indigo-600">{t.id}:</span>
                      {t.title}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed">{t.description}</p>

                    <div className="pt-2.5 border-t border-stone-100 flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>DoD:</strong> {t.definitionOfDone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
