import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, Terminal, Laptop, HelpCircle, HardDrive } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RunOnOtherMachineModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onExportData,
  onImportData
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: 'Bước 1: Cài đặt Node.js trên máy mới',
      desc: 'Máy tính cần có môi trường Node.js (phiên bản khuyến nghị v18, v20 hoặc v22 LTS).',
      command: '# Kiểm tra xem máy đã cài Node.js chưa:\nnode -v\nnpm -v',
      note: 'Nếu chưa có, hãy tải miễn phí tại https://nodejs.org và cài đặt theo hướng dẫn.'
    },
    {
      title: 'Bước 2: Tải mã nguồn dự án về máy mới',
      desc: 'Bạn có thể tải toàn bộ thư mục dự án dưới dạng file ZIP từ AI Studio hoặc clone qua Git.',
      command: '# Giải nén thư mục dự án và mở Terminal / Command Prompt tại thư mục đó:\ncd velobiz-app',
      note: 'Hãy chắc chắn rằng bạn đang đứng ở thư mục gốc có chứa file package.json.'
    },
    {
      title: 'Bước 3: Cài đặt các thư viện phụ thuộc (Dependencies)',
      desc: 'Chạy lệnh npm install để tải các gói cần thiết (React, Vite, Express, Lucide, Tailwind, v.v.).',
      command: 'npm install',
      note: 'Quá trình này chỉ mất khoảng 1-2 phút tùy tốc độ mạng của bạn.'
    },
    {
      title: 'Bước 4: Cấu hình biến môi trường (.env)',
      desc: 'Tạo file .env từ file .env.example để lưu khóa API Gemini (nếu muốn dùng trợ lý AI trực tiếp).',
      command: '# Trên Linux/macOS:\ncp .env.example .env\n\n# Hoặc trên Windows PowerShell:\ncopy .env.example .env',
      note: 'Mở file .env và điền GEMINI_API_KEY="khóa_của_bạn" (Nếu không điền, app vẫn chạy mượt mà với bộ máy phân tích dữ liệu nội bộ!).'
    },
    {
      title: 'Bước 5: Khởi chạy ứng dụng',
      desc: 'Bắt đầu máy chủ phát triển cục bộ:',
      command: 'npm run dev',
      note: 'Mở trình duyệt web và truy cập địa chỉ: http://localhost:3000'
    },
    {
      title: 'Bước 6: Tạo Icon ngoài Màn hình Desktop để bấm 1 click là chạy như App bình thường',
      desc: 'Trong thư mục mã nguồn đã có sẵn file Chay-App-Duc-Huy.bat (hoặc bạn tự tạo):',
      command: '@echo off\ncd /d "%~dp0"\nstart "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"\nnpm run dev',
      note: 'Khi nhấp đúp vào file này, máy chủ sẽ khởi động và sau 3 giây tự mở giao diện bán hàng. LƯU Ý: Giữ cửa sổ đen chạy ẩn dưới thanh Taskbar trong suốt buổi bán hàng, không bấm Ctrl+C (nếu bấm Ctrl+C là tắt máy chủ, web sẽ bị trắng).'
    },
    {
      title: 'Bước 7: Đồng bộ dữ liệu cửa hàng đã nhập sang máy mới',
      desc: 'Ứng dụng lưu trữ toàn bộ sản phẩm, số khung, đơn hàng an toàn trong bộ nhớ máy. Để mang dữ liệu từ máy này sang máy mới:',
      isDataStep: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Hướng Dẫn Chạy App Đức Huy Trên Máy Khác</h3>
              <p className="text-sm text-slate-300">Từng bước cài đặt, chạy ứng dụng độc lập và di chuyển dữ liệu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-900">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý quan trọng:</strong> Ứng dụng Quản lý Xe Đạp Thể Thao Đức Huy được lập trình chuẩn Fullstack bằng <strong>React 19 + TypeScript + Vite + Express</strong>. 
              Bạn có thể chạy trên bất kỳ máy tính nào (Windows, macOS, Linux) độc lập, bảo mật dữ liệu tuyệt đối.
            </div>
          </div>

          <div className="space-y-5">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    {s.title}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-1.5 ml-8">{s.desc}</p>

                {s.command && (
                  <div className="mt-3 ml-8 relative bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                    <pre>{s.command}</pre>
                    <button
                      onClick={() => copyCommand(s.command, idx)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 text-[11px]"
                      title="Sao chép câu lệnh"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-blue-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {s.note && (
                  <p className="text-xs text-slate-500 mt-2 ml-8 italic">
                    💡 {s.note}
                  </p>
                )}

                {s.isDataStep && (
                  <div className="mt-3 ml-8 p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">1. Xuất file dữ liệu từ máy hiện tại:</p>
                      <p className="text-xs text-slate-500">Tải file sao lưu (.json) gồm danh sách xe, tồn kho, đơn hàng.</p>
                    </div>
                    <button
                      onClick={onExportData}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Sao lưu dữ liệu ngay
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Production build instructions */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4">
            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Đóng gói triển khai lâu dài (Production Build):
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Nếu bạn muốn đóng gói ứng dụng để đưa lên máy chủ hoặc chạy ổn định tối đa:
            </p>
            <div className="mt-2 bg-slate-950 p-2.5 rounded font-mono text-xs text-emerald-300">
              npm run build<br />
              npm run preview # Hoặc triển khai thư mục /dist lên hosting
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Khôi phục từ file JSON...</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Đã hiểu, đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
