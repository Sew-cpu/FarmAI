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

    const answerText = await getVetChatResponse(message, history, farmContext);
    return res.json({ text: answerText });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    // Even in rare edge cases, deliver helpful clinical guidance rather than breaking UI
    return res.json({
      text: '🩺 **Hệ thống Thú Y AgroVet AI:** Tôi đã ghi nhận câu hỏi của bạn. Để đảm bảo an toàn cho vật nuôi, hãy kiểm tra ngay thân nhiệt và cách ly con vật nếu có biểu hiện sốt, bỏ ăn hoặc tiêu chảy. Bạn có thể bấm vào các gợi ý có sẵn hoặc gửi lại câu hỏi chi tiết hơn.',
    });
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

// AI Quick Diagnosis Endpoint
app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  try {
    const {
      species = 'Gia súc',
      symptoms = 'Bất thường',
      fever = true,
      appetite = 'Kém ăn',
      days = '1-2 ngày',
      affectedCount = '1 con',
    } = req.body;

    const triage = await getAiDiagnosisResult(species, symptoms, fever, appetite, days, affectedCount);
    return res.json(triage);
  } catch (error: any) {
    console.error('Error in /api/ai/diagnose:', error);
    const triage = await getAiDiagnosisResult('Gia súc', 'Bất thường', true, 'Kém ăn', '1 ngày', '1 con');
    return res.json(triage);
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
