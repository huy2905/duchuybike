import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Bike, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Customer, Order, ServiceTicket, Product } from '../types';
import { formatVND } from '../utils/businessLogic';

interface Props {
  customers: Customer[];
  orders: Order[];
  services: ServiceTicket[];
  products: Product[];
}

export const CustomerWarrantyView: React.FC<Props> = ({
  customers,
  orders,
  services,
  products
}) => {
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupQuery.trim().toLowerCase();
    if (!query) {
      setLookupResult(null);
      return;
    }

    // Match orders by customer phone or frame number
    const matchedOrders = orders.filter(o => 
      o.customerPhone.includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.items.some(i => i.frameNumber && i.frameNumber.toLowerCase().includes(query))
    );

    // Match service tickets
    const matchedServices = services.filter(s =>
      s.customerPhone.includes(query) ||
      s.customerName.toLowerCase().includes(query) ||
      (s.frameNumber && s.frameNumber.toLowerCase().includes(query))
    );

    setLookupResult({
      query: lookupQuery,
      orders: matchedOrders,
      services: matchedServices
    });
  };

  return (
    <div className="space-y-6">
      {/* Warranty Lookup Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-300 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">Tra Cứu Bảo Hành Khung Xe & Lịch Sử Khách Hàng</h2>
            <p className="text-xs text-slate-300">
              Nhập Số Điện Thoại khách hàng hoặc Số Khung xe đạp để kiểm tra thời hạn bảo hành và lịch sử sửa chữa
            </p>
          </div>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Nhập SĐT (ví dụ: 0912345678) hoặc Số Khung (GNT-ATX-301)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-300 focus:outline-none focus:bg-white focus:text-slate-900 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0 shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Tra Cứu Ngay
          </button>
        </form>
      </div>

      {/* Lookup Result Box */}
      {lookupResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Kết quả tra cứu cho</span>
              <h3 className="text-lg font-bold text-slate-900">"{lookupResult.query}"</h3>
            </div>
            <button
              onClick={() => {
                setLookupQuery('');
                setLookupResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>

          {lookupResult.orders.length === 0 && lookupResult.services.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              Không tìm thấy thông tin bảo hành nào khớp với từ khóa "{lookupResult.query}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Warranty records from orders */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-blue-600" />
                  Xe đạp đã mua & Thời hạn bảo hành
                </h4>
                {lookupResult.orders.map((ord: Order) => (
                  <div key={ord.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{ord.customerName} ({ord.customerPhone})</span>
                      <span className="text-slate-400 font-mono">{ord.time}</span>
                    </div>
                    {ord.items.map((item, i) => (
                      <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{item.name}</span>
                          <span className="text-slate-900 font-bold">{formatVND(item.price)}</span>
                        </div>
                        {item.frameNumber && (
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                              Khung: {item.frameNumber}
                            </span>
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Còn trong hạn bảo hành
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Maintenance history */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  Lịch sử sửa chữa & bảo dưỡng tại xưởng
                </h4>
                {lookupResult.services.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có lượt sửa chữa nào được ghi nhận.</p>
                ) : (
                  lookupResult.services.map((svc: ServiceTicket) => (
                    <div key={svc.id} className="bg-cyan-50/50 p-3.5 rounded-xl border border-cyan-100 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{svc.bikeModel}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-cyan-200 text-cyan-900">
                          {svc.serviceType === 'maintenance' ? 'Bảo dưỡng' : svc.serviceType === 'both' ? 'Sửa & Bảo dưỡng' : 'Sửa chữa'}
                        </span>
                      </div>
                      {svc.bikeParts && svc.bikeParts.length > 0 && (
                        <div className="text-[11px] text-cyan-800 font-semibold">
                          Bộ phận: {svc.bikeParts.join(', ')}
                        </div>
                      )}
                      <p className="text-slate-600">{svc.issueDescription}</p>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-cyan-100">
                        <span>Chi phí: <strong className="text-emerald-700">{formatVND(svc.actualCost ?? svc.estimatedCost)}</strong></span>
                        <span>{svc.createdAt}</span>
                      </div>
                      {svc.mechanicNotes && (
                        <p className="text-cyan-900 font-medium text-[11px]">Đã xử lý: {svc.mechanicNotes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customers List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Danh Bạ Khách Hàng Thân Thiết</h3>
          </div>
          <span className="text-xs text-slate-500">{customers.length} khách hàng đã lưu</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Tên khách hàng</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3 text-center">Số đơn đã mua</th>
                <th className="px-4 py-3 text-right">Tổng chi tiêu</th>
                <th className="px-4 py-3 text-right">Mua gần nhất</th>
                <th className="px-4 py-3 text-center">Tra cứu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-500">{c.address || 'Hà Nội'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-purple-700">{c.orderCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700 text-sm">{formatVND(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{c.lastPurchaseDate || 'Mới'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setLookupQuery(c.phone);
                        const matchedOrders = orders.filter(o => o.customerPhone === c.phone);
                        const matchedServices = services.filter(s => s.customerPhone === c.phone);
                        setLookupResult({
                          query: c.phone,
                          orders: matchedOrders,
                          services: matchedServices
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded font-semibold text-[11px] cursor-pointer transition-colors"
                    >
                      Xem bảo hành
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
