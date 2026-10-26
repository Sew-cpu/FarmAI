import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getVetChatResponse,
  getAiSchedulePlan,
  getAiDiagnosisResult,
} from './src/server/vetAdvisorEngine.ts';
import {
  executeMultiAgentPipeline,
  PRODUCT_CATALOG,
  KNOWN_BRANDS,
} from './src/server/multiAgentSystem.ts';
import {
  TEST_CASES,
  runSingleTestCase,
} from './src/server/multiAgentTestCases.ts';
import { checkDbConnection, fetchAllProducts } from './src/server/db.ts';
import { runRequirementsAgent } from './src/server/requirementsAgent.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Farm AI Advisor Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], farmContext } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
    }

    // Try Python Flask Backend first if active on port 5000
    try {
      const flaskRes = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, farmContext }),
        signal: AbortSignal.timeout(10000),
      });
      if (flaskRes.ok) {
        const flaskData = await flaskRes.json();
        if (flaskData && flaskData.text) {
          return res.json({ text: flaskData.text });
        }
      }
    } catch {
      // Python Flask offline or timeout, fall through to Node getVetChatResponse
    }

    const answerText = await getVetChatResponse(message, history, farmContext);
    return res.json({ text: answerText });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    const answerText = await getVetChatResponse(req.body?.message || '', req.body?.history || [], req.body?.farmContext);
    return res.json({ text: answerText });
  }
});

// AI Schedule Generator Endpoint
app.post('/api/ai/generate-schedule', async (req: Request, res: Response) => {
  try {
    const { species = 'Bò thịt', stage = 'Vỗ béo', targetNotes = '' } = req.body;
    const plan = await getAiSchedulePlan(species, stage, targetNotes);
    return res.json(plan);
  } catch (error: any) {
    console.error('Error in /api/ai/generate-schedule:', error);
    const plan = await getAiSchedulePlan('Bò thịt', 'Tiêu chuẩn', '');
    return res.json(plan);
  }
});

