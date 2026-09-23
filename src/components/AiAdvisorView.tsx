import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Calendar,
  AlertOctagon,
  RefreshCw,
  Plus,
  CheckCircle2,
  Copy,
  Check,
  Stethoscope,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export const AiAdvisorView: React.FC = () => {
  const {
    animals,
    barns,
    tasks,
    inventory,
    addBatchTasks,
    setActiveTab,
    aiPromptPrefill,
    setAiPromptPrefill,
  } = useFarm();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'scheduler' | 'diagnose'>('chat');

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string; time: string }>>([
    {
      role: 'model',
      text: `Xin chào! Tôi là **AgroVet AI** - Trợ lý Thú Y & Quản Lý Trang Trại Nông Nghiệp Thông Minh.\n\nTôi có thể giúp bạn:\n- 🩺 **Chẩn đoán sơ bộ** triệu chứng bệnh ở gia súc, gia cầm (Bò, Heo, Gà, Dê...)\n- 📅 **Lập lịch tiêm phòng** vắc xin, tẩy giun sán và chăm sóc định kỳ\n- 🌾 **Tư vấn dinh dưỡng**, phối trộn thức ăn và cân bằng khẩu phần\n- 🧼 **Quy trình an toàn sinh học**, khử trùng chuồng trại và xử lý môi trường\n\nBạn đang quan tâm đến vấn đề gì hôm nay?`,
      time: 'Vừa xong',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [includeFarmContext, setIncludeFarmContext] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scheduler state
  const [schedSpecies, setSchedSpecies] = useState('Bò thịt');
  const [schedStage, setSchedStage] = useState('Giai đoạn vỗ béo (14 - 18 tháng tuổi)');
  const [schedNotes, setSchedNotes] = useState('Tối ưu hóa tăng trưởng cân nặng, phòng ngừa chướng hơi dạ cỏ và ký sinh trùng đường máu');
  const [isGeneratingSched, setIsGeneratingSched] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{ summary: string; tasks: any[] } | null>(null);
  const [schedApplied, setSchedApplied] = useState(false);

  // Diagnostic state
  const [diagSpecies, setDiagSpecies] = useState('Heo/Lợn');
  const [diagSymptoms, setDiagSymptoms] = useState('Sốt cao, bỏ ăn, da đỏ ửng vùng tai và bụng, thở dốc');
  const [diagFever, setDiagFever] = useState(true);
  const [diagAppetite, setDiagAppetite] = useState('Bỏ ăn hoàn toàn');
  const [diagDays, setDiagDays] = useState('2 ngày');
  const [diagCount, setDiagCount] = useState('3 con trong đàn');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);

  // Handle prefilled prompt from other tabs (e.g. from Animals list "Khám bệnh với AI")
  useEffect(() => {
    if (aiPromptPrefill) {
      setInputMessage(aiPromptPrefill);
      setAiPromptPrefill('');
      setActiveSubTab('chat');
    }
  }, [aiPromptPrefill, setAiPromptPrefill]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSubTab]);

  // Construct current farm summary for AI context
  const getFarmContextPayload = () => {
    return {
      totalAnimals: animals.length,
      animalsSummary: animals.map((a) => ({
        tag: a.tagId,
        species: a.species,
        breed: a.breed,
        weight: a.weightKg,
        status: a.status,
        notes: a.notes,
      })),
      sickAnimals: animals.filter((a) => a.status === 'sick' || a.status === 'isolated'),
      barnsSummary: barns.map((b) => ({
        name: b.name,
        species: b.species,
        count: b.currentCount,
        temp: b.temperature,
        humidity: b.humidity,
        cleanliness: b.cleanliness,
      })),
      lowStockSupplies: inventory.filter((i) => i.quantity <= i.minThreshold).map((i) => i.name),
    };
  };

  // Quick Prompt Pills
  const quickPrompts = [
    'Bò sữa bị sưng một bên bầu vú, sốt nhẹ và sữa vón cục, xử lý sao?',
    'Heo con 25 ngày tuổi bị tiêu chảy phân trắng, phác đồ điều trị?',
    'Lịch tiêm phòng đầy đủ cho gà thả vườn từ 1 đến 60 ngày tuổi',
    'Chuồng gà có mùi khai amoniac nồng nặc, cách xử lý an toàn?',
    'Khẩu phần dinh dưỡng tăng cân nhanh cho bò thịt giai đoạn vỗ béo',
    'Dấu hiệu phân biệt giữa Dịch tả heo Châu Phi (ASF) và Tai xanh (PRRS)',
  ];

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoadingChat) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          farmContext: includeFarmContext ? getFarmContextPayload() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi kết nối máy chủ AI');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.text || 'Tôi đã nhận thông tin nhưng chưa thể tạo câu trả lời chi tiết. Xin hãy thử lại.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ Xin lỗi, đã xảy ra lỗi kết nối với máy chủ AI (${err.message || 'Lỗi mạng'}). Bạn có thể thử gửi lại câu hỏi.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Generate schedule via AI
  const handleGenerateSchedule = async () => {
    setIsGeneratingSched(true);
    setSchedApplied(false);
    try {
      const res = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species: schedSpecies,
          stage: schedStage,
          targetNotes: schedNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tạo lịch');
      setGeneratedPlan(data);
    } catch (err: any) {
      alert(`Không thể tạo lịch trình bằng AI: ${err.message}`);
    } finally {
      setIsGeneratingSched(false);
    }
  };

  // Apply generated schedule tasks to farm tasks list!
  const handleApplyScheduleToFarm = () => {
    if (!generatedPlan?.tasks || generatedPlan.tasks.length === 0) return;

    const today = new Date();
    const formattedTasks = generatedPlan.tasks.map((t: any) => {
      const taskDate = new Date();
      taskDate.setDate(today.getDate() + (t.daysFromNow || 1));
      const dateString = taskDate.toISOString().split('T')[0];

      return {
        title: t.title,
        category: (t.category as any) || 'Khác',
        dueDate: dateString,
        priority: (t.priority as any) || 'Trung bình',
        status: 'pending' as const,
        notes: `${t.description || ''} | Lưu ý thú y: ${t.advice || ''}`,
        isAiGenerated: true,
      };
    });

    addBatchTasks(formattedTasks);
    setSchedApplied(true);
  };

  // Run AI diagnosis
  const handleRunDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species: diagSpecies,
          symptoms: diagSymptoms,
          fever: diagFever,
          appetite: diagAppetite,
          days: diagDays,
          affectedCount: diagCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi chẩn đoán');
      setDiagnosisResult(data);
    } catch (err: any) {
      alert(`Lỗi phân tích bệnh: ${err.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Bot className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-emerald-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Trợ Lý AI Thú Y & Chăn Nuôi Toàn Diện
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            AgroVet AI: Cố Vấn Trang Trại Thông Minh
          </h2>
          <p className="text-emerald-100 text-xs mt-1 leading-relaxed">
            Hỗ trợ chẩn đoán sức khỏe đàn vật nuôi, tư vấn phòng trừ dịch bệnh, xây dựng khẩu phần dinh dưỡng và tự động lập lịch trình tiêm phòng tiêu chuẩn.
          </p>

          {/* Sub Tab Switcher */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'chat'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Bot className="w-4 h-4" />
              Tư Vấn Thú Y Trực Tuyến
            </button>

            <button
              onClick={() => setActiveSubTab('scheduler')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'scheduler'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Lập Lịch Chăm Sóc Tự Động
            </button>

            <button
              onClick={() => setActiveSubTab('diagnose')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'diagnose'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              Chẩn Đoán Bệnh Khẩn Cấp
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab 1: Chat Consultation */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header Bar */}
          <div className="px-6 py-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-800">Bác sĩ Thú Y AI Trực Tuyến</span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-500">Mô hình: Gemini 3.8 Flash</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700">
                <input
                  type="checkbox"
                  checked={includeFarmContext}
                  onChange={(e) => setIncludeFarmContext(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium">
                  Đính kèm dữ liệu thực tế trang trại ({animals.length} con, {barns.length} chuồng)
                </span>
              </label>

              <button
                onClick={() =>
                  setMessages([
                    {
                      role: 'model',
                      text: 'Cuộc trò chuyện đã được làm mới. Tôi sẵn sàng giải đáp thắc mắc tiếp theo của bạn!',
                      time: 'Vừa xong',
                    },
                  ])
                }
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2 bg-stone-100/70 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="font-semibold text-stone-500 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Gợi ý nhanh:
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 shrink-0 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/40">
            {messages.map((msg, index) => {
              const isAi = msg.role === 'model';
              return (
                <div
                  key={index}
                  className={`flex gap-3 text-xs leading-relaxed max-w-3xl ${
                    isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                      isAi
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-800 text-white shadow-sm'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : 'Tôi'}
                  </div>

                  <div className="group relative">
                    <div
                      className={`p-4 rounded-2xl shadow-xs whitespace-pre-wrap ${
                        isAi
                          ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs'
                          : 'bg-emerald-600 text-white rounded-tr-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div
                      className={`flex items-center gap-2 mt-1 text-[10px] text-stone-400 ${
                        isAi ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isAi && (
                        <button
                          onClick={() => copyToClipboard(msg.text, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-700"
                          title="Sao chép nội dung"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoadingChat && (
              <div className="flex gap-3 text-xs mr-auto max-w-2xl animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-2xl rounded-tl-xs text-stone-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  AgroVet AI đang phân tích dữ liệu thú y và tạo lời khuyên...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi về bệnh vật nuôi, vắc xin, dinh dưỡng chuồng trại..."
                className="flex-1 px-4 py-3 border border-stone-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-stone-50/50"
                disabled={isLoadingChat}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoadingChat}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center gap-1.5 text-xs"
              >
                <span>Gửi</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub Tab 2: AI Schedule Generator */}
      {activeSubTab === 'scheduler' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Tham Số Lập Lịch Tự Động
              </h3>
              <p className="text-stone-500 text-[11px] mt-0.5">
                AI sẽ tạo quy trình tiêm phòng và chăm sóc khoa học
              </p>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Loài vật nuôi</label>
              <select
                value={schedSpecies}
                onChange={(e) => setSchedSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Bò thịt">Bò thịt (Angus, 3B, Senepol)</option>
                <option value="Bò sữa">Bò sữa (Holstein Friesian)</option>
                <option value="Heo thịt">Heo thịt (Duroc, Landrace)</option>
                <option value="Heo nái sinh sản">Heo nái sinh sản</option>
                <option value="Gà đẻ trứng">Gà đẻ trứng (Ai Cập, Isa Brown)</option>
                <option value="Gà thả vườn">Gà thả vườn / Gà thịt</option>
                <option value="Dê thịt & sữa">Dê (Bách Thảo, Boer)</option>
                <option value="Vịt siêu thịt">Vịt siêu nạc / Vịt xiêm</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Giai đoạn phát triển</label>
              <input
                type="text"
                value={schedStage}
                onChange={(e) => setSchedStage(e.target.value)}
                placeholder="Ví dụ: Giai đoạn vỗ béo, Úm gà con 1-30 ngày..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Yêu cầu & Ghi chú riêng</label>
              <textarea
                rows={4}
                value={schedNotes}
                onChange={(e) => setSchedNotes(e.target.value)}
                placeholder="Ví dụ: Định hướng nuôi VietGAP, chống stress nhiệt mùa hè, lịch vắc xin cơ bản..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleGenerateSchedule}
              disabled={isGeneratingSched}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingSched ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI Đang Lập Lịch Trình...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Khởi Tạo Lịch Trình Bằng AI
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Kế Hoạch Chăm Sóc Do AI Đề Xuất</h3>
                <p className="text-xs text-stone-500">
                  {generatedPlan ? 'Đã tạo phác đồ thành công' : 'Chưa có kế hoạch nào được tạo'}
                </p>
              </div>

              {generatedPlan && (
                <button
                  onClick={handleApplyScheduleToFarm}
                  disabled={schedApplied}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                    schedApplied
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {schedApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Đã Thêm Vào Lịch Trang Trại!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Áp Dụng Vào Lịch Trình Trang Trại
                    </>
                  )}
                </button>
              )}
            </div>

            {generatedPlan ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Tổng quan chuyên gia: </span>
                    {generatedPlan.summary}
                  </div>
                </div>

                <div className="space-y-3">
                  {generatedPlan.tasks.map((task: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-emerald-300 transition-all text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {task.category}
                          </span>
                          <h4 className="font-bold text-stone-900">{task.title}</h4>
                        </div>
                        <span className="text-[11px] font-semibold text-stone-500">
                          {task.frequency}
                        </span>
                      </div>

                      <p className="text-stone-700 leading-relaxed">{task.description}</p>

                      {task.advice && (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900 font-medium">
                          💡 <strong>Khuyến nghị bác sĩ:</strong> {task.advice}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {schedApplied && (
                  <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-between text-xs">
                    <span>
                      Toàn bộ các mục trên đã được lưu vào hệ thống lịch trình trang trại của bạn.
                    </span>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="px-3 py-1.5 bg-white text-emerald-800 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
                    >
                      Xem lịch trình ngay →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
                <Calendar className="w-12 h-12 text-stone-300 stroke-1" />
                <p className="text-xs font-medium text-stone-600">
                  Chọn loài vật nuôi và giai đoạn ở khung bên trái rồi bấm "Khởi Tạo Lịch Trình Bằng AI"
                </p>
                <p className="text-[11px] text-stone-400">
                  AI sẽ lập lịch tiêm phòng, bổ sung khoáng chất, sát trùng chuồng và chăm sóc toàn diện
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Emergency Diagnosis */}
      {activeSubTab === 'diagnose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Triage Form */}
          <form
            onSubmit={handleRunDiagnosis}
            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 text-xs"
          >
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-red-600" />
                Phiếu Khám Triệu Chứng Bệnh
              </h3>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Nhập các biểu hiện bất thường để AI đưa ra chẩn đoán phân biệt
              </p>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Loài vật nuôi bị bệnh</label>
              <select
                value={diagSpecies}
                onChange={(e) => setDiagSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Bò">Bò (Bò sữa / Bò thịt)</option>
                <option value="Heo/Lợn">Heo / Lợn</option>
                <option value="Gà">Gà (Gà đẻ / Gà thịt)</option>
                <option value="Dê">Dê / Cừu</option>
                <option value="Vịt">Vịt / Ngan</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Triệu chứng quan sát được *</label>
              <textarea
                rows={3}
                value={diagSymptoms}
                onChange={(e) => setDiagSymptoms(e.target.value)}
                placeholder="Ví dụ: Bỏ ăn, sốt cao, thở khò khè, mắt đỏ, đi ngoài phân lỏng màu xám..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tình trạng ăn uống</label>
                <select
                  value={diagAppetite}
                  onChange={(e) => setDiagAppetite(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Bỏ ăn hoàn toàn">Bỏ ăn hoàn toàn</option>
                  <option value="Ăn kém, mệt mỏi">Ăn kém, mệt mỏi</option>
                  <option value="Vẫn ăn bình thường">Vẫn ăn bình thường</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Thời gian phát bệnh</label>
                <input
                  type="text"
                  value={diagDays}
                  onChange={(e) => setDiagDays(e.target.value)}
                  placeholder="2 ngày, 5 ngày..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="feverCheck"
                checked={diagFever}
                onChange={(e) => setDiagFever(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <label htmlFor="feverCheck" className="text-stone-700 font-semibold cursor-pointer">
                Vật nuôi có sốt nóng / tai lạnh / run rẩy
              </label>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Số lượng con bị ảnh hưởng</label>
              <input
                type="text"
                value={diagCount}
                onChange={(e) => setDiagCount(e.target.value)}
                placeholder="1 con, 5 con trong đàn 50 con..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isDiagnosing}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI Đang Phân Tích Triệu Chứng...
                </>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4" />
                  Chẩn Đoán Bệnh & Hướng Xử Lý
                </>
              )}
            </button>
          </form>

          {/* Diagnosis Results */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Kết Quả Phân Tích Bệnh Thú Y</h3>
              <p className="text-xs text-stone-500">
                {diagnosisResult ? 'Chẩn đoán phân biệt từ chuyên gia AI' : 'Vui lòng gửi phiếu triệu chứng'}
              </p>
            </div>

            {diagnosisResult ? (
              <div className="space-y-4 text-xs">
                {/* Warning Banner */}
                {diagnosisResult.warningNote && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-900 flex items-start gap-2.5">
                    <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">CẢNH BÁO AN TOÀN SINH HỌC: </span>
                      {diagnosisResult.warningNote}
                    </div>
                  </div>
                )}

                {/* Probable Diseases */}
                <div>
                  <h4 className="font-bold text-stone-900 mb-2.5">Các Bệnh Khả Nghi Cao Nhất:</h4>
                  <div className="space-y-2.5">
                    {diagnosisResult.probableDiseases?.map((d: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800">
                              Mức độ: {d.severity}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Xác suất ~{d.probabilityPercent}%
                            </span>
                          </div>
                        </div>
                        <p className="text-stone-600">{d.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Urgent Actions */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    Hành Động Cần Làm Ngay Lập Tức:
                  </h4>
                  <ul className="space-y-1.5 pl-5 list-disc text-amber-950">
                    {diagnosisResult.urgentActions?.map((act: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Meds */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    Thuốc & Hóa Chất Hỗ Trợ Đề Xuất:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {diagnosisResult.recommendedMeds?.map((med: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-white border border-stone-200 text-stone-800 font-medium"
                      >
                        💊 {med}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
                <Stethoscope className="w-12 h-12 text-stone-300 stroke-1" />
                <p className="text-xs font-medium text-stone-600">
                  Điền các triệu chứng bệnh của gia súc, gia cầm ở khung bên trái
                </p>
                <p className="text-[11px] text-stone-400">
                  Bác sĩ AI sẽ phân tích các ca bệnh nghi nhiễm và đưa ra biện pháp cách ly, điều trị kịp thời
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
