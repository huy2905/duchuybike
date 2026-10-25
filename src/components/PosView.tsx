import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  QrCode, 
  CreditCard, 
  Banknote, 
  CheckCircle,
  Bike,
  Package,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { Product, Order, OrderItem, ProductCategory } from '../types';
import { formatVND, getCategoryLabel, getStockStatus } from '../utils/businessLogic';

interface Props {
  products: Product[];
  onCompleteOrder: (order: Order) => void;
}

export const PosView: React.FC<Props> = ({ products, onCompleteOrder }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<Array<OrderItem & { maxStock: number; availableFrames?: string[] }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('transfer');
  const [notes, setNotes] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Road', label: 'Xe Đua (Road)' },
    { id: 'MTB', label: 'Xe Địa Hình' },
    { id: 'City', label: 'Xe Phố / Touring' },
    { id: 'Kids', label: 'Xe Trẻ Em' },
    { id: 'Accessory', label: 'Phụ Kiện & Phụ Tùng' },
    { id: 'Service', label: 'Dịch Vụ' }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'City' ? (p.category === 'City' || p.category === 'Touring') : p.category === selectedCategory);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0 && product.category !== 'Service') return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock && product.category !== 'Service') {
          return prev;
        }
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const defaultFrame = (product.frameNumbers && product.frameNumbers.length > 0)
          ? product.frameNumbers[0]
          : undefined;

        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            cost: product.cost,
            quantity: 1,
            maxStock: product.stock,
            frameNumber: defaultFrame,
            availableFrames: product.frameNumbers
          }
        ];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (item.category !== 'Service' && newQty > item.maxStock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const updateFrameNumber = (productId: string, frame: string) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, frameNumber: frame } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `DH-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customerName: customerName.trim() || 'Khách lẻ tại quầy',
      customerPhone: customerPhone.trim() || '',
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        category: item.category,
        price: item.price,
        cost: item.cost,
        quantity: item.quantity,
        frameNumber: item.frameNumber
      })),
      totalAmount: subtotal,
      totalCost: totalCost,
      paymentMethod,
      staffName: 'Đức Huy (Chủ Shop)',
      notes: notes.trim()
    };

    onCompleteOrder(newOrder);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  // VietQR generation url (Vietinbank / VCB mock format for clean UI presentation)
  const qrUrl = `https://api.vietqr.io/image/970415-108876543210-compact2.png?amount=${subtotal}&addInfo=DucHuyBike%20Thanh%20Toan&accountName=DUC%20HUY%20STORE`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Product Catalog Column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm xe đạp, phụ tùng, mã SKU hoặc dịch vụ bảo dưỡng..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
          {filteredProducts.map(product => {
            const stockInfo = getStockStatus(product.stock);
            const isOutOfStock = product.stock <= 0 && product.category !== 'Service';

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all select-none ${
                  isOutOfStock
                    ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                    : 'border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{product.sku}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stockInfo.badge}`}>
                      {product.category === 'Service' ? 'Dịch vụ' : `${product.stock} tồn`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2 leading-snug">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{product.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Giá niêm yết</span>
                    <span className="font-bold text-slate-900 text-sm">{formatVND(product.price)}</span>
                  </div>
                  <button
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) addToCart(product);
                    }}
                    className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Thêm vào giỏ"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Column */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[700px] sticky top-20">
          {/* Cart Header */}
          <div className="p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base">Đơn Hàng Hiện Tại</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} món
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 text-xs">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                <ShoppingCart className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                <p className="font-medium text-slate-600">Giỏ hàng đang trống</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Nhấp vào các sản phẩm xe đạp hoặc phụ tùng bên trái để tạo đơn bán hàng.
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-900 leading-snug">{item.name}</h5>
                      <span className="text-[11px] text-slate-400 font-mono">{item.sku}</span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Frame number selection for bikes */}
                  {item.availableFrames && item.availableFrames.length > 0 && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                        Số khung xe xuất bán (Bảo hành):
                      </label>
                      <select
                        value={item.frameNumber || ''}
                        onChange={(e) => updateFrameNumber(item.productId, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-blue-900"
                      >
                        {item.availableFrames.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-900">{formatVND(item.price * item.quantity)}</span>
                    <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-xs text-slate-600 hover:bg-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-xs text-slate-600 hover:bg-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer & Checkout Form */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Payment method */}
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block mb-1">Phương thức thanh toán:</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border font-medium cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>VietQR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border font-medium cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border font-medium cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Quẹt thẻ</span>
                </button>
              </div>
            </div>

            {/* VietQR View Trigger if Transfer */}
            {paymentMethod === 'transfer' && subtotal > 0 && (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full py-1.5 px-3 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-purple-200 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Xem mã QR thanh toán ngân hàng</span>
              </button>
            )}

            {/* Total and Checkout */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Tổng tiền:</span>
                <span className="text-lg font-black text-slate-900 block leading-tight">{formatVND(subtotal)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-700/20 cursor-pointer"
              >
                Thanh Toán & In Phiếu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VietQR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Quét Mã VietQR Thanh Toán</h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block">
              <img
                src={qrUrl}
                alt="VietQR VeloBiz"
                className="w-52 h-52 mx-auto rounded-lg object-contain"
              />
            </div>
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Số tiền: {formatVND(subtotal)}</p>
              <p className="text-slate-400 mt-0.5">Khách hàng mở App ngân hàng quét mã để nhận tiền ngay</p>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Đóng mã QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