// Animals in-memory fallback list
let serverAnimals = [
  {
    id: 'an-1',
    tagId: 'BO-0102',
    name: 'Bò Sữa Bella (HF)',
    species: 'Bò',
    breed: 'Holstein Friesian thuần chủng',
    gender: 'Cái',
    birthDate: '2024-03-12',
    weightKg: 540,
    barnId: 'barn-1',
    status: 'healthy',
    notes: 'Sản lượng sữa đạt 28 lít/ngày, tính nết hiền hòa',
    lastCheckupDate: '2026-09-15'
  },
  {
    id: 'an-2',
    tagId: 'BO-0105',
    name: 'Bò Sữa Daisy',
    species: 'Bò',
    breed: 'Holstein Friesian lai F1',
    gender: 'Cái',
    birthDate: '2024-04-18',
    weightKg: 510,
    barnId: 'barn-1',
    status: 'monitoring',
    notes: 'Bầu vú bên phải hơi sưng nhẹ sau vắt sữa buổi sáng, đang kiểm tra tế bào soma',
    lastCheckupDate: '2026-09-22'
  },
  {
    id: 'an-3',
    tagId: 'BO-0211',
    name: 'Bò Đực Giống Angus 01',
    species: 'Bò',
    breed: 'Black Angus',
    gender: 'Đực',
    birthDate: '2023-11-05',
    weightKg: 780,
    barnId: 'barn-2',
    status: 'healthy',
    notes: 'Cơ bắp phát triển xuất sắc, phàm ăn, nguồn tinh giống chất lượng cao',
    lastCheckupDate: '2026-09-10'
  },
  {
    id: 'an-4',
    tagId: 'HEO-304',
    name: 'Heo Nái Yorkshire Hoa Cúc',
    species: 'Heo',
    breed: 'Yorkshire thuần',
    gender: 'Cái',
    birthDate: '2024-01-20',
    weightKg: 215,
    barnId: 'barn-3',
    status: 'pregnant',
    notes: 'Mang thai lứa thứ 2, dự kiến sinh 12-14 con vào tuần tới',
    lastCheckupDate: '2026-09-21'
  },
  {
    id: 'an-5',
    tagId: 'HEO-419',
    name: 'Heo Thịt Đàn B2-19',
    species: 'Heo',
    breed: 'Duroc x Landrace',
    gender: 'Đực',
    birthDate: '2024-05-10',
    weightKg: 98,
    barnId: 'barn-4',
    status: 'sick',
    notes: 'Sốt nhẹ 39.8°C, bỏ ăn bữa chiều qua, thở dốc và ho ngắt quãng',
    lastCheckupDate: '2026-09-23'
  },
  {
    id: 'an-6',
    tagId: 'HEO-420',
    name: 'Heo Thịt Đàn B2-20',
    species: 'Heo',
    breed: 'Duroc x Landrace',
    gender: 'Đực',
    birthDate: '2024-05-10',
    weightKg: 95,
    barnId: 'barn-iso',
    status: 'isolated',
    notes: 'Ho thở giật bụng nhiều, nghi viêm phổi địa phương / suyễn heo cần cách ly',
    lastCheckupDate: '2026-09-23'
  },
  {
    id: 'an-7',
    tagId: 'GA-DAN-01',
    name: 'Đàn Gà Đẻ Ai Cập Đợt 1',
    species: 'Gà',
    breed: 'Gà Ai Cập siêu trứng',
    gender: 'Cái',
    birthDate: '2024-02-15',
    weightKg: 1.8,
    barnId: 'barn-5',
    status: 'healthy',
    notes: 'Tỷ lệ đẻ trứng đạt 86%, vỏ trứng dày màu trắng hồng',
    lastCheckupDate: '2026-09-19'
  },
  {
    id: 'an-8',
    tagId: 'DE-BT-09',
    name: 'Dê Đực Đầu Đàn Sấm Sét',
    species: 'Dê',
    breed: 'Dê Bách Thảo lai Boer',
    gender: 'Đực',
    birthDate: '2024-02-28',
    weightKg: 68,
    barnId: 'barn-6',
    status: 'healthy',
    notes: 'Thể lực sung mãn, lông óng mượt, làm việc tốt',
    lastCheckupDate: '2026-09-21'
  }
];

// Animals API Endpoints
app.get('/api/animals', (_req: Request, res: Response) => {
  return res.json({ animals: serverAnimals, total: serverAnimals.length });
});

app.post('/api/animals', (req: Request, res: Response) => {
  const { tagId, name, species = 'Bò', breed = 'Giống lai', gender = 'Cái', weightKg = 100, barnId = 'barn-1', status = 'healthy', notes = '' } = req.body;
  if (!tagId || !name) {
    return res.status(400).json({ error: 'Mã thẻ tai và tên vật nuôi không được để trống' });
  }
  const newAnimal = {
    id: `an-${Date.now()}`,
    tagId: tagId.trim().toUpperCase(),
    name: name.trim(),
    species,
    breed,
    gender,
    birthDate: new Date().toISOString().split('T')[0],
    weightKg: Number(weightKg),
    barnId,
    status,
    notes,
    lastCheckupDate: new Date().toISOString().split('T')[0],
  };
  serverAnimals.unshift(newAnimal);
  return res.status(201).json({ success: true, animal: newAnimal });
});

app.put('/api/animals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = serverAnimals.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy vật nuôi' });
  }
  serverAnimals[index] = { ...serverAnimals[index], ...req.body };
  return res.json({ success: true, animal: serverAnimals[index] });
});

app.delete('/api/animals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  serverAnimals = serverAnimals.filter((a) => a.id !== id);
  return res.json({ success: true, deletedId: id });
});

