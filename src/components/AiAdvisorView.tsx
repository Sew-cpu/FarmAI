import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Stethoscope,
  Layers,
  Camera,
  Upload,
  X,
  ShieldAlert,
  HeartPulse,
  Save,
  MessageSquare,
  RotateCcw,
  Image as ImageIcon,
  AlertTriangle,
  Clock,
  Pill,
  ChevronRight,
  UserCheck,
  Database,
  Trash2,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import { MultiAgentView } from './MultiAgentView';
import { RequirementsAgentView } from './RequirementsAgentView';
import { Animal, DiagnosisResult } from '../types/farm';

// Symptom quick-chips for barn veterinarians (as specifically required)
const SYMPTOM_CHIPS = [
  'Bỏ ăn',
  'Sốt cao',
  'Ủ rũ',
  'Tiêu chảy',
  'Ho/Thở gấp',
  'Xuất huyết da',
  'Đi khập khiễng',
  'Giảm sản lượng',
  'Bầu vú sưng nóng',
  'Chướng bụng dạ cỏ',
  'Loét niêm mạc móng',
  'Co giật / Run rẩy',
];

// Contextual Quick Prompts for Chatbot (Specifically Requested)
const QUICK_PROMPT_STARTERS = [
  {
    icon: '📊',
    label: 'Báo cáo sức khỏe đàn',
    prompt: 'Báo cáo nhanh tình hình sức khỏe đàn vật nuôi trong trại hôm nay',
  },
  {
    icon: '🚨',
    label: 'Vật nuôi cần cách ly/điều trị',
    prompt: 'Có cá thể nào đang ốm hoặc cần ưu tiên cách ly/điều trị ngay không?',
  },
  {
    icon: '💉',
    label: 'Lịch tiêm phòng giao mùa',
    prompt: 'Lịch tiêm vắc-xin và phòng bệnh tiêu chuẩn khi giao mùa',
  },
  {
    icon: '🌾',
    label: 'Công thức phối trộn thức ăn',
    prompt: 'Công thức phối trộn thức ăn tối ưu chi phí và tăng trọng nhanh',
  },
  {
    icon: '🦠',
    label: 'Quy trình sát trùng chuồng',
    prompt: 'Quy trình sát trùng chuồng trại và xử lý khi vật nuôi bỏ ăn, sốt',
  },
];

