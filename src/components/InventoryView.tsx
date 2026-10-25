import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  PackagePlus, 
  Check, 
  X,
  AlertTriangle,
  Bike
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { formatVND, getCategoryLabel, getStockStatus, exportToCSV } from '../utils/businessLogic';

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRestock: (id: string, additionalQty: number, newFrameNumbers?: string[]) => void;
}

export const InventoryView: React.FC<Props> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(5);
  const [restockFramesInput, setRestockFramesInput] = useState('');

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Road' as ProductCategory,
    brand: '',
    cost: '',
    price: '',
    stock: '',
    frameNumbers: '',
    warrantyMonths: '24',
    description: ''
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStock = 
      selectedStockFilter === 'all' ? true :
      selectedStockFilter === 'in_stock' ? p.stock > 2 :
      selectedStockFilter === 'low_stock' ? (p.stock > 0 && p.stock <= 2) :
      p.stock <= 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      sku: `XD-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Road',
      brand: '',
      cost: '',
      price: '',
      stock: '5',
      frameNumbers: '',
      warrantyMonths: '24',
      description: ''
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      brand: product.brand || '',
      cost: String(product.cost),
      price: String(product.price),
      stock: String(product.stock),
      frameNumbers: (product.frameNumbers || []).join(', '),
      warrantyMonths: String(product.warrantyMonths),
      description: product.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price) return;

    const frames = formData.frameNumbers
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const productObj: Product = {
      id: editingProduct ? editingProduct.id : `p_${Date.now()}`,
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,
      brand: formData.brand.trim() || undefined,
      cost: Number(formData.cost) || 0,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      sold: editingProduct ? editingProduct.sold : 0,
      frameNumbers: frames.length > 0 ? frames : undefined,
      warrantyMonths: Number(formData.warrantyMonths) || 12,
      description: formData.description.trim() || undefined
    };

    if (editingProduct) {
      onUpdateProduct(productObj);
    } else {
      onAddProduct(productObj);
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmRestock = () => {
    if (!restockingProduct || restockQty <= 0) return;
    const newFrames = restockFramesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onRestock(restockingProduct.id, Number(restockQty), newFrames.length > 0 ? newFrames : undefined);
    setRestockingProduct(null);
    setRestockQty(5);
    setRestockFramesInput('');
  };

  const handleExportCsv = () => {
    const headers = ['Mã SKU', 'Tên sản phẩm', 'Hãng', 'Phân loại', 'Giá vốn', 'Giá bán', 'Tồn kho', 'Đã bán', 'Thời gian bảo hành (tháng)', 'Số khung'];
    const rows = filteredProducts.map(p => [
      p.sku,
      p.name,
      p.brand || 'N/A',
      getCategoryLabel(p.category),
      p.cost,
      p.price,
      p.stock,
      p.sold,
      p.warrantyMonths,
      (p.frameNumbers || []).join('; ')
    ]);
    exportToCSV(`DucHuyBike_TonKho_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên xe đạp, mã SKU, hãng sản xuất..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Xuất file CSV kiểm kê kho"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 font-semibold mr-1">Danh mục:</span>
            {['all', 'Road', 'MTB', 'City', 'Kids', 'Accessory', 'Service'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Tất cả' : getCategoryLabel(cat as any)}
              </button>
            ))}
          </div>

          {/* Stock status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Tồn kho:</span>
            <button
              onClick={() => setSelectedStockFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                selectedStockFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Tất cả ({products.length})
            </button>
            <button
              onClick={() => setSelectedStockFilter('low_stock')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                selectedStockFilter === 'low_stock' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800'
              }`}
            >
              Sắp hết (≤ 2)
            </button>
            <button
              onClick={() => setSelectedStockFilter('out_of_stock')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                selectedStockFilter === 'out_of_stock' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-50 text-rose-800'
              }`}
            >
              Hết hàng (0)
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Mã SKU</th>
                <th className="px-4 py-3">Tên sản phẩm & Hãng</th>
                <th className="px-4 py-3">Phân loại</th>
                <th className="px-4 py-3">Giá vốn</th>
                <th className="px-4 py-3">Giá bán</th>
                <th className="px-4 py-3">Lợi nhuận/món</th>
                <th className="px-4 py-3 text-center">Tồn kho</th>
                <th className="px-4 py-3 text-center">Đã bán</th>
                <th className="px-4 py-3">Số khung có sẵn</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    Không tìm thấy sản phẩm nào khớp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const status = getStockStatus(p.stock);
                  const marginPerUnit = p.price - p.cost;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-500">
                        {p.sku}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        {p.brand && <span className="text-[10px] text-slate-400 font-medium">Hãng: {p.brand}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                          {getCategoryLabel(p.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatVND(p.cost)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatVND(p.price)}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        +{formatVND(marginPerUnit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${status.badge}`}>
                          {p.category === 'Service' ? 'Không giới hạn' : `${p.stock} chiếc`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-purple-700">
                        {p.sold}
                      </td>
                      <td className="px-4 py-3">
                        {p.frameNumbers && p.frameNumbers.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.frameNumbers.map(f => (
                              <span key={f} className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Không có số khung</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.category !== 'Service' && (
                            <button
                              onClick={() => {
                                setRestockingProduct(p);
                                setRestockQty(5);
                                setRestockFramesInput('');
                              }}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Nhập thêm hàng vào kho"
                            >
                              <PackagePlus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Sửa thông tin sản phẩm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa sản phẩm "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
          <span>Tổng số {filteredProducts.length} sản phẩm hiển thị</span>
          <span>Hệ thống tự động theo dõi bảo hành theo số khung xe</span>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-base">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên xe / phụ kiện / dịch vụ *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Trek Émonda SL 6 Disc 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mã SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hãng sản xuất</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Trek, Giant, Shimano..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phân loại danh mục</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Road">Xe Đua (Road)</option>
                    <option value="MTB">Xe Địa Hình (MTB)</option>
                    <option value="City">Xe Phố (City)</option>
                    <option value="Touring">Xe Phượt (Touring)</option>
                    <option value="Kids">Xe Trẻ Em</option>
                    <option value="Accessory">Phụ Kiện & Phụ Tùng</option>
                    <option value="Service">Dịch Vụ & Bảo Dưỡng</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời hạn bảo hành (tháng)</label>
                  <input
                    type="number"
                    value={formData.warrantyMonths}
                    onChange={e => setFormData({ ...formData, warrantyMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá vốn (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="42000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="54900000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Danh sách số khung (Frame Numbers) - Cách nhau bằng dấu phẩy
                </label>
                <input
                  type="text"
                  value={formData.frameNumbers}
                  onChange={e => setFormData({ ...formData, frameNumbers: e.target.value })}
                  placeholder="TRK-001, TRK-002, TRK-003"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Đối với xe đạp thể thao, mỗi chiếc có 1 số khung dập chìm dưới gầm trục giữa.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Groupset, chất liệu khung sườn, kích cỡ bánh..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Cập Nhật' : 'Lưu Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Nhập Thêm Hàng Vào Kho</h4>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{restockingProduct.name}</p>
              <p className="text-slate-500 font-mono mt-0.5">SKU: {restockingProduct.sku}</p>
              <p className="text-blue-700 font-semibold mt-1">Hiện có: {restockingProduct.stock} chiếc</p>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số lượng nhập thêm:</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={e => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số khung xe mới (cách nhau bằng dấu phẩy):
                </label>
                <input
                  type="text"
                  value={restockFramesInput}
                  onChange={e => setRestockFramesInput(e.target.value)}
                  placeholder="GNT-881, GNT-882"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRestockingProduct(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRestock}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Xác Nhận Nhập Kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