// AI Quick Diagnosis Endpoint (Rich Structured Clinical Output)
app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  try {
    const {
      species = 'Heo/Lợn',
      animalTag = '',
      symptoms = '',
      symptomChips = [],
      fever = true,
      appetite = 'Kém ăn',
      days = '1-2 ngày',
      affectedCount = '1 con',
      weightKg = 80,
    } = req.body;

    const allSymptomsText = `${Array.isArray(symptomChips) ? symptomChips.join(', ') : ''}. ${symptoms}`.toLowerCase();
    const isHighRisk = fever || allSymptomsText.includes('sốt cao') || allSymptomsText.includes('thở dốc') || allSymptomsText.includes('thở giật') || allSymptomsText.includes('xuất huyết') || allSymptomsText.includes('tai đỏ');
    const urgency = isHighRisk ? 'Khẩn cấp' : allSymptomsText.includes('bỏ ăn') || allSymptomsText.includes('tiêu chảy') ? 'Trung bình' : 'Thấp';
    const contagionRisk = isHighRisk || allSymptomsText.includes('tiêu chảy') || allSymptomsText.includes('ho') ? 'Cao' : 'Trung bình';

    let differential = [];
    if (species.toLowerCase().includes('heo') || species.toLowerCase().includes('lợn')) {
      if (allSymptomsText.includes('thở') || allSymptomsText.includes('sốt') || allSymptomsText.includes('phổi') || allSymptomsText.includes('đỏ')) {
        differential = [
          {
            diseaseName: 'Viêm phổi dính sườn (APP) ghép Sốt đỏ',
            probability: '88%',
            clinicalRationale: 'Heo có biểu hiện thở giật bụng, sốt cao trên 39.5°C, da đỏ vùng tai và bẹn điển hình của Actinobacillus pleuropneumoniae ghép sốt đỏ.',
            contagious: true
          },
          {
            diseaseName: 'Suyễn heo do Mycoplasma hyopneumoniae',
            probability: '65%',
            clinicalRationale: 'Ho khan ngắt quãng từng cơn, thở khó khi vận động, tổn thương đối xứng ở thùy đỉnh phổi.',
            contagious: true
          },
          {
            diseaseName: 'Hội chứng Tai xanh (PRRS)',
            probability: '50%',
            clinicalRationale: 'Cần lưu ý nguy cơ suy giảm miễn dịch và sốt kéo dài trên đàn lợn thịt.',
            contagious: true
          }
        ];
      } else {
        differential = [
          {
            diseaseName: 'Viêm ruột tiêu chảy cấp do E.coli',
            probability: '85%',
            clinicalRationale: 'Phân lỏng, mất nước nhanh và bỏ ăn do mất cân bằng hệ vi sinh đường ruột.',
            contagious: true
          }
        ];
      }
    } else if (species.toLowerCase().includes('bò')) {
      if (allSymptomsText.includes('vú') || allSymptomsText.includes('sữa')) {
        differential = [
          {
            diseaseName: 'Viêm vú lâm sàng cấp tính (Mastitis)',
            probability: '90%',
            clinicalRationale: 'Bầu vú sưng nóng một bên sau vắt sữa, sữa vón cục và lượng tế bào soma tăng cao.',
            contagious: false
          }
        ];
      } else {
        differential = [
          {
            diseaseName: 'Chướng hơi dạ cỏ cấp tính hoặc Rối loạn tiêu hóa',
            probability: '85%',
            clinicalRationale: 'Hõm hông căng trướng, ngừng nhai lại do tích lũy bọt khí lên men thức ăn tinh.',
            contagious: false
          }
        ];
      }
    } else {
      differential = [
        {
          diseaseName: `Hội chứng nhiễm trùng hô hấp / tiêu hóa cấp ở ${species}`,
          probability: '80%',
          clinicalRationale: 'Biểu hiện sốt và các triệu chứng lâm sàng cho thấy phản ứng viêm cấp tính.',
          contagious: isHighRisk
        }
      ];
    }

    const recommendedMeds = [
      {
        name: 'Dung dịch hạ sốt & tiêu viêm Anagin-C',
        brand: 'Bio-Pharmachemie',
        activeIngredient: 'Analgin 20%, Vitamin C 5%',
        dosage: `Tiêm bắp 1ml / 10-15kg thể trọng (khoảng ${Math.max(2, Math.round(Number(weightKg) / 12))} ml/con), lặp lại sau 8-12h nếu sốt cao.`,
        withdrawalDays: 7,
        estimatedPrice: '68.000 đ / chai 100ml'
      },
      {
        name: 'Kháng sinh Flo-Doxy Max hoặc Amox-Colis',
        brand: 'Marphavet',
        activeIngredient: 'Florfenicol 30% + Doxycycline 10%',
        dosage: `Tiêm bắp sâu 1ml / 20kg thể trọng (khoảng ${Math.max(2, Math.round(Number(weightKg) / 20))} ml/con), mũi tiêm kéo dài 48h.`,
        withdrawalDays: 28,
        estimatedPrice: '185.000 đ / chai 100ml'
      },
      {
        name: 'Hỗn hợp bù nước & điện giải Gluco-K-C Thảo Mộc',
        brand: 'Marphavet',
        activeIngredient: 'Glucose, Vitamin C, Vitamin K3, Actiso',
        dosage: 'Pha 1g / 1 lít nước sạch cho uống tự do suốt ngày để hồi sức và giải độc gan thận.',
        withdrawalDays: 0,
        estimatedPrice: '55.000 đ / gói 1kg'
      }
    ];

    const immediateActions = [
      'Bước 1: Chuyển ngay vật nuôi sang khu cách ly y tế để ngăn ngừa phát tán mầm bệnh qua nước dãi và không khí.',
      'Bước 2: Đo thân nhiệt trực tràng (nếu > 39.5°C tiêm ngay Anagin-C hạ sốt, tránh sốc nhiệt).',
      'Bước 3: Tiêm kháng sinh phổ rộng theo liều chỉ định, thay kim tiêm riêng cho từng cá thể.',
      'Bước 4: Phun sát trùng chuồng bằng Omnicide Extra (tỷ lệ 1:200) toàn bộ lối đi và tường ngăn.',
      'Bước 5: Cho uống nước ấm pha điện giải Gluco-K-C thảo mộc, giữ chuồng kín gió nhưng thoáng khí.'
    ];

    return res.json({
      urgencyLevel: urgency,
      contagionRisk: contagionRisk,
      primarySuspicion: differential[0].diseaseName,
      differentialDiagnoses: differential,
      immediateActions24h: immediateActions,
      isolationRequired: isHighRisk,
      isolationGuidance: 'Cách ly tại Khu Cách Ly Y Tế Khẩn Cấp. Rắc vôi bột lối ra vào và hạn chế người tiếp xúc.',
      treatmentProtocol: 'Liệu trình điều trị kháng sinh kết hợp hạ sốt và bổ trợ trong 3 - 5 ngày liên tục.',
      recommendedMeds,
      nutritionAndBiosecurity: 'Giảm 50% thức ăn đậm đặc, bổ sung cỏ tươi sạch hoặc cháo loãng. Khử trùng máng uống hàng ngày.',
      veterinaryNotes: 'Nếu sau 48 giờ thân nhiệt không hạ hoặc lây lan sang con khác, cần lấy mẫu bệnh phẩm gửi trạm thú y.'
    });
  } catch (error: any) {
    console.error('Error in /api/ai/diagnose:', error);
    return res.status(500).json({ error: error.message || 'Lỗi chẩn đoán thú y' });
  }
});