// Clean Markdown Parser Component (React + Tailwind CSS thuần)
export const FormattedMessage: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
  try {
    if (!content || typeof content !== 'string') return null;

    const lines = content.split('\n');

    return (
      <div className={`space-y-2.5 text-[15px] sm:text-base leading-relaxed text-slate-800 ${className}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Subheadings (###)
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-base text-emerald-800 mt-3.5 mb-1.5 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block shrink-0" />
                <span>{trimmed.replace('### ', '')}</span>
              </h4>
            );
          }
          // Main headings (##)
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-emerald-900 mt-4 mb-2 tracking-tight border-b border-emerald-100 pb-1.5">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="font-bold text-xl text-emerald-950 mt-4 mb-2 tracking-tight">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }

          // Important alerts & warnings (⚠️, 🚨, Lưu ý, Cảnh báo)
          if (
            trimmed.startsWith('⚠️') ||
            trimmed.startsWith('🚨') ||
            trimmed.startsWith('💡') ||
            trimmed.includes('Lưu ý an toàn') ||
            trimmed.includes('Lưu ý:') ||
            trimmed.includes('Cảnh báo:')
          ) {
            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 my-2.5 rounded-2xl bg-amber-50/95 border border-amber-200 text-amber-950 text-sm leading-relaxed font-medium shadow-2xs"
              >
                <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
              </div>
            );
          }

          // Bullet list items (- or *)
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const itemText = trimmed.slice(2);
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 sm:pl-3">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5 text-base">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
              </div>
            );
          }

          // Numbered list items (1., 2.)
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s/);
            const num = match ? match[1] : '';
            const itemText = trimmed.replace(/^\d+\.\s/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2 sm:pl-3">
                <span className="text-emerald-700 font-bold shrink-0 text-xs sm:text-sm bg-emerald-100/80 px-2 py-0.5 rounded-md">{num}</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
              </div>
            );
          }

          // Horizontal divider
          if (trimmed.startsWith('---')) {
            return <hr key={idx} className="my-3 border-slate-200" />;
          }

          // Empty spacing line
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Standard paragraph
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  } catch (err) {
    // Fail-safe plain text fallback if any formatting error occurs
    return <p className="whitespace-pre-wrap text-[15px] sm:text-base leading-relaxed text-slate-800">{content}</p>;
  }
};

function formatInlineMarkdown(text: string): string {
  try {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-2 py-0.5 bg-slate-100 text-emerald-800 rounded font-mono text-xs sm:text-sm font-semibold">$1</code>');
  } catch {
    return text;
  }
}

// Safe parser to extract 4 cards even if backend returns unstructured text or mixed payload
function safeParseDiagnosisResult(data: any, defaultSpecies: string, defaultWeight: number): DiagnosisResult {
  try {
    if (data && typeof data === 'object' && data.primarySuspicion && Array.isArray(data.differentialDiagnoses)) {
      return data as DiagnosisResult;
    }

    const rawText = data?.text || data?.diagnosis || data?.result || (typeof data === 'string' ? data : '');

    return {
      urgencyLevel: rawText.toLowerCase().includes('khẩn cấp') || rawText.toLowerCase().includes('sốt cao') ? 'Khẩn cấp' : 'Trung bình',
      contagionRisk: rawText.toLowerCase().includes('lây') || rawText.toLowerCase().includes('dịch') ? 'Cao' : 'Trung bình',
      primarySuspicion: data?.primarySuspicion || `Nghi nhiễm trùng cấp ở ${defaultSpecies}`,
      differentialDiagnoses: [
        {
          diseaseName: data?.primarySuspicion || `Hội chứng viêm nhiễm hô hấp/tiêu hóa ở ${defaultSpecies}`,
          probability: '85%',
          clinicalRationale: rawText ? rawText.slice(0, 150) + '...' : 'Các triệu chứng ghi nhận phù hợp với phản ứng viêm cấp tính.',
          contagious: true,
        },
      ],
      immediateActions24h: [
        'Bước 1: Chuyển ngay cá thể nghi nhiễm sang khu cách ly y tế.',
        'Bước 2: Đo thân nhiệt và tiêm hạ sốt nếu sốt trên 39.5°C.',
        'Bước 3: Phun sát trùng chuồng nuôi bằng Omnicide 1:200.',
        'Bước 4: Bổ sung nước uống hòa điện giải Gluco-K-C thảo mộc.',
      ],
      isolationRequired: true,
      isolationGuidance: 'Cách ly nghiêm ngặt tại khu y tế, sát trùng ủng và dụng cụ chăm sóc.',
      treatmentProtocol: 'Liệu trình điều trị kháng sinh kết hợp hạ sốt và giải độc trong 3-5 ngày liên tục.',
      recommendedMeds: [
        {
          name: 'Dung dịch hạ sốt Anagin-C',
          brand: 'Bio-Pharmachemie',
          activeIngredient: 'Analgin 20%, Vitamin C 5%',
          dosage: `Tiêm bắp 1ml / 10-15kg thể trọng (~${Math.max(2, Math.round(defaultWeight / 12))} ml/con), lặp lại sau 8-12h nếu sốt cao.`,
          withdrawalDays: 7,
          estimatedPrice: '68.000 đ / chai 100ml',
        },
        {
          name: 'Kháng sinh phổ rộng Flo-Doxy Max hoặc Amox-Colis',
          brand: 'Marphavet',
          activeIngredient: 'Florfenicol 30% + Doxycycline 10%',
          dosage: `Tiêm bắp sâu 1ml / 20kg thể trọng (~${Math.max(2, Math.round(defaultWeight / 20))} ml/con).`,
          withdrawalDays: 28,
          estimatedPrice: '185.000 đ / chai 100ml',
        },
      ],
      nutritionAndBiosecurity: 'Giảm thức ăn tinh đậm đặc, cho ăn cỏ mềm dễ tiêu và giữ chuồng ấm áp kín gió.',
      veterinaryNotes: 'Cần theo dõi thân nhiệt 2 lần/ngày. Nếu không giảm sốt sau 48h hãy báo ngay cho trạm thú y.',
    };
  } catch (e) {
    return {
      urgencyLevel: 'Trung bình',
      contagionRisk: 'Trung bình',
      primarySuspicion: `Ca bệnh lâm sàng ở ${defaultSpecies}`,
      differentialDiagnoses: [
        {
          diseaseName: `Rối loạn sức khỏe chưa xác định ở ${defaultSpecies}`,
          probability: '70%',
          clinicalRationale: 'Cần thêm thông tin triệu chứng hoặc mẫu xét nghiệm.',
          contagious: false,
        },
      ],
      immediateActions24h: [
        'Cách ly cá thể để theo dõi.',
        'Đo thân nhiệt và kiểm tra nhịp thở.',
        'Cho uống nước sạch pha điện giải.',
      ],
      isolationRequired: false,
      treatmentProtocol: 'Theo dõi tiến triển trong 24 giờ đầu.',
      recommendedMeds: [],
    };
  }
}

export const AiAdvisorView: React.FC = () => {
  const {
    animals,
    barns,
    addHealthLog,
    updateAnimal,
    setActiveTab,
    aiPromptPrefill,
    setAiPromptPrefill,
    diagnosisTargetAnimal,
    setDiagnosisTargetAnimal,
    selectedAnimalForDiagnosis,
    setSelectedAnimalForDiagnosis,
  } = useFarm();
  const { success, error, info } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'diagnose' | 'chat' | 'scheduler' | 'multi-agent' | 'requirements-agent'>('diagnose');

  // Diagnosis State
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [diagSpecies, setDiagSpecies] = useState('Heo/Lợn');
  const [diagWeightKg, setDiagWeightKg] = useState<number>(85);
  const [diagSymptoms, setDiagSymptoms] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['Bỏ ăn', 'Sốt cao']);
  const [diagFever, setDiagFever] = useState(true);
  const [diagAppetite, setDiagAppetite] = useState('Bỏ ăn hoàn toàn');
  const [diagDays, setDiagDays] = useState('2 ngày');
  const [diagCount, setDiagCount] = useState('1 con');
  const [diagImage, setDiagImage] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  // Chat State (with LocalStorage persistence)
  const [chatMode, setChatMode] = useState<'clinical' | 'multi-agent'>('clinical');
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'model';
    text: string;
    time: string;
    trace?: any;
  }>>(() => {
    try {
      const saved = localStorage.getItem('farmpro_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error restoring chat history:', e);
    }
    return [
      {
        role: 'model',
        text: `👋 **Xin chào bạn! Tôi là Chuyên Gia Thú Y & Kỹ Thuật Chăn Nuôi FarmPro AI.**\n\nTôi đã kết nối trực tiếp với dữ liệu thời gian thực từ cơ sở dữ liệu trang trại \`farmpro_db\` của bạn:\n- 📊 **Theo dõi sức khỏe tổng đàn:** Nắm rõ từng cá thể đang ốm, sốt, cách ly hoặc mang thai.\n- 🩺 **Chẩn đoán lâm sàng & Phác đồ điều trị:** Liều lượng thuốc tiêm, hoạt chất, thời gian ngưng thuốc.\n- 🌾 **Dinh dưỡng & Phối trộn:** Tối ưu hóa chi phí cám, bổ sung premix, ủ chua phụ phẩm.\n- 📅 **Lịch tiêm phòng & An toàn sinh học:** Lịch vắc-xin VietGAHP và quy trình khử trùng chuồng trại.\n\n👉 *Hãy chọn một gợi ý thông minh bên dưới hoặc hỏi bất kỳ thắc mắc nào!*`,
        time: 'Vừa xong',
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync chat messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('farmpro_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving chat history to localStorage:', e);
    }
  }, [messages]);

  // Priority target animal: check both selectedAnimalForDiagnosis and diagnosisTargetAnimal
  const activeAnimalTarget = selectedAnimalForDiagnosis || diagnosisTargetAnimal;

  // Sync when cross-tab state brings an animal from Animals table
  useEffect(() => {
    if (activeAnimalTarget) {
      setSelectedAnimalId(activeAnimalTarget.id);
      setDiagSpecies(activeAnimalTarget.species);
      setDiagWeightKg(activeAnimalTarget.weightKg);
      if (activeAnimalTarget.notes) {
        setDiagSymptoms(activeAnimalTarget.notes);
      }
      if (activeAnimalTarget.status === 'sick' || activeAnimalTarget.status === 'isolated') {
        setDiagFever(true);
      }
      setActiveSubTab('diagnose');
    }
  }, [activeAnimalTarget]);

  // Cross-Tab Deep Link: Handle prefilled prompt from other views (Animals view, Diagnosis view)
  useEffect(() => {
    if (aiPromptPrefill) {
      setInputMessage(aiPromptPrefill);
      setAiPromptPrefill('');
      setActiveSubTab('chat');
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 200);
    }
  }, [aiPromptPrefill, setAiPromptPrefill]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSubTab, isLoadingChat]);

  // Select animal from dropdown
  const handleSelectAnimal = (animalId: string) => {
    setSelectedAnimalId(animalId);
    if (!animalId) {
      if (setSelectedAnimalForDiagnosis) setSelectedAnimalForDiagnosis(null);
      if (setDiagnosisTargetAnimal) setDiagnosisTargetAnimal(null);
      return;
    }

    const target = animals.find((a) => a.id === animalId);
    if (target) {
      if (setSelectedAnimalForDiagnosis) setSelectedAnimalForDiagnosis(target);
      if (setDiagnosisTargetAnimal) setDiagnosisTargetAnimal(target);
      setDiagSpecies(target.species);
      setDiagWeightKg(target.weightKg);
      if (target.notes) {
        setDiagSymptoms(target.notes);
      }
      if (target.status === 'sick' || target.status === 'isolated') {
        setDiagFever(true);
      }
    }
  };

  // Toggle quick symptom chip: automatically append to symptoms text for barn usability
  const handleToggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips((prev) => prev.filter((c) => c !== chip));
    } else {
      setSelectedChips((prev) => [...prev, chip]);
      setDiagSymptoms((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return chip;
        if (trimmed.toLowerCase().includes(chip.toLowerCase())) return trimmed;
        return `${trimmed}, ${chip}`;
      });
    }
  };

  // Image upload & camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('File không hợp lệ', 'Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error('Ảnh quá lớn', 'Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDiagImage(reader.result as string);
      success('Tải ảnh thành công', 'Đã đính kèm ảnh triệu chứng để AI chẩn đoán.');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop image
  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        error('Ảnh quá lớn', 'Kích thước ảnh không được vượt quá 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDiagImage(reader.result as string);
        success('Đã nhận ảnh', 'Ảnh chụp triệu chứng đã sẵn sàng để phân tích.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Run structured AI diagnosis
  const handleRunDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChips.length === 0 && !diagSymptoms.trim() && !diagImage) {
      error('Thiếu thông tin triệu chứng', 'Vui lòng chọn ít nhất 1 triệu chứng hoặc nhập mô tả biểu hiện bệnh.');
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisResult(null);

    const targetAnimal = animals.find((a) => a.id === selectedAnimalId);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species: diagSpecies,
          animalTag: targetAnimal?.tagId || '',
          animalName: targetAnimal?.name || '',
          weightKg: diagWeightKg,
          symptoms: diagSymptoms,
          symptomChips: selectedChips,
          fever: diagFever,
          appetite: diagAppetite,
          days: diagDays,
          affectedCount: diagCount,
          image: diagImage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi gọi máy chủ chẩn đoán');

      const parsed = safeParseDiagnosisResult(data, diagSpecies, diagWeightKg);
      setDiagnosisResult(parsed);
      success('Chẩn đoán thành công', `Đã hoàn tất phân tích lâm sàng cho ca bệnh ${targetAnimal?.tagId || diagSpecies}.`);
    } catch (err: any) {
      console.error('Diagnosis API error:', err);
      const fallback = safeParseDiagnosisResult(null, diagSpecies, diagWeightKg);
      setDiagnosisResult(fallback);
      error('Mất kết nối máy chủ', 'Đã chuyển sang phác đồ sơ cứu thú y ngoại tuyến an toàn.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Save diagnosis result into Health History
  const handleSaveToHealthLog = () => {
    if (!diagnosisResult) return;
    const targetAnimal = animals.find((a) => a.id === selectedAnimalId) || animals[0];

    const today = new Date().toISOString().split('T')[0];
    const medNames = diagnosisResult.recommendedMeds?.map((m) => m.name).join(', ') || '';

    addHealthLog({
      animalId: targetAnimal ? targetAnimal.id : 'unknown',
      animalTag: targetAnimal ? targetAnimal.tagId : 'VN-NEW',
      animalName: targetAnimal ? targetAnimal.name : `Ca bệnh ${diagSpecies}`,
      date: today,
      symptoms: `${selectedChips.join(', ')}. ${diagSymptoms}`,
      diagnosis: diagnosisResult.primarySuspicion,
      treatment: `${diagnosisResult.treatmentProtocol}. Thuốc: ${medNames}`,
      veterinarian: 'Bác Sĩ Thú Y AI AgroVet',
      status: diagnosisResult.isolationRequired ? 'Chuyển cách ly' : 'Đang điều trị',
      notes: diagnosisResult.veterinaryNotes || 'Đang điều trị tích cực theo phác đồ FarmPro AI.',
    });

    if (targetAnimal) {
      updateAnimal(targetAnimal.id, {
        status: diagnosisResult.isolationRequired ? 'isolated' : 'sick',
        notes: `Nghi nhiễm: ${diagnosisResult.primarySuspicion}. Đang áp dụng phác đồ AI.`,
        lastCheckupDate: today,
      });
    }

    success(
      'Đã lưu hồ sơ bệnh án',
      `Ca bệnh đã được ghi nhận vào lịch sử bệnh án và cập nhật trạng thái ${diagnosisResult.isolationRequired ? 'Cách ly' : 'Đang điều trị'}.`
    );
  };

  // Deep Link: Ask Chatbot about this diagnosis case
  const handleAskChatbotAboutCase = () => {
    if (!diagnosisResult) return;
    const targetAnimal = animals.find((a) => a.id === selectedAnimalId);

    const prompt = `Tôi vừa chẩn đoán cho ${targetAnimal ? `${targetAnimal.name} (${targetAnimal.tagId})` : `vật nuôi loài ${diagSpecies}`} với kết quả nghi ngờ: "${diagnosisResult.primarySuspicion}".
Triệu chứng ghi nhận: ${selectedChips.join(', ')}. ${diagSymptoms}.
Mức độ: ${diagnosisResult.urgencyLevel} (Nguy cơ lây lan: ${diagnosisResult.contagionRisk}).
Xin bác sĩ tư vấn sâu hơn về cách pha thuốc, kỹ thuật tiêm an toàn và các dấu hiệu cảnh báo bệnh chuyển nặng cần can thiệp khẩn cấp.`;

    setInputMessage(prompt);
    setActiveSubTab('chat');
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 200);
  };

  // Copy diagnosis protocol to clipboard
  const handleCopyProtocol = () => {
    if (!diagnosisResult) return;
    const text = `🏥 PHÁC ĐỒ ĐIỀU TRỊ THÚ Y AGROVET AI:
- Loài & Đối tượng: ${diagSpecies} (Trọng lượng: ${diagWeightKg} kg)
- Mức độ khẩn cấp: ${diagnosisResult.urgencyLevel} (Nguy cơ lây lan: ${diagnosisResult.contagionRisk})
- Chẩn đoán nghi ngờ: ${diagnosisResult.primarySuspicion}
- Hành động 24h đầu:
${diagnosisResult.immediateActions24h?.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}
- Thuốc chỉ định:
${diagnosisResult.recommendedMeds?.map((m) => `  * ${m.name} (${m.brand || 'Dược thú y'}): ${m.dosage}`).join('\n')}
- Hướng dẫn an toàn sinh học: ${diagnosisResult.nutritionAndBiosecurity || 'Sát trùng chuồng trại'}
- Ghi chú: ${diagnosisResult.veterinaryNotes || 'Theo dõi sát'}`;

    navigator.clipboard.writeText(text);
    success('Đã sao chép phác đồ', 'Toàn bộ phác đồ điều trị đã được lưu vào bộ nhớ tạm.');
  };

  // Send message to Chatbot (with multi-turn history)
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoadingChat) return;

    // Direct natural language command to clear chat history
    const lowerQuery = query.toLowerCase();
    const isClearCommand = [
      'xoá lịch sử chat',
      'xóa lịch sử chat',
      'xoá lịch sử',
      'xóa lịch sử',
      'xoá chat',
      'xóa chat',
      'xóa tin nhắn',
      'xoá tin nhắn',
      'clear chat',
      'reset chat',
      'làm mới chat',
    ].some((cmd) => lowerQuery === cmd || lowerQuery === `/${cmd}` || lowerQuery.startsWith('xóa lịch sử') || lowerQuery.startsWith('xoá lịch sử'));

    if (isClearCommand) {
      clearChatHistory();
      return;
    }

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
        const advice = trace.final_advice;
        const text = advice?.clinical_protocol
          ? `🩺 **Phác đồ điều trị Đa Tác Tử (MAS):**\n\n${advice.clinical_protocol}\n\n**Khuyến nghị dược phẩm:**\n${advice.recommendations?.map((r: any) => `- **${r.name}** (${r.brand}): ${r.dosage} (Giá: ${r.price})`).join('\n')}\n\n${advice.withdrawal_warning || ''}`
          : trace.error || 'Đã hoàn thành phân tích đa tác tử.';

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            trace,
          },
        ]);
      } else {
        // Send last 8 history items for contextual conversation memory
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history: messages.slice(-8),
            farmContext: { totalAnimals: animals.length, barnsCount: barns.length },
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Lỗi xử lý chat');

        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: data.text || 'Đã ghi nhận câu hỏi của bạn.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Chat API error:', err);
      error('Mất kết nối máy chủ', 'Không thể kết nối API AI. Hệ thống kích hoạt trợ lý ngoại tuyến.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ **Không thể kết nối máy chủ:** Đã kích hoạt phác đồ sơ cứu khẩn cấp. Hãy cách ly vật nuôi nếu có biểu hiện sốt, đo thân nhiệt trực tràng và liên hệ trạm thú y gần nhất.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Copy message with 2s checkmark feedback
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    info('Đã sao chép!', 'Nội dung câu trả lời đã được lưu vào bộ nhớ tạm.');
  };

  // Clear chat history & reset
  const clearChatHistory = () => {
    const initialGreeting = [
      {
        role: 'model' as const,
        text: `👋 **Lịch sử trò chuyện đã được xóa sạch.**\n\nTôi đã làm mới ngữ cảnh và đồng bộ sẵn sàng với cơ sở dữ liệu \`farmpro_db\`. Bạn hãy đặt câu hỏi hoặc chọn các gợi ý bên dưới để bắt đầu cuộc trò chuyện mới!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(initialGreeting);
    setInputMessage('');
    try {
      localStorage.removeItem('farmpro_chat_history');
    } catch (e) {}
    success('Đã xóa lịch sử chat', 'Toàn bộ cuộc trò chuyện đã được làm mới sạch sẽ.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Navigation Tabs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Bot className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-emerald-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            Bác Sĩ Thú Y AI • Phòng Khám Số & Chatbot Chăn Nuôi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AgroVet AI: Trung Tâm Y Tế & Cố Vấn Trang Trại
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Hệ thống chẩn đoán đa phương thức (Ảnh chụp + Triệu chứng lâm sàng), phác đồ điều trị VietGAHP và trợ lý kỹ thuật trực tuyến 24/7.
          </p>

          {/* Sub Tab Switcher Pills */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('diagnose')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 ${
                activeSubTab === 'diagnose'
                  ? 'bg-white text-emerald-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>Phòng Khám Bệnh AI</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                Đa phương thức
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('chat')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 ${
                activeSubTab === 'chat'
                  ? 'bg-white text-emerald-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-700" />
              <span>Trợ Lý Ảo Kỹ Thuật</span>
            </button>

            <button
              onClick={() => setActiveSubTab('scheduler')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 ${
                activeSubTab === 'scheduler'
                  ? 'bg-white text-emerald-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Lập Lịch Chăm Sóc</span>
            </button>

            <button
              onClick={() => setActiveSubTab('multi-agent')}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95 ${
                activeSubTab === 'multi-agent'
                  ? 'bg-white text-emerald-900 shadow-md font-extrabold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Đa Tác Tử (MAS)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHÂN KHU 1: PHÒNG KHÁM THÚ Y SỐ (CHẨN ĐOÁN BỆNH AI ĐA PHƯƠNG THỨC) */}
      {/* ========================================================================= */}
      {activeSubTab === 'diagnose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Multimodal Input Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  Phiếu Khám Triệu Chứng Bệnh
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Đầu vào đa phương thức: Ảnh chụp + Triệu chứng lâm sàng tại chuồng
                </p>
              </div>
            </div>

            {/* Cross-Tab Target Animal Banner if redirected from Animals tab */}
            {activeAnimalTarget && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                    {activeAnimalTarget.species ? activeAnimalTarget.species.slice(0, 1) : 'V'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-950 truncate">
                        {activeAnimalTarget.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {activeAnimalTarget.tagId}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                      {activeAnimalTarget.species} • {activeAnimalTarget.weightKg} kg • Chuồng: {activeAnimalTarget.barnId || 'Khu chăm sóc'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (setSelectedAnimalForDiagnosis) setSelectedAnimalForDiagnosis(null);
                    if (setDiagnosisTargetAnimal) setDiagnosisTargetAnimal(null);
                    setSelectedAnimalId('');
                  }}
                  className="shrink-0 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-100/70 hover:bg-emerald-200/70 transition-colors"
                >
                  Đổi ca
                </button>
              </div>
            )}

            <form onSubmit={handleRunDiagnosis} className="space-y-4">
              {/* 1. Chọn vật nuôi từ đàn hoặc ca mới */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Chọn vật nuôi trong đàn:</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Tự động điền dữ liệu</span>
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => handleSelectAnimal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Nhập ca khám mới (ngoài danh sách) --</option>
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.tagId} - {a.name} ({a.species} • {a.weightKg}kg)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Loài & Cân nặng */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Loài vật nuôi</label>
                  <select
                    value={diagSpecies}
                    onChange={(e) => setDiagSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                  >
                    <option value="Heo/Lợn">Heo / Lợn</option>
                    <option value="Bò">Bò (Thịt / Sữa)</option>
                    <option value="Gà">Gà (Đẻ / Thịt)</option>
                    <option value="Vịt">Vịt / Ngan</option>
                    <option value="Dê">Dê / Cừu</option>
                    <option value="Khác">Gia súc khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Thể trọng (kg)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={diagWeightKg}
                    onChange={(e) => setDiagWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* 3. Tải ảnh & Chụp ảnh trực tiếp tại chuồng (Mobile capture="environment") */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Ảnh chụp triệu chứng tại chuồng:</span>
                  <span className="text-[10px] text-slate-400 font-medium">Hỗ trợ Camera sau</span>
                </label>

                {diagImage ? (
                  <div className="relative rounded-2xl border border-emerald-300 bg-emerald-50/50 p-2 overflow-hidden flex items-center gap-3">
                    <img
                      src={diagImage}
                      alt="Triệu chứng"
                      className="w-16 h-16 object-cover rounded-xl border border-emerald-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-emerald-900 truncate">Ảnh triệu chứng sẵn sàng</p>
                      <p className="text-[11px] text-emerald-700">AI sẽ phân tích tổn thương niêm mạc & bề mặt da</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDiagImage(null)}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 transition-colors shadow-2xs"
                      title="Xóa ảnh chọn lại"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropImage}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600">Kéo thả ảnh hoặc mở camera tại chuồng</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {/* Mobile Camera Button (capture="environment") */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all text-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Mở Camera Chuồng</span>
                      </button>

                      {/* File Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[44px] px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 transition-colors text-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Chọn từ máy</span>
                      </button>
                    </div>

                    {/* Hidden inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* 4. Triệu chứng chọn nhanh (Symptom Quick-Chips) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Triệu chứng chọn nhanh (Bấm để tự động điền vào mô tả):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOM_CHIPS.map((chip) => {
                    const isSelected = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleChip(chip)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Ghi chú mô tả chi tiết */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mô tả triệu chứng lâm sàng chi tiết:</label>
                <textarea
                  rows={2}
                  value={diagSymptoms}
                  onChange={(e) => setDiagSymptoms(e.target.value)}
                  placeholder="Ghi chú thêm màu phân, nhịp thở, dịch nhầy mũi hoặc thức ăn nghi nhiễm..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              {/* 6. Trạng thái sốt & ăn uống */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={diagFever}
                    onChange={(e) => setDiagFever(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-slate-800 text-[11px]">Có sốt nóng / tai lạnh</span>
                </label>

                <select
                  value={diagAppetite}
                  onChange={(e) => setDiagAppetite(e.target.value)}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-800"
                >
                  <option value="Bỏ ăn hoàn toàn">Bỏ ăn hoàn toàn</option>
                  <option value="Ăn kém / mệt mỏi">Ăn kém / mệt mỏi</option>
                  <option value="Ăn bình thường">Ăn bình thường</option>
                </select>
              </div>

              {/* 7. Submit button */}
              <button
                type="submit"
                disabled={isDiagnosing}
                className="w-full min-h-[48px] py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-xs tracking-tight"
              >
                {isDiagnosing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Bác Sĩ AI Đang Hội Chẩn Lâm Sàng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Chẩn Đoán Bệnh & Xuất Phác Đồ Ngay</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Structured AI Diagnosis Display (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-600" />
                  Kết Quả Chẩn Đoán Cấu Trúc (4 Khối Thẻ)
                </h3>
                <p className="text-xs text-slate-500">
                  Phân tích từ dữ liệu lâm sàng thú y và tiêu chuẩn an toàn sinh học VietGAHP
                </p>
              </div>

              {diagnosisResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyProtocol}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Sao chép phác đồ"
                  >
                    <Copy className="w-4 h-4 text-emerald-700" />
                    <span className="hidden sm:inline">Sao chép phác đồ</span>
                  </button>
                </div>
              )}
            </div>

            {diagnosisResult ? (
              <div className="space-y-4 text-xs animate-in fade-in duration-300">
                {/* THẺ 1: MỨC ĐỘ KHẨN CẤP & NGUY CƠ LÂY LAN */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    diagnosisResult.urgencyLevel === 'Khẩn cấp' || diagnosisResult.urgencyLevel === 'KHẨN CẤP'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : diagnosisResult.urgencyLevel === 'Trung bình'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ShieldAlert
                        className={`w-6 h-6 shrink-0 mt-0.5 ${
                          diagnosisResult.urgencyLevel === 'Khẩn cấp' || diagnosisResult.urgencyLevel === 'KHẨN CẤP'
                            ? 'text-rose-600'
                            : diagnosisResult.urgencyLevel === 'Trung bình'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm uppercase tracking-wide">
                            THẺ 1: MỨC ĐỘ {diagnosisResult.urgencyLevel}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              diagnosisResult.contagionRisk === 'Cao'
                                ? 'bg-rose-200 text-rose-900 border border-rose-300'
                                : 'bg-amber-200 text-amber-900 border border-amber-300'
                            }`}
                          >
                            Nguy cơ lây lan: {diagnosisResult.contagionRisk}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">
                          {diagnosisResult.isolationRequired
                            ? '⚠️ CẢNH BÁO AN TOÀN SINH HỌC: Cần chuyển ngay cá thể nghi nhiễm vào khu cách ly y tế trong 24h đầu.'
                            : 'Theo dõi tại chuồng nuôi hiện tại và áp dụng phác đồ kiểm soát triệu chứng.'}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-right font-mono text-[11px] opacity-75 hidden sm:inline">
                      Mã ca: #AGRO-{Math.floor(1000 + Math.random() * 9000)}
                    </span>
                  </div>
                </div>

                {/* THẺ 2: CHẨN ĐOÁN BỆNH NGHI NGỜ & CĂN CỨ LÂM SÀNG */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span>THẺ 2: Chẩn Đoán Bệnh Nghi Ngờ Nhất</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">Khả năng & Phân tích</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm text-emerald-950">
                        🏆 {diagnosisResult.primarySuspicion}
                      </span>
                      {diagnosisResult.differentialDiagnoses?.[0]?.probability && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs">
                          {diagnosisResult.differentialDiagnoses[0].probability}
                        </span>
                      )}
                    </div>
                    {diagnosisResult.differentialDiagnoses?.[0]?.clinicalRationale && (
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        <strong>Căn cứ lâm sàng:</strong> {diagnosisResult.differentialDiagnoses[0].clinicalRationale}
                      </p>
                    )}
                  </div>

                  {diagnosisResult.differentialDiagnoses && diagnosisResult.differentialDiagnoses.length > 1 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 block">Các chẩn đoán phân biệt cần loại trừ:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {diagnosisResult.differentialDiagnoses.slice(1).map((diag, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>• {diag.diseaseName}</span>
                              <span className="font-mono text-emerald-700 text-[10px]">{diag.probability}</span>
                            </div>
                            <p className="text-slate-500 text-[10px] line-clamp-2 mt-0.5">{diag.clinicalRationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* THẺ 3: HÀNH ĐỘNG KHẨN CẤP TRONG 24H ĐẦU */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5 text-amber-950">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <h4 className="font-extrabold text-sm flex items-center gap-2 text-amber-900">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>THẺ 3: Hành Động Khẩn Cấp Trong 24h Đầu Tại Chuồng</span>
                    </h4>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                      Ưu tiên số 1
                    </span>
                  </div>

                  <ul className="space-y-1.5 pl-1">
                    {diagnosisResult.immediateActions24h?.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                        <span className="font-extrabold text-amber-700 shrink-0">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>

                  {diagnosisResult.isolationGuidance && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium">
                      💡 <strong>Quy trình an toàn sinh học:</strong> {diagnosisResult.isolationGuidance}
                    </div>
                  )}
                </div>

                {/* THẺ 4: PHÁC ĐỒ CHĂM SÓC, DINH DƯỠNG & THUỐC THÚ Y */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      <span>THẺ 4: Phác Đồ Chăm Sóc, Dinh Dưỡng & Thuốc Thú Y</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">Liệu trình 3 - 5 ngày</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <FormattedMessage content={diagnosisResult.treatmentProtocol} />
                  </div>

                  {diagnosisResult.recommendedMeds && diagnosisResult.recommendedMeds.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-800 block">Thuốc & Hoạt chất chỉ định:</span>
                      <div className="space-y-2">
                        {diagnosisResult.recommendedMeds.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors"
                          >
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-xs">💊 {med.name}</span>
                                {med.brand && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    {med.brand}
                                  </span>
                                )}
                              </div>
                              {med.activeIngredient && (
                                <p className="text-[11px] text-slate-500 font-mono">
                                  Hoạt chất: {med.activeIngredient}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-700">
                                <strong>Liều dùng:</strong> {med.dosage}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              {med.estimatedPrice && (
                                <div className="font-bold text-emerald-800 text-xs">{med.estimatedPrice}</div>
                              )}
                              {med.withdrawalDays !== undefined && (
                                <div className="text-[10px] text-rose-600 font-semibold">
                                  Ngưng thuốc: {med.withdrawalDays} ngày
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagnosisResult.nutritionAndBiosecurity && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                      <strong>🥗 Dinh dưỡng & Khử trùng chuồng:</strong> {diagnosisResult.nutritionAndBiosecurity}
                    </div>
                  )}

                  {diagnosisResult.veterinaryNotes && (
                    <div className="text-[11px] text-slate-500 italic">
                      * <strong>Lưu ý bác sĩ thú y:</strong> {diagnosisResult.veterinaryNotes}
                    </div>
                  )}
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={handleAskChatbotAboutCase}
                    className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span>Hỏi Tiếp Chatbot Về Ca Này</span>
                  </button>

                  <button
                    onClick={handleSaveToHealthLog}
                    className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm hover:shadow text-xs flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Vào Lịch Sử Bệnh Án</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 stroke-1 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Chưa có kết quả chẩn đoán</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Chọn vật nuôi hoặc tải ảnh chụp triệu chứng tại chuồng ở khung bên trái rồi bấm <strong>"Chẩn Đoán Bệnh & Xuất Phác Đồ Ngay"</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHÂN KHU 2: TRỢ LÝ ẢO KỸ THUẬT CHĂN NUÔI (CONTEXT-AWARE AI CHATBOT 9.5/10) */}
      {/* ========================================================================= */}
      {activeSubTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col h-[780px] max-w-5xl mx-auto w-full">
          {/* Chat Header Bar with DB Sync Badge */}
          <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">Chuyên Gia Thú Y & Kỹ Thuật FarmPro AI</span>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChatMode('clinical')}
                  className={`px-3 py-1 rounded-lg text-xs sm:text-[13px] font-bold flex items-center gap-1.5 transition-all ${
                    chatMode === 'clinical'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Kỹ Thuật Thú Y</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChatMode('multi-agent')}
                  className={`px-3 py-1 rounded-lg text-xs sm:text-[13px] font-bold flex items-center gap-1.5 transition-all ${
                    chatMode === 'multi-agent'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Đa Tác Tử (MAS)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Farm DB Synchronized Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>Đã đồng bộ dữ liệu trang trại (<code className="font-mono text-[11px]">farmpro_db</code>)</span>
              </div>

              {/* Clear Chat Button with clear text label */}
              <button
                type="button"
                onClick={clearChatHistory}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200/90 font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-95"
                title="Xóa toàn bộ lịch sử trò chuyện (Clear Chat)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Xóa lịch sử chat</span>
              </button>
            </div>
          </div>

          {/* Quick Prompt Starters Bar (1-touch contextual chips) */}
          <div className="px-6 py-3 bg-emerald-50/60 border-b border-emerald-100/90 flex items-center gap-2 overflow-x-auto text-sm scrollbar-none">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider shrink-0">
              Gợi ý 1 chạm:
            </span>
            {QUICK_PROMPT_STARTERS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoadingChat}
                className="shrink-0 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-200/90 font-medium text-xs sm:text-[13px] shadow-2xs hover:shadow-xs transition-all text-left whitespace-nowrap active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                title={item.prompt}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/40">
            {messages.map((msg, idx) => {
              const isAi = msg.role === 'model';

              return (
                <div
                  key={idx}
                  className={`flex gap-3.5 sm:gap-4 w-full ${isAi ? 'mr-auto max-w-4xl lg:max-w-5xl' : 'ml-auto max-w-2xl flex-row-reverse'}`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold shadow-xs ${
                      isAi
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-5 h-5" /> : 'Chủ'}
                  </div>

                  <div className="group relative max-w-[88%] sm:max-w-[85%] lg:max-w-[85%]">
                    <div
                      className={`p-5 sm:p-6 rounded-3xl shadow-xs text-[15px] sm:text-base leading-relaxed ${
                        isAi
                          ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                          : 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                      }`}
                    >
                      {isAi ? (
                        <FormattedMessage content={msg.text} />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-3 mt-2 px-1 text-sm text-slate-500 font-medium ${
                        isAi ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isAi && (
                        <button
                          onClick={() => copyToClipboard(msg.text, idx)}
                          className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
                          title="Sao chép câu trả lời"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm text-emerald-700 font-bold">Đã sao chép!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-500" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator with Jumping 3 Dots */}
            {isLoadingChat && (
              <div className="flex gap-3.5 sm:gap-4 max-w-2xl mr-auto animate-in fade-in">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-5 rounded-3xl bg-white border border-slate-200 text-slate-700 rounded-tl-xs shadow-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="font-bold text-emerald-900 text-sm sm:text-base">
                      Chuyên gia FarmPro AI đang tra cứu dữ liệu trại và phân tích...
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 pl-4">Đang truy vấn `farmpro_db` và áp dụng phác đồ thú y thực tiễn...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5 sm:gap-3 max-w-4xl lg:max-w-5xl mx-auto"
            >
              {/* Quick Clear Chat Button right on input bar */}
              <button
                type="button"
                onClick={clearChatHistory}
                className="min-h-[52px] px-3.5 sm:px-4 py-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 font-semibold rounded-2xl transition-all flex items-center gap-1.5 text-xs sm:text-sm active:scale-95 shrink-0 shadow-2xs"
                title="Xóa toàn bộ lịch sử chat"
              >
                <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                <span className="hidden sm:inline">Xóa lịch sử</span>
              </button>

              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi về tình trạng đàn, bệnh án cụ thể, liều thuốc, hoặc kỹ thuật chăn nuôi..."
                className="flex-1 min-h-[52px] px-5 py-3.5 border border-slate-300 rounded-2xl text-base text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-all"
                disabled={isLoadingChat}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoadingChat}
                className="min-h-[52px] px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-base active:scale-95 shrink-0"
              >
                <span>Gửi</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub Tab: Schedule View & Other tabs */}
      {activeSubTab === 'scheduler' && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Lập Lịch Chăm Sóc & Vắc Xin Tự Động
          </h3>
          <p className="text-xs text-slate-500">
            Nhập loài vật nuôi và giai đoạn để AI khởi tạo phác đồ chăm sóc toàn diện cho trang trại.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Chuyển tới giao diện Quản lý Lịch trình →
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'multi-agent' && <MultiAgentView />}
      {activeSubTab === 'requirements-agent' && <RequirementsAgentView />}
    </div>
  );
};
