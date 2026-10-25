import React, { useState } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, X, ExternalLink, HelpCircle, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If already installed and running standalone
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Đang chạy App độc lập</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/30 cursor-pointer"
        title="Cài đặt phần mềm vào máy tính hoặc điện thoại để dùng như App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Cài App Vào Máy</span>
      </button>

      {/* Guide Modal for Desktop, Android, iOS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Cài Đặt Đức Huy Bike Thành Ứng Dụng</h4>
                  <p className="text-xs text-slate-300">Dùng độc lập không cần mở trình duyệt, có icon ngoài màn hình</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Option 1: Chrome / Edge on Computer */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>Cách 1: Trên Máy Tính (Windows / macOS qua Chrome / Edge / Cốc Cốc)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  1. Mở liên kết ứng dụng này trên trình duyệt <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>.<br />
                  2. Nhìn lên thanh địa chỉ (URL) ở góc trên bên phải, bấm vào biểu tượng <strong>Cài đặt ứng dụng</strong> (hình màn hình máy tính có dấu mũi tên tải xuống ⬇️).<br />
                  3. Bấm <strong>"Cài đặt" (Install)</strong>. Ngay lập tức một icon <strong>Đức Huy Bike</strong> sẽ xuất hiện trên Màn hình chính (Desktop) và thanh Taskbar của máy tính!
                </p>
                {isInstallable && (
                  <button
                    onClick={async () => {
                      setShowModal(false);
                      await install();
                    }}
                    className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Bấm vào đây để cài đặt ngay lập tức</span>
                  </button>
                )}
              </div>

              {/* Option 2: Mobile Phones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Android */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Điện Thoại Android</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    1. Mở trang web bằng Chrome.<br />
                    2. Bấm vào dấu <strong>3 chấm ⋮</strong> ở góc trên bên phải.<br />
                    3. Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                  </p>
                </div>

                {/* iPhone / iPad */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>iPhone / iPad (Safari)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    1. Mở trang web bằng trình duyệt Safari.<br />
                    2. Bấm vào nút <strong>Chia sẻ (hình vuông mũi tên lên)</strong> ở cạnh dưới màn hình.<br />
                    3. Cuộn xuống chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>

              {/* Link copy helper */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Link truy cập trực tiếp:</span>
                  <span className="font-mono text-[11px] text-slate-800 break-all">{window.location.origin}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                >
                  {copiedLink ? 'Đã sao chép!' : 'Sao chép link'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Đã hiểu, đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