// ========================================================
// MULTI-AGENT SYSTEM API ENDPOINTS (TC01 - TC10)
// ========================================================

// 1. Run live Multi-Agent consultation pipeline
app.post('/api/ai/multi-agent/run', async (req: Request, res: Response) => {
  try {
    const { query, testCaseTag } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Nội dung yêu cầu không được để trống' });
    }

    const trace = await executeMultiAgentPipeline(query.trim(), testCaseTag);
    return res.json(trace);
  } catch (error: any) {
    console.error('Error in /api/ai/multi-agent/run:', error);
    return res.status(500).json({ error: error.message || 'Lỗi xử lý Multi-Agent System' });
  }
});

// 2. Get Product Catalog & Brands for Multi-Agent (From MySQL or fallback)
app.get('/api/ai/multi-agent/catalog', async (_req: Request, res: Response) => {
  try {
    const products = await fetchAllProducts();
    return res.json({
      products,
      brands: KNOWN_BRANDS,
      totalProducts: products.length,
    });
  } catch (error: any) {
    return res.json({
      products: PRODUCT_CATALOG,
      brands: KNOWN_BRANDS,
      totalProducts: PRODUCT_CATALOG.length,
    });
  }
});

// Database Health & Connection Status Endpoint
app.get('/api/db/status', async (_req: Request, res: Response) => {
  try {
    const status = await checkDbConnection();
    return res.json(status);
  } catch (error: any) {
    return res.json({
      connected: false,
      mode: 'in_memory_simulation',
      message: 'Đang chạy ở chế độ In-memory simulation',
    });
  }
});

