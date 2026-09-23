import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getVetChatResponse,
  getAiSchedulePlan,
  getAiDiagnosisResult,
} from './src/server/vetAdvisorEngine.ts';

dotenv.config();

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
      symptoms = 'Sốt, mệt mỏi',
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

// Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
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
