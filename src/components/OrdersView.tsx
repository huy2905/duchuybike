import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Download, 
  Printer, 
  Trash2, 
  Eye, 
  CreditCard, 
  Banknote, 
  QrCode,
  DollarSign,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Order } from '../types';
import { formatVND, exportToCSV } from '../utils/businessLogic';

interface Props {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onCancelOrder: (id: string) => void;
}

export const OrdersView: React.FC<Props> = ({ orders, onViewOrder, onCancelOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => {
    return o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.customerPhone.includes(searchTerm);
  });

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCost = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalProfit = totalSales - totalCost;

  const handleExportCsv = () => {
    const headers = ['Mã Đơn', 'Ngày Giờ', 'Khách Hàng', 'Số Điện Thoại', 'Tổng Tiền', 'Giá Vốn', 'Lợi Nhuận', 'Phương Thức', 'Ghi Chú'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.time,
      o.customerName,
      o.customerPhone,
      o.totalAmount,
      o.totalCost,
      o.totalAmount - o.totalCost,
      o.paymentMethod,
      o.notes || ''
    ]);
    exportToCSV(`DucHuyBike_DonHang_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng Đã Bán</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{orders.length} đơn</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh Thu Bán Hàng</span>
          <div className="text-2xl font-black text-blue-900 mt-2">{formatVND(totalSales)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lợi Nhuận Gộp Đơn Hàng</span>
          <div className="text-2xl font-black text-emerald-700 mt-2">{formatVND(totalProfit)}</div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn (DH-1001), tên khách hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Đơn Hàng (CSV)</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Chi tiết món hàng</th>
                <th className="px-4 py-3 text-right">Tổng thanh toán</th>
                <th className="px-4 py-3 text-center">Thanh toán</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {order.time}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">{order.customerName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{order.customerPhone || 'Khách lẻ'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-slate-800">{item.quantity}x</span>
                            <span className="text-slate-700">{item.name}</span>
                            {item.frameNumber && (
                              <span className="font-mono text-[10px] text-blue-800 bg-blue-50 px-1 py-0.2 rounded font-bold">
                                [{item.frameNumber}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 text-sm whitespace-nowrap">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.paymentMethod === 'transfer'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : order.paymentMethod === 'card'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {order.paymentMethod === 'transfer' ? <QrCode className="w-3 h-3" /> : order.paymentMethod === 'card' ? <CreditCard className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                        {order.paymentMethod === 'transfer' ? 'VietQR' : order.paymentMethod === 'card' ? 'Thẻ' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewOrder(order)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          title="Xem & in lại hóa đơn"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Hóa đơn</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn hủy đơn hàng ${order.id} và hoàn lại số lượng tồn kho?`)) {
                              onCancelOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hủy đơn và hoàn kho"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