// 3. Get Test Cases List (TC01 - TC10)
app.get('/api/ai/multi-agent/test-cases', (_req: Request, res: Response) => {
  return res.json({ testCases: TEST_CASES });
});

// 4. Run Single Test Case (e.g. TC01, TC03, TC08, etc.)
app.post('/api/ai/multi-agent/run-test-case', async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.body;
    if (!testCaseId) {
      return res.status(400).json({ error: 'Thiếu mã kiểm thử testCaseId (TC01 - TC10)' });
    }

    const result = await runSingleTestCase(testCaseId);
    return res.json(result);
  } catch (error: any) {
    console.error('Error running test case:', error);
    return res.status(500).json({ error: error.message || 'Lỗi thực thi test case' });
  }
});

// 5. Run All Test Cases (TC01 to TC10) in batch
app.post('/api/ai/multi-agent/run-all-tests', async (_req: Request, res: Response) => {
  try {
    const results = [];
    for (const tc of TEST_CASES) {
      const resSingle = await runSingleTestCase(tc.id);
      results.push(resSingle);
    }
    const passedCount = results.filter((r) => r.overallPassed).length;
    return res.json({
      summary: {
        total: results.length,
        passed: passedCount,
        failed: results.length - passedCount,
        passRatePercentage: Math.round((passedCount / results.length) * 100),
      },
      results,
    });
  } catch (error: any) {
    console.error('Error running all test cases:', error);
    return res.status(500).json({ error: error.message || 'Lỗi chạy bộ kiểm thử toàn diện' });
  }
});

// 6. Requirements Agent (Senior BA & System Architect Analysis - SDLC)
app.post('/api/ai/requirements-agent/analyze', async (req: Request, res: Response) => {
  try {
    const { requirement } = req.body;
    if (!requirement || typeof requirement !== 'string' || !requirement.trim()) {
      return res.status(400).json({ error: 'Nội dung yêu cầu requirement không được để trống' });
    }

    const result = await runRequirementsAgent(requirement.trim());
    return res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/requirements-agent/analyze:', error);
    return res.status(500).json({ error: error.message || 'Lỗi xử lý Requirements Agent' });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  const distHtmlPath = path.resolve(__dirname, 'dist', 'index.html');
  const hasDist = fs.existsSync(distHtmlPath);
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: __dirname,
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      server: {
        middlewareMode: true,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback: Ensure GET * always transforms and serves index.html in dev mode
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
