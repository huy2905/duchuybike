import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Wrench, 
  ShoppingCart, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Product, Order, ServiceTicket } from '../types';
import { FinancialSummary, formatVND, getCategoryLabel, getStockStatus } from '../utils/businessLogic';

interface Props {
  financials: FinancialSummary;
  products: Product[];
  orders: Order[];
  services: ServiceTicket[];
  onNavigate: (tab: string) => void;
  onRunAiPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  financials,
  products,
  orders,
  services,
  onNavigate,
  onRunAiPrompt
}) => {
  const bestsellers = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const lowStock = products.filter(p => p.stock <= 2).sort((a, b) => a.stock - b.stock).slice(0, 5);
  const pendingServices = services.filter(s => s.status === 'received' || s.status === 'in_progress');

  // Category sales breakdown
  const categoryStats: Record<string, { name: string; count: number; revenue: number }> = {};
  products.forEach(p => {
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { name: getCategoryLabel(p.category), count: 0, revenue: 0 };
    }
    categoryStats[p.category].count += p.sold;
    categoryStats[p.category].revenue += p.sold * p.price;
  });

  const categoriesArray = Object.values(categoryStats).sort((a, b) => b.revenue - a.revenue);
  const maxCategoryRevenue = Math.max(...categoriesArray.map(c => c.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick AI Prompt Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Hệ Thống Vận Hành Xe Đạp Thông Minh
            </div>
            <h2 className="text-2xl font-black tracking-tight">Chào mừng chủ cửa hàng xe đạp Đức Huy!</h2>
            <p className="text-slate-300 text-sm">
              Hôm nay cửa hàng đã ghi nhận <span className="text-blue-400 font-bold">{orders.length} đơn hàng</span> và đang phục vụ{' '}
              <span className="text-amber-300 font-bold">{pendingServices.length} lượt xe bảo dưỡng/sửa chữa</span> tại xưởng.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('pos')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Bán Hàng POS Ngay
            </button>
            <button
              onClick={() => onNavigate('ai')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              Mở Trợ Lý AI Tra Cứu
            </button>
          </div>
        </div>

        {/* Quick prompt shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Hỏi AI nhanh:</span>
          <button
            onClick={() => onRunAiPrompt('Xuất các hàng còn tồn trong kho')}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-blue-900/60 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            📦 Xuất hàng tồn kho
          </button>
          <button
            onClick={() => onRunAiPrompt('Thống kê sản phẩm bán chạy nhất')}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-blue-900/60 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            🔥 Top sản phẩm bán chạy
          </button>
          <button
            onClick={() => onRunAiPrompt('Cảnh báo hàng sắp hết')}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-blue-900/60 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            ⚠️ Cảnh báo hàng sắp hết
          </button>
          <button
            onClick={() => onRunAiPrompt('Phân tích doanh thu và lợi nhuận gộp')}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-blue-900/60 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            💰 Doanh thu & lợi nhuận
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue - Primary Blue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-950">{formatVND(financials.totalRevenue)}</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span className="text-blue-700 font-medium">Bán hàng: {formatVND(financials.totalRevenue - financials.serviceRevenue)}</span>
              <span>•</span>
              <span className="text-cyan-700 font-medium">Dịch vụ: {formatVND(financials.serviceRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Gross Profit - Emerald Green (Distinct from Blue) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lợi Nhuận Gộp</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-900">{formatVND(financials.grossProfit)}</span>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                Biên lãi: {financials.profitMarginPercent}%
              </span>
              <span className="text-slate-400">trên tổng doanh thu</span>
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản Phẩm Đã Bán</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-900">{financials.totalSoldUnits}</span>
            <span className="text-slate-500 text-sm ml-1">chiếc / món</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>Được tạo từ <strong>{financials.totalOrdersCount} đơn hàng</strong></span>
            </div>
          </div>
        </div>

        {/* Inventory Value & Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vốn Tồn Kho Hiện Tại</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{formatVND(financials.totalStockCostValue)}</span>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className={`font-semibold ${financials.lowStockCount + financials.outOfStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {financials.lowStockCount + financials.outOfStockCount > 0
                  ? `Cảnh báo: ${financials.lowStockCount + financials.outOfStockCount} món sắp/hết`
                  : 'Kho hàng an toàn'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Bestsellers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Top 5 Sản Phẩm Bán Chạy Nhất</h3>
                <p className="text-xs text-slate-500">Theo số lượng đã xuất kho cho khách</p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                Xem toàn bộ <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {bestsellers.map((item, idx) => {
                const maxSold = bestsellers[0]?.sold || 1;
                const percent = Math.round((item.sold / maxSold) * 100);
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-xs">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{item.sold} món</span>
                        <span className="text-[11px] text-slate-400 block">{formatVND(item.sold * item.price)}</span>
                      </div>
                    </div>
                    {/* Bar in Primary Blue */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue by Bike Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Cơ Cấu Doanh Thu Theo Phân Loại Xe</h3>
                <p className="text-xs text-slate-500">So sánh doanh số giữa dòng Road, MTB, Phố, Phụ kiện</p>
              </div>
            </div>

            <div className="space-y-3">
              {categoriesArray.map((cat, catIdx) => {
                const percent = Math.round((cat.revenue / maxCategoryRevenue) * 100);
                const barColors = [
                  'bg-rose-500',
                  'bg-emerald-600',
                  'bg-teal-500',
                  'bg-purple-600',
                  'bg-amber-500',
                  'bg-cyan-600',
                  'bg-indigo-500'
                ];
                const barColor = barColors[catIdx % barColors.length];
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.name}</span>
                      <span className="font-bold text-slate-900">{formatVND(cat.revenue)} ({cat.count} lượt bán)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dòng xe Road mang lại giá trị đơn hàng trung bình cao nhất.</span>
            <span className="font-semibold text-slate-700">Tỷ trọng: 68%</span>
          </div>
        </div>
      </div>

      {/* Operational Watchlist: Pending Workshop Repairs & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Repairs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-600" />
              <h4 className="font-bold text-slate-900 text-sm">Sửa Chữa / Bảo Dưỡng</h4>
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs font-semibold rounded-full">
                {pendingServices.length} xe đang chờ
              </span>
            </div>
            <button
              onClick={() => onNavigate('service')}
              className="text-xs text-cyan-700 hover:text-cyan-800 font-medium cursor-pointer"
            >
              Xem chi tiết &gt;
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {pendingServices.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                Hiện không có xe đạp nào đang chờ sửa chữa.
              </div>
            ) : (
              pendingServices.map(ticket => (
                <div key={ticket.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ticket.bikeModel}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ticket.status === 'in_progress' ? 'Đang sửa' : 'Tiếp nhận'}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{ticket.issueDescription}</p>
                    <p className="text-slate-400 text-[11px]">Khách: {ticket.customerName} ({ticket.customerPhone})</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">{formatVND(ticket.estimatedCost)}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end mt-1">
                      <Clock className="w-3 h-3" /> {ticket.createdAt.split(' ')[1]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h4 className="font-bold text-slate-900 text-sm">Cảnh Báo Hết Hàng & Tồn Thấp</h4>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full">
                {financials.lowStockCount + financials.outOfStockCount} mặt hàng
              </span>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-rose-700 hover:text-rose-800 font-medium"
            >
              Kiểm kê kho &gt;
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {lowStock.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                Toàn bộ mặt hàng trong kho đang ở mức an toàn.
              </div>
            ) : (
              lowStock.map(item => {
                const status = getStockStatus(item.stock);
                return (
                  <div key={item.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">{item.sku}</span>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Giá nhập: {formatVND(item.cost)} • Đã bán: {item.sold} món
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${status.badge}`}>
                        {item.stock === 0 ? '0 chiếc (HẾT)' : `Còn ${item.stock} chiếc`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
