import React from 'react';
import { Bike, Sparkles, RefreshCw, Download, Upload, Laptop, AlertTriangle } from 'lucide-react';
import { FinancialSummary } from '../utils/businessLogic';
import { formatVND } from '../utils/businessLogic';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  financials: FinancialSummary;
  onResetDemo: () => void;
  onOpenRunModal: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<Props> = ({
  financials,
  onResetDemo,
  onOpenRunModal,
  onExportData,
  onImportData
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">Xe Đạp Thể Thao Đức Huy</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Hotline: 0962.616.402 - 33 Trần Đăng Ninh, TP. Ninh Bình</p>
          </div>
        </div>

        {/* Live Mini Stats */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Doanh thu</span>
            <span className="font-bold text-blue-400">{formatVND(financials.totalRevenue)}</span>
          </div>
          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Tổng tồn kho</span>
            <span className="font-bold text-white">{financials.totalUnitsInStock} chiếc/món</span>
          </div>
          {financials.lowStockCount + financials.outOfStockCount > 0 && (
            <div className="bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/60 flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <span className="text-amber-400 block text-[10px]">Cảnh báo kho</span>
                <span className="font-bold">{financials.lowStockCount + financials.outOfStockCount} mặt hàng cần nhập</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 flex-wrap justify-end text-xs">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Run on other machine button */}
          <button
            onClick={onOpenRunModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors shadow-xs cursor-pointer border border-slate-700"
            title="Xem hướng dẫn chạy ứng dụng này trên một máy tính khác"
          >
            <Laptop className="w-3.5 h-3.5 text-blue-400" />
            <span>Chạy trên máy khác</span>
          </button>

          {/* Backup Data */}
          <button
            onClick={onExportData}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            title="Xuất file JSON sao lưu toàn bộ dữ liệu"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sao lưu</span>
          </button>

          {/* Restore Data */}
          <label
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Khôi phục dữ liệu từ file JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi phục</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/50 hover:text-rose-200 text-slate-300 rounded-lg transition-colors"
            title="Khôi phục về dữ liệu mẫu ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dữ liệu mẫu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
