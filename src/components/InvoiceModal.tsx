import React from 'react';
import { X, Printer, CheckCircle, Bike, QrCode } from 'lucide-react';
import { Order } from '../types';
import { formatVND } from '../utils/businessLogic';

interface Props {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col">
        {/* Actions bar (hidden in print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Đơn hàng thành công & đã trừ kho
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              In Hóa Đơn (PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 space-y-6 text-slate-800 bg-white" id="printable-invoice">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6 border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 font-black text-2xl tracking-tight text-slate-900">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Bike className="w-5 h-5" />
                </div>
                <span>Xe Đạp Thể Thao Đức Huy</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Cửa Hàng Xe Đạp & Phụ Kiện Thể Thao Cao Cấp</p>
              <p className="text-xs text-slate-500">Địa chỉ: 33 Trần Đăng Ninh, TP. Ninh Bình</p>
              <p className="text-xs text-slate-600 font-medium">Hotline bảo hành: 0962.616.402 - 0949.127.212</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 font-mono text-xs font-bold text-slate-800 rounded">
                {order.id}
              </span>
              <p className="text-xs text-slate-400 mt-1">{order.time}</p>
              <p className="text-xs text-slate-600 mt-1">Thu ngân: {order.staffName}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="font-semibold text-slate-900">{order.customerName || 'Khách lẻ tại quầy'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="font-medium text-slate-800">{order.customerPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phương thức thanh toán:</span>
              <span className="font-medium capitalize text-slate-800">
                {order.paymentMethod === 'transfer' ? 'Chuyển khoản VietQR' : order.paymentMethod === 'card' ? 'Thẻ POS' : 'Tiền mặt'}
              </span>
            </div>
            {order.notes && (
              <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-500 italic">
                <span>Ghi chú:</span>
                <span>{order.notes}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-semibold">Sản phẩm & Số khung</th>
                <th className="py-2 text-center font-semibold">SL</th>
                <th className="py-2 text-right font-semibold">Đơn giá</th>
                <th className="py-2 text-right font-semibold">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2.5">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>SKU: {item.sku}</span>
                      {item.frameNumber && (
                        <span className="font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                          Khung: {item.frameNumber}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-medium">{item.quantity}</td>
                  <td className="py-2.5 text-right text-slate-600">{formatVND(item.price)}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">{formatVND(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Tổng thanh toán:</span>
              <span className="text-blue-900 text-lg font-black">{formatVND(order.totalAmount)}</span>
            </div>
          </div>

          {/* Footer & Warranty notice */}
          <div className="pt-4 border-t border-dashed border-slate-200 text-center space-y-1.5 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Chính sách bảo hành & chăm sóc khách hàng xe đạp Đức Huy:</p>
            <p>• Bảo hành chính hãng khung sườn 12 - 36 tháng theo số khung ghi trên hóa đơn.</p>
            <p>• Miễn phí 100% căn chỉnh đề phanh, tra dầu xích định kỳ trong 12 tháng đầu tiên.</p>
            <p className="italic pt-2 text-slate-400">Cảm ơn Quý khách đã đồng hành cùng Xe thể thao Đức Huy. Chúc Quý khách có những cung đường an toàn!</p>
          </div>
        </div>

        {/* Bottom Button (hidden in print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
