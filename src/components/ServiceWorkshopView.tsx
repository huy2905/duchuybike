import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Bike, 
  Check, 
  Printer, 
  X, 
  Sparkles,
  Filter,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ServiceTicket, ServiceStatus, ServiceType } from '../types';
import { formatVND } from '../utils/businessLogic';

interface Props {
  services: ServiceTicket[];
  onAddService: (ticket: ServiceTicket) => void;
  onUpdateStatus: (id: string, status: ServiceStatus, actualCost?: number) => void;
}

// Danh sách các bộ phận xe đạp phổ biến để chọn nhanh
const COMMON_BIKE_PARTS = [
  '⚙️ Bộ đề / Líp / Xích líp',
  '🛑 Phanh / Thắng đĩa / Phanh dầu',
  '🚴 Bánh xe / Vành / Săm lốp',
  '🔩 Cổ phốt / Trục giữa / Bàn đạp',
  '🚲 Khung sườn / Ghi đông / Cọc yên',
  '⚡ Phuộc nhún / Thụt giảm xóc',
  '🌟 Bảo dưỡng toàn bộ xe (Toàn diện)'
];

export const ServiceWorkshopView: React.FC<Props> = ({
  services,
  onAddService,
  onUpdateStatus
}) => {
  // Lọc theo loại hình (Tất cả, Sửa chữa, Bảo dưỡng) và trạng thái
  const [filterType, setFilterType] = useState<'all' | 'repair' | 'maintenance'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal tạo phiếu
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal in phiếu giao nhận
  const [printingTicket, setPrintingTicket] = useState<ServiceTicket | null>(null);

  // Form state cho phiếu mới
  const [serviceType, setServiceType] = useState<ServiceType>('repair');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [frameNumber, setFrameNumber] = useState('');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [issueDescription, setIssueDescription] = useState('');
  const [laborCost, setLaborCost] = useState('100000');
  const [partsCost, setPartsCost] = useState('50000');
  const [mechanicNotes, setMechanicNotes] = useState('');

  // Toggle chọn bộ phận xe
  const togglePart = (part: string) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter(p => p !== part));
    } else {
      setSelectedParts([...selectedParts, part]);
    }
  };

  // Tính tổng tiền ước tính
  const totalCostEstimate = (Number(laborCost) || 0) + (Number(partsCost) || 0);

  // Lọc danh sách
  const filteredTickets = services.filter(t => {
    const matchesType = filterType === 'all' 
      ? true 
      : filterType === 'repair' 
      ? (t.serviceType === 'repair' || t.serviceType === 'both')
      : (t.serviceType === 'maintenance' || t.serviceType === 'both');

    const matchesStatus = filterStatus === 'all' ? true : t.status === filterStatus;

    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      t.customerName.toLowerCase().includes(query) ||
      t.customerPhone.includes(query) ||
      (t.customerAddress && t.customerAddress.toLowerCase().includes(query)) ||
      t.bikeModel.toLowerCase().includes(query) ||
      (t.frameNumber && t.frameNumber.toLowerCase().includes(query)) ||
      (t.bikeParts && t.bikeParts.some(p => p.toLowerCase().includes(query)));

    return matchesType && matchesStatus && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !bikeModel) {
      alert('Vui lòng điền Họ tên khách, Số điện thoại và Dòng xe!');
      return;
    }

    const newTicket: ServiceTicket = {
      id: `SC-${Math.floor(2000 + Math.random() * 8000)}`,
      serviceType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || 'Hà Nội',
      bikeModel: bikeModel.trim(),
      frameNumber: frameNumber.trim() || undefined,
      bikeParts: selectedParts.length > 0 ? selectedParts : ['Kiểm tra tổng thể'],
      issueDescription: issueDescription.trim() || (serviceType === 'maintenance' ? 'Bảo dưỡng định kỳ theo yêu cầu' : 'Sửa chữa theo yêu cầu'),
      laborCost: Number(laborCost) || 0,
      partsCost: Number(partsCost) || 0,
      estimatedCost: totalCostEstimate,
      status: 'received',
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      mechanicNotes: mechanicNotes.trim() || undefined
    };

    onAddService(newTicket);
    setIsModalOpen(false);

    // Reset form
    setServiceType('repair');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setBikeModel('');
    setFrameNumber('');
    setSelectedParts([]);
    setIssueDescription('');
    setLaborCost('100000');
    setPartsCost('50000');
    setMechanicNotes('');
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'received':
        return { label: 'Vừa tiếp nhận xe', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'in_progress':
        return { label: 'Đang sửa chữa / bảo dưỡng', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'completed':
        return { label: 'Đã hoàn tất (Chờ giao)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'delivered':
        return { label: 'Đã giao xe cho khách', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const getTypeBadge = (type: ServiceType) => {
    switch (type) {
      case 'maintenance':
        return { label: 'BẢO DƯỠNG XE', bg: 'bg-teal-50 text-teal-800 border-teal-300' };
      case 'both':
        return { label: 'VỪA SỬA VỪA BẢO DƯỠNG', bg: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'repair':
      default:
        return { label: 'SỬA CHỮA XE', bg: 'bg-amber-50 text-amber-900 border-amber-300' };
    }
  };

  const repairCount = services.filter(s => s.serviceType === 'repair' || s.serviceType === 'both').length;
  const maintenanceCount = services.filter(s => s.serviceType === 'maintenance' || s.serviceType === 'both').length;
  const inProgressCount = services.filter(s => s.status === 'received' || s.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Top Banner - Thiết kế to rõ, dễ nhìn cho người lớn tuổi */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sửa Chữa / Bảo Dưỡng Xe Đạp</h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
                {inProgressCount} xe đang chờ xử lý
              </span>
            </div>
            <p className="text-base text-slate-600 mt-1 font-medium">
              Quản lý chi tiết xe sửa chữa, xe bảo dưỡng định kỳ, bộ phận cần làm, chi phí và thông tin khách hàng.
            </p>
          </div>
        </div>

        {/* Nút to để tiếp nhận xe mới */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-6 py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl text-base font-black shadow-lg shadow-emerald-900/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          <span>Tiếp Nhận Xe Mới</span>
        </button>
      </div>

      {/* Bộ Lọc & Tìm Kiếm To Rõ Bản */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
        {/* Hàng 1: Nút chọn phân loại Sửa chữa hay Bảo dưỡng (To, rõ ràng) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 mr-1">Phân loại xe:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-300 text-sm font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Tất Cả ({services.length})
              </button>
              <button
                onClick={() => setFilterType('repair')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'repair'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>🛠️ Xe Sửa Chữa</span>
                <span className="text-xs bg-amber-700/40 px-1.5 py-0.5 rounded-full">{repairCount}</span>
              </button>
              <button
                onClick={() => setFilterType('maintenance')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'maintenance'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-teal-900 hover:bg-teal-50'
                }`}
              >
                <span>✨ Xe Bảo Dưỡng</span>
                <span className="text-xs bg-teal-800/40 px-1.5 py-0.5 rounded-full">{maintenanceCount}</span>
              </button>
            </div>
          </div>

          {/* Ô tìm kiếm to */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, loại xe, bộ phận..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-base text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
            />
          </div>
        </div>

        {/* Hàng 2: Trạng thái tiến độ (Tiếp nhận -> Đang sửa -> Đã xong -> Đã giao) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
          <span className="text-sm font-bold text-slate-600 mr-1">Trạng thái xe:</span>
          {[
            { id: 'all', label: 'Tất cả trạng thái' },
            { id: 'received', label: '1. Vừa tiếp nhận' },
            { id: 'in_progress', label: '2. Đang sửa / bảo dưỡng' },
            { id: 'completed', label: '3. Đã xong (Chờ giao)' },
            { id: 'delivered', label: '4. Đã giao xe & thu tiền' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh Sách Thẻ Phiếu Sửa Chữa / Bảo Dưỡng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border-2 border-slate-300 p-12 text-center text-slate-500 space-y-3">
            <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-600" />
            <h3 className="text-xl font-black text-slate-800">Không có phiếu nào theo điều kiện lọc</h3>
            <p className="text-base text-slate-500 max-w-md mx-auto">
              Bạn có thể nhấn nút "Tiếp Nhận Xe Mới" ở góc trên để tạo phiếu khi có khách mang xe đến.
            </p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const statusBadge = getStatusBadge(ticket.status);
            const typeBadge = getTypeBadge(ticket.serviceType);

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl border-2 border-slate-300 hover:border-emerald-600 shadow-sm p-6 flex flex-col justify-between space-y-5 transition-all"
              >
                <div className="space-y-4">
                  {/* Header thẻ: Mã phiếu + Loại hình Sửa/Bảo dưỡng + Trạng thái */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        {ticket.id}
                      </span>
                      <span className={`text-xs font-black px-3 py-1 rounded-lg border-2 ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Tên dòng xe đạp to rõ */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Bike className="w-5 h-5 text-emerald-700 shrink-0" />
                      <h3 className="text-xl font-black text-slate-900 leading-snug">{ticket.bikeModel}</h3>
                    </div>
                    {ticket.frameNumber && (
                      <p className="text-xs text-slate-500 font-mono mt-0.5 ml-7">
                        Số khung xe: <span className="font-bold text-slate-700">{ticket.frameNumber}</span>
                      </p>
                    )}
                  </div>

                  {/* Thông tin khách hàng (Tên, SĐT, Địa chỉ - To, rõ) */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="text-base">{ticket.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-base font-black">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{ticket.customerPhone}</span>
                      </div>
                    </div>
                    {ticket.customerAddress && (
                      <div className="flex items-start gap-2 text-slate-600 text-xs pt-1 border-t border-slate-200">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{ticket.customerAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Bộ phận sửa / bảo dưỡng trên xe */}
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                      Bộ phận cần sửa chữa / bảo dưỡng trên xe:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.bikeParts && ticket.bikeParts.length > 0 ? (
                        ticket.bikeParts.map((part, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg"
                          >
                            {part}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Kiểm tra căn chỉnh tổng quát</span>
                      )}
                    </div>
                  </div>

                  {/* Mô tả chi tiết vấn đề / tình trạng xe */}
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-sm text-slate-800">
                    <span className="text-xs font-black text-amber-900 block mb-0.5">Hiện trạng & Yêu cầu:</span>
                    <p className="font-medium leading-relaxed">{ticket.issueDescription}</p>
                  </div>

                  {ticket.mechanicNotes && (
                    <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                      <strong className="text-slate-800">Ghi chú thợ:</strong> {ticket.mechanicNotes}
                    </div>
                  )}
                </div>

                {/* Phần chi phí & Thao tác chuyển trạng thái */}
                <div className="pt-4 border-t-2 border-slate-100 space-y-4">
                  {/* Bảng chi tiết chi phí */}
                  <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-sm gap-2">
                    <div className="space-y-0.5 text-xs text-slate-600">
                      <div>Công thợ: <strong>{formatVND(ticket.laborCost ?? 0)}</strong></div>
                      <div>Linh kiện thay thế: <strong>{formatVND(ticket.partsCost ?? 0)}</strong></div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block font-semibold">TỔNG CHI PHÍ:</span>
                      <span className="text-xl font-black text-emerald-800 block">
                        {formatVND(ticket.actualCost ?? ticket.estimatedCost)}
                      </span>
                    </div>
                  </div>

                  {/* Nút in phiếu giao nhận & Nút đổi trạng thái */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => setPrintingTicket(ticket)}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      title="In phiếu tiếp nhận cho khách hàng giữ"
                    >
                      <Printer className="w-4 h-4" />
                      <span>In Phiếu Giao Nhận</span>
                    </button>

                    {/* Nút chuyển trạng thái tiếp theo */}
                    {ticket.status === 'received' && (
                      <button
                        onClick={() => onUpdateStatus(ticket.id, 'in_progress')}
                        className="flex-1 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Bắt Đầu Làm Xe</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {ticket.status === 'in_progress' && (
                      <button
                        onClick={() => onUpdateStatus(ticket.id, 'completed')}
                        className="flex-1 w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <span>Đã Làm Xong, Báo Khách</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {ticket.status === 'completed' && (
                      <button
                        onClick={() => onUpdateStatus(ticket.id, 'delivered')}
                        className="flex-1 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Bàn Giao Xe & Thu Tiền</span>
                      </button>
                    )}

                    {ticket.status === 'delivered' && (
                      <div className="flex-1 w-full py-2.5 bg-emerald-50 text-emerald-800 border-2 border-emerald-300 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Đã giao xe và hoàn tất thanh toán</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL TẠO PHIẾU TIẾP NHẬN XE MỚI - Giao diện to rõ cho người lớn tuổi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-slate-300 overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Tạo Phiếu Tiếp Nhận Xe Đạp Mới</h3>
                  <p className="text-sm text-slate-300">Điền thông tin khách hàng, phân loại và các bộ phận cần sửa / bảo dưỡng</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form nội dung */}
            <form onSubmit={handleCreateTicket} className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Mục 1: Chọn loại hình (Sửa chữa hay Bảo dưỡng) */}
              <div className="space-y-2">
                <label className="text-base font-black text-slate-900 block">
                  1. Xe cần Sửa Chữa hay Bảo Dưỡng? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceType('repair')}
                    className={`py-3.5 px-4 rounded-xl border-2 font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      serviceType === 'repair'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>🛠️ Sửa Chữa Xe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('maintenance')}
                    className={`py-3.5 px-4 rounded-xl border-2 font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      serviceType === 'maintenance'
                        ? 'bg-teal-700 text-white border-teal-700 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>✨ Bảo Dưỡng Xe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('both')}
                    className={`py-3.5 px-4 rounded-xl border-2 font-black text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      serviceType === 'both'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>🔄 Cả Sửa & Bảo Dưỡng</span>
                  </button>
                </div>
              </div>

              {/* Mục 2: Thông tin khách hàng (Họ tên, SĐT, Địa chỉ) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                <label className="text-base font-black text-slate-900 block">
                  2. Thông Tin Khách Hàng Mang Xe Đến *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-1">Họ và tên khách hàng *</span>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ví dụ: Bác Tuấn, Anh Hoàng..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-1">Số điện thoại *</span>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="0912 345 678..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">Địa chỉ khách hàng (để liên hệ trả xe)</span>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="Ví dụ: Số 25 Nguyễn Trãi, Thanh Xuân, Hà Nội..."
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Mục 3: Thông tin dòng xe */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
                <label className="text-base font-black text-slate-900 block">
                  3. Dòng Xe Đạp & Số Khung
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-1">Tên dòng xe đạp *</span>
                    <input
                      type="text"
                      required
                      value={bikeModel}
                      onChange={e => setBikeModel(e.target.value)}
                      placeholder="Ví dụ: Giant ATX 830, Trek Marlin..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-1">Số khung xe (nếu có để bảo hành)</span>
                    <input
                      type="text"
                      value={frameNumber}
                      onChange={e => setFrameNumber(e.target.value)}
                      placeholder="GNT-ATX-301..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-mono text-slate-900 uppercase focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Mục 4: Chọn các bộ phận cần sửa / bảo dưỡng trên xe */}
              <div className="space-y-2">
                <label className="text-base font-black text-slate-900 block">
                  4. Sửa Hay Bảo Dưỡng Phần Gì Trên Xe? (Nhấn để chọn nhanh)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_BIKE_PARTS.map(part => {
                    const isSelected = selectedParts.includes(part);
                    return (
                      <button
                        key={part}
                        type="button"
                        onClick={() => togglePart(part)}
                        className={`p-3 rounded-xl border-2 text-left font-bold text-sm flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{part}</span>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mục 5: Mô tả chi tiết hiện trạng */}
              <div className="space-y-1">
                <label className="text-base font-black text-slate-900 block">
                  5. Mô Tả Chi Tiết Yêu Cầu Của Khách / Lỗi Của Xe
                </label>
                <textarea
                  rows={2}
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  placeholder="Ví dụ: Bộ đề bị nhảy líp cọc cạch khi leo dốc; đĩa phanh trước kêu rít; cần thay săm sau..."
                  className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl text-base font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Mục 6: Chi phí sửa chữa & bảo dưỡng */}
              <div className="space-y-3 bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-200">
                <label className="text-base font-black text-emerald-950 block">
                  6. Chi Phí Sửa Chữa / Bảo Dưỡng Hết Bao Nhiêu?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">Tiền công thợ (VNĐ):</span>
                    <input
                      type="number"
                      step="10000"
                      value={laborCost}
                      onChange={e => setLaborCost(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">Tiền phụ tùng thay mới (VNĐ):</span>
                    <input
                      type="number"
                      step="10000"
                      value={partsCost}
                      onChange={e => setPartsCost(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-sm">TỔNG CHI PHÍ DỰ KIẾN:</span>
                  <span className="text-2xl font-black text-emerald-800">
                    {formatVND(totalCostEstimate)}
                  </span>
                </div>
              </div>

              {/* Nút lưu */}
              <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-base font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-base font-black shadow-lg shadow-emerald-900/20 cursor-pointer"
                >
                  Hoàn Tất & Tiếp Nhận Xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IN PHIẾU TIẾP NHẬN XE CHO KHÁCH GIỮ */}
      {printingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border-2 border-slate-300 shadow-2xl">
            {/* Thanh điều khiển trên cùng (ẩn khi in) */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200 print:hidden">
              <h4 className="text-lg font-black text-slate-900">Phiếu Giao Nhận Xe Đạp</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu Này</span>
                </button>
                <button
                  onClick={() => setPrintingTicket(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* BẢN PHIẾU IN TRANG TRỌNG CHO KHÁCH HÀNG */}
            <div className="p-6 bg-white border-2 border-slate-800 rounded-xl space-y-4 text-slate-900 font-sans" id="printable-service-ticket">
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-2xl font-black uppercase tracking-wide">CỬA HÀNG XE ĐẠP THỂ THAO ĐỨC HUY</h2>
                <p className="text-xs text-slate-600">Địa chỉ: 128 Nguyễn Trãi, Thanh Xuân, Hà Nội • Hotline: 0912.345.678</p>
                <h3 className="text-xl font-bold mt-2 text-emerald-800">
                  PHIẾU TIẾP NHẬN SỬA CHỮA / BẢO DƯỠNG XE
                </h3>
                <span className="font-mono text-sm font-bold bg-slate-100 px-3 py-1 rounded inline-block mt-1">
                  Mã số: {printingTicket.id} - Ngày nhận: {printingTicket.createdAt}
                </span>
              </div>

              {/* Thông tin khách hàng & xe */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Khách hàng: <strong>{printingTicket.customerName}</strong></div>
                <div>Số điện thoại: <strong>{printingTicket.customerPhone}</strong></div>
                <div className="col-span-2">Địa chỉ: <strong>{printingTicket.customerAddress || 'Hà Nội'}</strong></div>
                <div>Loại xe: <strong>{printingTicket.bikeModel}</strong></div>
                <div>Số khung: <strong>{printingTicket.frameNumber || 'N/A'}</strong></div>
                <div className="col-span-2">
                  Phân loại: <strong className="uppercase text-emerald-800">
                    {printingTicket.serviceType === 'maintenance' ? 'Bảo Dưỡng Xe' : printingTicket.serviceType === 'both' ? 'Sửa Chữa & Bảo Dưỡng' : 'Sửa Chữa Xe'}
                  </strong>
                </div>
              </div>

              {/* Bộ phận & Chi phí */}
              <div className="border-t border-b border-slate-300 py-3 text-sm space-y-2">
                <div>
                  <strong>Bộ phận xử lý trên xe:</strong>{' '}
                  <span>{(printingTicket.bikeParts || []).join(', ')}</span>
                </div>
                <div>
                  <strong>Yêu cầu / Tình trạng:</strong> {printingTicket.issueDescription}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-300 font-bold">
                  <span>Tổng chi phí dự kiến:</span>
                  <span className="text-xl text-emerald-800 font-black">
                    {formatVND(printingTicket.actualCost ?? printingTicket.estimatedCost)}
                  </span>
                </div>
              </div>

              {/* Chữ ký hai bên */}
              <div className="grid grid-cols-2 text-center text-xs pt-4">
                <div>
                  <p className="font-bold">KHÁCH HÀNG</p>
                  <p className="italic text-slate-400 mt-8">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold">ĐẠI DIỆN CỬA HÀNG</p>
                  <p className="italic text-slate-400 mt-8">(Ký và bàn giao)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 print:hidden">
              <button
                onClick={() => setPrintingTicket(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
