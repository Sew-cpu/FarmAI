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
import { MultiAgentView } from './MultiAgentView';

export const AiAdvisorView: React.FC = () => {
  const {
    animals,
    barns,
    tasks,
    inventory,
    addInventoryItem,
    addBatchTasks,
    setActiveTab,
    aiPromptPrefill,
    setAiPromptPrefill,
  } = useFarm();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'multi-agent' | 'scheduler' | 'diagnose'>('chat');

  // Chat state
  const [chatMode, setChatMode] = useState<'multi-agent' | 'clinical'>('clinical');
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'model';
    text: string;
    time: string;
    trace?: any;
  }>>([
    {
      role: 'model',
      text: `👋 **Xin chào bạn! Tôi là AgroVet AI - Cố vấn Thú Y & Chăn Nuôi Trang Trại.**\n\nTôi sẵn sàng trò chuyện và giải đáp mọi câu hỏi của bạn:\n- 🩺 **Chẩn đoán bệnh & Phác đồ điều trị:** Bò chướng hơi dạ cỏ, sốt sữa, viêm vú; heo sốt đỏ, tiêu chảy; gà hen khẹc, cầu trùng...\n- 🌾 **Dinh dưỡng & Vỗ béo:** Cám vỗ béo bò thịt, khoáng premix, công thức phối trộn thức ăn tinh, ủ chua cỏ voi.\n- 📅 **Lịch tiêm phòng & Vắc xin:** Lịch tiêm phòng đầy đủ theo lứa tuổi gia súc, gia cầm.\n- 🧼 **An toàn sinh học & Vệ sinh chuồng trại:** Kỹ thuật phun sát trùng, đệm lót sinh học, khử mùi hôi amoniac.\n\n👉 *Bạn đang muốn hỏi về vấn đề gì hoặc cần tư vấn đàn vật nuôi nào? Hãy nhắn cho tôi nhé!*`,
      time: 'Vừa xong',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [includeFarmContext, setIncludeFarmContext] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedInventoryIndexes, setAppliedInventoryIndexes] = useState<number[]>([]);
  const [appliedScheduleIndexes, setAppliedScheduleIndexes] = useState<number[]>([]);

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
    const getBarnName = (barnId: string) => {
      const b = barns.find((item) => item.id === barnId);
      return b ? b.name : barnId;
    };

    const sickList = animals.filter((a) => a.status === 'sick' || a.status === 'isolated').map((a) => ({
      tagId: a.tagId,
      name: a.name,
      species: a.species,
      breed: a.breed,
      weightKg: a.weightKg,
      status: a.status === 'sick' ? 'Đang ốm (sick)' : 'Đang cách ly (isolated)',
      barn: getBarnName(a.barnId),
      notes: a.notes || 'Không có ghi chú',
      lastCheckup: a.lastCheckupDate || 'Chưa cập nhật',
    }));

    const monitoringList = animals.filter((a) => a.status === 'monitoring').map((a) => ({
      tagId: a.tagId,
      name: a.name,
      species: a.species,
      breed: a.breed,
      weightKg: a.weightKg,
      status: 'Cần theo dõi (monitoring)',
      barn: getBarnName(a.barnId),
      notes: a.notes || 'Không có ghi chú',
      lastCheckup: a.lastCheckupDate || 'Chưa cập nhật',
    }));

    return {
      totalAnimals: animals.length,
      quickStats: {
        totalAnimals: animals.length,
        sickCount: sickList.length,
        monitoringCount: monitoringList.length,
        totalBarns: barns.length,
        lowStockCount: inventory.filter((i) => i.quantity <= i.minThreshold).length,
        pendingTasksCount: tasks.filter((t) => t.status === 'pending').length,
      },
      sickAnimals: sickList,
      monitoringAnimals: monitoringList,
      allAnimals: animals.map((a) => ({
        tagId: a.tagId,
        name: a.name,
        species: a.species,
        breed: a.breed,
        weightKg: a.weightKg,
        status: a.status,
        barn: getBarnName(a.barnId),
        notes: a.notes,
        lastCheckup: a.lastCheckupDate,
        vaccines: a.vaccinationHistory?.map((v) => `${v.vaccineName} (${v.date})`).join(', ') || 'Chưa có',
      })),
      barnsSummary: barns.map((b) => ({
        name: b.name,
        species: b.species,
        count: b.currentCount,
        capacity: b.capacity,
        temp: b.temperature,
        humidity: b.humidity,
        cleanliness: b.cleanliness,
        lastSanitized: b.lastSanitized,
      })),
      lowStockSupplies: inventory
        .filter((i) => i.quantity <= i.minThreshold)
        .map((i) => `${i.name} (còn ${i.quantity} ${i.unit}, định mức ${i.minThreshold} ${i.unit})`),
      pendingTasks: tasks
        .filter((t) => t.status === 'pending')
        .slice(0, 5)
        .map((t) => `[${t.priority}] ${t.title} (hạn: ${t.dueDate})`),
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
      if (chatMode === 'multi-agent') {
        const response = await fetch('/api/ai/multi-agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        const trace = await response.json();
        if (!response.ok) throw new Error(trace.error || 'Lỗi xử lý Multi-Agent System');

        const dec = trace.decisionAgent?.data;
        const protocolText = dec?.clinicalProtocol ? dec.clinicalProtocol.join('\n\n') : '';
        const warningsText = dec?.safetyWarnings ? dec.safetyWarnings.join('\n') : '';
        const summaryText = `${dec?.summary || 'Đã phân tích xong yêu cầu qua 4 tác tử.'}\n\n📋 **Phác đồ can thiệp 4 bước:**\n${protocolText}\n\n${warningsText}`;

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: summaryText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            trace,
          },
        ]);
      } else {
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
        if (!response.ok) throw new Error(data.error || 'Lỗi kết nối máy chủ AI');

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: data.text || 'Tôi đã nhận thông tin nhưng chưa thể tạo câu trả lời chi tiết. Xin hãy thử lại.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
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

  // Add products from chat trace to farm inventory
  const handleChatAddInventory = (trace: any, msgIndex: number) => {
    if (!trace?.decisionAgent?.data?.recommendedProducts) return;
    const products = trace.decisionAgent.data.recommendedProducts;

    products.forEach((item: any) => {
      const p = item.product;
      let mappedCat: any = 'Thức ăn';
      if (p.category === 'Thuốc & Vắc xin') mappedCat = 'Thuốc & Vắc xin';
      else if (p.category === 'Thực phẩm bổ sung') mappedCat = 'Thực phẩm bổ sung';
      else if (p.category === 'Vật tư & Sát trùng') mappedCat = 'Vật tư chuồng trại';

      addInventoryItem({
        name: p.name,
        category: mappedCat,
        quantity: 10,
        unit: p.unit || 'Đơn vị',
        minThreshold: 3,
        costPerUnit: p.priceVnd || 0,
        supplier: p.brand,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    });

    setAppliedInventoryIndexes((prev) => [...prev, msgIndex]);
  };

  // Add tasks from chat trace to farm schedule
  const handleChatAddSchedule = (trace: any, msgIndex: number) => {
    if (!trace?.decisionAgent?.data?.clinicalProtocol) return;
    const protocols = trace.decisionAgent.data.clinicalProtocol;
    const today = new Date();

    const formattedTasks = protocols.map((proto: string, idx: number) => {
      const taskDate = new Date();
      taskDate.setDate(today.getDate() + idx + 1);
      const dateString = taskDate.toISOString().split('T')[0];

      return {
        title: `Phác đồ MAS: ${proto.slice(0, 45)}...`,
        category: (idx === 0 ? 'Kiểm tra sức khỏe' : idx === 1 ? 'Vắc xin' : 'Vệ sinh chuồng') as any,
        dueDate: dateString,
        priority: (idx === 0 || idx === 1 ? 'Khẩn cấp' : 'Cao') as any,
        status: 'pending' as const,
        notes: proto,
        isAiGenerated: true,
      };
    });

    addBatchTasks(formattedTasks);
    setAppliedScheduleIndexes((prev) => [...prev, msgIndex]);
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
                  ? 'bg-white text-emerald-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-emerald-500/30 text-white hover:bg-emerald-500/40 border border-emerald-400/30'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-300" />
              <span>Tư Vấn Thú Y Trực Tuyến</span>
            </button>

            <button
              onClick={() => setActiveSubTab('multi-agent')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'multi-agent'
                  ? 'bg-white text-emerald-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-emerald-500/30 text-white hover:bg-emerald-500/40 border border-emerald-400/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Hệ Thống Đa Tác Tử (TC01-TC10)</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-emerald-400 text-emerald-950 font-extrabold rounded-md">
                Chuẩn Thử Nghiệm
              </span>
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

      {/* Sub Tab 1: Chat Consultation (Tư Vấn Thú Y Trực Tuyến) */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header Bar */}
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-stone-800">Cố Vấn AI Trực Tuyến</span>
              </div>

              {/* Mode Toggle Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-stone-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChatMode('multi-agent')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    chatMode === 'multi-agent'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Chế độ phân tích phối hợp 4 Agent theo chuẩn TC01-TC10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đa Tác Tử (MAS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('clinical')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    chatMode === 'clinical'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Chế độ tư vấn lâm sàng trực tiếp"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Bác Sĩ Lâm Sàng</span>
                </button>
              </div>
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
                  Đính kèm dữ liệu trang trại ({animals.length} con, {barns.length} chuồng)
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
              const hasTrace = !!msg.trace;
              const isInventoryAdded = appliedInventoryIndexes.includes(index);
              const isScheduleAdded = appliedScheduleIndexes.includes(index);

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

                  <div className="group relative w-full">
                    <div
                      className={`p-4 rounded-2xl shadow-xs whitespace-pre-wrap ${
                        isAi
                          ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs'
                          : 'bg-emerald-600 text-white rounded-tr-xs'
                      }`}
                    >
                      {msg.text}

                      {/* Interactive Multi-Agent Trace Details Card */}
                      {hasTrace && msg.trace?.decisionAgent?.data?.recommendedProducts && (
                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
                          {/* 4 Agent Pipeline Badges */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-900">
                              <div className="font-bold flex items-center gap-1 text-[10px] text-blue-700 uppercase">
                                <span>🎯 1. Yêu Cầu</span>
                              </div>
                              <div className="font-semibold mt-0.5 truncate">
                                {msg.trace.requirementAgent?.data?.target_species || 'Vật nuôi'}
                              </div>
                              <div className="text-[10px] text-blue-600 truncate">
                                {msg.trace.requirementAgent?.data?.brand_preference || 'Mọi hãng'}
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-900">
                              <div className="font-bold flex items-center gap-1 text-[10px] text-purple-700 uppercase">
                                <span>🔍 2. Tra Cứu</span>
                              </div>
                              <div className="font-semibold mt-0.5 truncate">SQL An Toàn</div>
                              <div className="text-[10px] text-purple-600 truncate">
                                Độ khớp:{' '}
                                {(
                                  (msg.trace.searchAgent?.data?.semanticVectorHits?.[0]?.similarityScore || 0) * 100
                                ).toFixed(0)}
                                %
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900">
                              <div className="font-bold flex items-center gap-1 text-[10px] text-amber-700 uppercase">
                                <span>⚖️ 3. Thẩm Định</span>
                              </div>
                              <div className="font-semibold mt-0.5">
                                {msg.trace.criticAgent?.data?.score || 90}/100
                              </div>
                              <div className="text-[10px] text-amber-600">
                                Thử lại: {msg.trace.criticAgent?.data?.retryCount || 0} lần
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900">
                              <div className="font-bold flex items-center gap-1 text-[10px] text-emerald-700 uppercase">
                                <span>📋 4. Quyết Định</span>
                              </div>
                              <div className="font-semibold mt-0.5 truncate">
                                {msg.trace.decisionAgent?.data?.recommendedProducts?.length || 0} sản phẩm
                              </div>
                              <div className="text-[10px] text-emerald-600">
                                {(msg.trace.decisionAgent?.data?.totalCostVnd || 0).toLocaleString('vi-VN')} đ
                              </div>
                            </div>
                          </div>

                          {/* Recommended Products Mini Cards */}
                          <div className="space-y-2 mt-2">
                            <div className="text-[11px] font-bold text-stone-700">
                              Sản phẩm chỉ định trong đơn:
                            </div>
                            {msg.trace.decisionAgent.data.recommendedProducts.map(
                              (item: any, pIdx: number) => (
                                <div
                                  key={pIdx}
                                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0">
                                    <div className="font-bold text-stone-900 truncate">
                                      {item.product.name}
                                    </div>
                                    <div className="text-[11px] text-stone-500 flex items-center gap-2">
                                      <span className="font-semibold text-emerald-700">
                                        {item.product.brand}
                                      </span>
                                      <span>•</span>
                                      <span>{item.dosageGuide}</span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-extrabold text-stone-900">
                                      {item.product.priceVnd.toLocaleString('vi-VN')} đ
                                    </div>
                                    <div className="text-[10px] text-stone-400">
                                      {item.product.unit}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Action Buttons to Farm */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              onClick={() => handleChatAddInventory(msg.trace, index)}
                              disabled={isInventoryAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isInventoryAdded
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {isInventoryAdded ? 'Đã thêm vào Kho FarmPro' : 'Thêm vào Kho Vật Tư'}
                              </span>
                            </button>

                            <button
                              onClick={() => handleChatAddSchedule(msg.trace, index)}
                              disabled={isScheduleAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isScheduleAdded
                                  ? 'bg-blue-100 text-blue-800 cursor-default'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {isScheduleAdded
                                  ? 'Đã lập lịch chăm sóc'
                                  : 'Lập lịch phác đồ chăm sóc'}
                              </span>
                            </button>

                            <button
                              onClick={() => setActiveSubTab('multi-agent')}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 flex items-center gap-1 ml-auto"
                            >
                              <span>Mở giao diện MAS</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
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

      {/* Sub Tab 2: Multi-Agent System (Hệ Thống Đa Tác Tử) */}
      {activeSubTab === 'multi-agent' && <MultiAgentView />}

      {/* Sub Tab 3: AI Schedule Generator */}
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
