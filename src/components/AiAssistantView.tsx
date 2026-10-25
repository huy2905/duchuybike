import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Download, 
  Send, 
  CheckCircle, 
  Lightbulb, 
  Bot, 
  RefreshCw,
  Mic,
  MicOff,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Product, Order, ServiceTicket, AiQueryResult } from '../types';
import { processSmartAiQuery, exportToCSV } from '../utils/businessLogic';

interface Props {
  products: Product[];
  orders: Order[];
  services: ServiceTicket[];
  currentResult: AiQueryResult | null;
  onSetResult: (result: AiQueryResult) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const AiAssistantView: React.FC<Props> = ({
  products,
  orders,
  services,
  currentResult,
  onSetResult,
  isLoading,
  setIsLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [isAiPowered, setIsAiPowered] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);

  const quickPrompts = [
    { label: 'Xuất hàng tồn trong kho', prompt: 'Xuất các hàng còn tồn trong kho', icon: '📦' },
    { label: 'Sản phẩm bán chạy nhất', prompt: 'Thống kê sản phẩm bán chạy nhất', icon: '🔥' },
    { label: 'Cảnh báo hàng sắp hết', prompt: 'Cảnh báo hàng sắp hết (≤ 2 chiếc)', icon: '⚠️' },
    { label: 'Doanh thu & Lợi nhuận', prompt: 'Báo cáo tổng quan doanh thu và lợi nhuận', icon: '💰' },
    { label: 'Chiến lược nhập xe tháng tới', prompt: 'Tư vấn chiến lược nhập xe đạp cho tháng tới', icon: '🚲' },
    { label: 'Gợi ý khuyến mãi xe đạp', prompt: 'Gợi ý gói combo và khuyến mãi xe đạp hè', icon: '🏷️' }
  ];

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    setIsLoading(true);

    try {
      // Call server backend
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, products, orders, services })
      });

      if (res.ok) {
        const data = await res.json();
        onSetResult(data);
        setIsAiPowered(data.isAiPowered ?? false);
      } else {
        // Local fallback
        const local = processSmartAiQuery(queryText, products, orders, services);
        onSetResult(local);
        setIsAiPowered(false);
      }
    } catch {
      // Offline fallback
      const local = processSmartAiQuery(queryText, products, orders, services);
      onSetResult(local);
      setIsAiPowered(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận dạng giọng nói trực tiếp.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleQuery(transcript);
      };
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleExport = () => {
    if (!currentResult || currentResult.tableRows.length === 0) return;
    const filename = `DucHuyBike_${currentResult.intent || 'BaoCao'}_${new Date().toISOString().slice(0, 10)}`;
    exportToCSV(filename, currentResult.tableHeaders, currentResult.tableRows);
  };

  return (
    <div className="space-y-6">
      {/* Top AI Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Trợ Lý AI Tra Cứu & Báo Cáo Kinh Doanh</h2>
              <p className="text-xs text-slate-500">
                Nhập câu hỏi tự nhiên hoặc bấm gợi ý nhanh để tự động trích xuất bảng số liệu và đề xuất chiến lược
              </p>
            </div>
          </div>
          {isAiPowered !== null && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isAiPowered 
                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <Bot className="w-3.5 h-3.5" />
              {isAiPowered ? 'Gemini Flash AI Phân Tích' : 'Bộ Máy Phân Tích Dữ Liệu Đức Huy'}
            </span>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(inputText);
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ví dụ: Xuất các hàng còn tồn, Thống kê bán chạy nhất, hoặc xe nào dưới 10 triệu..."
              className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-slate-900"
            />
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ${
                isListening ? 'text-rose-500 animate-pulse bg-rose-50' : ''
              }`}
              title={isListening ? 'Đang nghe...' : 'Nói qua Micro'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shrink-0 shadow-sm shadow-blue-600/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Tra cứu</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400">Gợi ý một chạm:</span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(q.prompt);
                handleQuery(q.prompt);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{q.icon}</span>
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto animate-bounce">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">Trợ Lý AI Đang Xử Lý Dữ Liệu</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Đang đối soát kho hàng, lịch sử doanh số bán xe và phân tích đề xuất tối ưu cho cửa hàng...
            </p>
          </div>
        </div>
      )}

      {/* Result Display */}
      {!isLoading && currentResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
          {/* Header of Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Kết quả phân tích từ AI</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{currentResult.title}</h3>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
              title="Xuất bảng dữ liệu hiện tại ra file Excel (.CSV)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất file Excel / CSV</span>
            </button>
          </div>

          {/* AI Executive Summary & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Summary */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Tóm Tắt Tình Hình Kinh Doanh:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentResult.summary}
              </p>
            </div>

            {/* Action Recommendations */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Đề Xuất Hành Động:</span>
              </div>
              <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
                {currentResult.recommendations.map((rec, i) => (
                  <li key={i} className="leading-snug">{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    {currentResult.tableHeaders.map((header, idx) => (
                      <th key={idx} className="px-4 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentResult.tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={currentResult.tableHeaders.length} className="px-4 py-8 text-center text-slate-400">
                        Không có dữ liệu thỏa mãn điều kiện lọc.
                      </td>
                    </tr>
                  ) : (
                    currentResult.tableRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-3 font-medium text-slate-800">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
              <span>Hiển thị {currentResult.tableRows.length} dòng dữ liệu</span>
              <span>Được trích xuất từ dữ liệu thời gian thực của cửa hàng</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
