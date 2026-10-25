import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { processSmartAiQuery } from './src/utils/businessLogic';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// AI Query Endpoint
app.post('/api/ai/query', async (req, res) => {
  const { query, products = [], orders = [], services = [] } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Câu hỏi tra cứu không hợp lệ' });
  }

  // Fallback engine if Gemini is not configured or in case of error
  const fallbackResult = processSmartAiQuery(query, products, orders, services);

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      ...fallbackResult,
      isAiPowered: false,
      note: 'Đang dùng bộ máy phân tích nội bộ (Chưa cấu hình GEMINI_API_KEY).'
    });
  }

  try {
    const ai = new GoogleGenAI();
    const systemPrompt = `Bạn là Giám đốc Vận hành & Phân tích Kinh doanh AI chuyên nghiệp của chuỗi cửa hàng xe đạp VeloBiz tại Việt Nam.
Nhiệm vụ của bạn là phân tích câu hỏi/yêu cầu của chủ cửa hàng xe đạp dựa trên dữ liệu thời gian thực sau:
- Danh sách sản phẩm (${products.length} mã sản phẩm: Tên, Mã SKU, Danh mục Road/MTB/City/Kids/Accessory/Service, Giá vốn, Giá bán, Tồn kho, Đã bán, Số khung).
- Lịch sử đơn hàng (${orders.length} đơn).
- Dịch vụ sửa chữa/bảo dưỡng (${services.length} phiếu tiếp nhận).

Yêu cầu định dạng phản hồi:
BẮT BUỘC trả về một JSON object hợp lệ DUY NHẤT (không bọc trong markdown code fence khác ngoài json) có cấu trúc:
{
  "intent": string,
  "title": string,
  "summary": string (Tóm tắt phân tích sắc bén, nêu số liệu tiền tệ bằng VNĐ),
  "recommendations": string[] (3-4 gợi ý hành động cụ thể, thiết thực cho chủ shop xe đạp),
  "tableHeaders": string[] (Tên các cột cho bảng dữ liệu),
  "tableRows": (string | number)[][] (Các dòng dữ liệu tương ứng),
  "advice": string (Lời khuyên chiến lược ngắn gọn)
}
Giữ phong cách chuyên nghiệp, tích cực, số liệu thực tế chuẩn xác.`;

    const userMessage = `Câu hỏi của chủ cửa hàng: "${query}"\n\nDữ liệu cửa hàng hiện tại:\n${JSON.stringify({
      products: products.map((p: any) => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        cost: p.cost,
        price: p.price,
        stock: p.stock,
        sold: p.sold
      })),
      ordersSummary: {
        count: orders.length,
        totalSales: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
      },
      servicesSummary: {
        count: services.length,
        inProgress: services.filter((s: any) => s.status === 'in_progress').length
      }
    })}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
      ]
    });

    const responseText = response.text || '';
    // Clean potential markdown wrap
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.json({
      intent: parsed.intent || fallbackResult.intent,
      title: parsed.title || fallbackResult.title,
      summary: parsed.summary || fallbackResult.summary,
      recommendations: parsed.recommendations || fallbackResult.recommendations,
      tableHeaders: parsed.tableHeaders || fallbackResult.tableHeaders,
      tableRows: parsed.tableRows || fallbackResult.tableRows,
      isAiPowered: true,
      rawData: fallbackResult.rawData
    });
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to rule engine:', err.message);
    return res.json({
      ...fallbackResult,
      isAiPowered: false,
      note: 'Đã tự động chuyển đổi sang bộ máy phân tích nội bộ do API quá tải hoặc chưa kích hoạt.'
    });
  }
});

async function startServer() {
  // Vite in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VeloBiz Server is running at http://localhost:${PORT}`);
  });
}

startServer();
