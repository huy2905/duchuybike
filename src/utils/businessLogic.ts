import { Product, Order, ServiceTicket, ProductCategory, AiQueryResult } from '../types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getCategoryLabel(category: ProductCategory): string {
  switch (category) {
    case 'Road': return 'Xe Đua (Road)';
    case 'MTB': return 'Xe Địa Hình (MTB)';
    case 'City': return 'Xe Đường Phố (City)';
    case 'Touring': return 'Xe Phượt (Touring)';
    case 'Kids': return 'Xe Trẻ Em';
    case 'Accessory': return 'Phụ Kiện & Phụ Tùng';
    case 'Service': return 'Dịch Vụ & Bảo Dưỡng';
    default: return category;
  }
}

export function getCategoryBadgeColor(category: ProductCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Road':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'MTB':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'City':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'Touring':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'Kids':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Accessory':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Service':
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

export function getStockStatus(stock: number): { label: string; color: string; badge: string } {
  if (stock <= 0) {
    return {
      label: 'Hết hàng',
      color: 'text-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  }
  if (stock <= 2) {
    return {
      label: 'Sắp hết hàng',
      color: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }
  return {
    label: 'Còn hàng',
    color: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercent: number;
  totalProductsCount: number;
  totalUnitsInStock: number;
  totalStockCostValue: number;
  totalStockRetailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalSoldUnits: number;
  totalOrdersCount: number;
  serviceRevenue: number;
}

export function calculateFinancials(
  products: Product[],
  orders: Order[],
  services: ServiceTicket[]
): FinancialSummary {
  // Orders revenue & cost
  const orderRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const orderCost = orders.reduce((sum, o) => sum + o.totalCost, 0);

  // Completed services revenue
  const serviceRevenue = services
    .filter(s => s.status === 'completed' || s.status === 'delivered')
    .reduce((sum, s) => sum + (s.actualCost ?? s.estimatedCost), 0);

  const totalRevenue = orderRevenue + serviceRevenue;
  const totalCost = orderCost;
  const grossProfit = totalRevenue - totalCost;
  const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Inventory stats
  const totalProductsCount = products.length;
  const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockCostValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
  const totalStockRetailValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 2).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalSoldUnits = products.reduce((sum, p) => sum + p.sold, 0);

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    profitMarginPercent: Number(profitMarginPercent.toFixed(1)),
    totalProductsCount,
    totalUnitsInStock,
    totalStockCostValue,
    totalStockRetailValue,
    lowStockCount,
    outOfStockCount,
    totalSoldUnits,
    totalOrdersCount: orders.length,
    serviceRevenue
  };
}

export function getBestsellers(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.sold - a.sold);
}

export function getLowStockProducts(products: Product[], threshold = 2): Product[] {
  return products.filter(p => p.stock <= threshold).sort((a, b) => a.stock - b.stock);
}

export function processSmartAiQuery(
  query: string,
  products: Product[],
  orders: Order[],
  services: ServiceTicket[]
): AiQueryResult {
  const text = (query || '').toLowerCase().trim();
  const financials = calculateFinancials(products, orders, services);

  // 1. INTENT: Hàng còn tồn kho
  if (text.includes('tồn') || text.includes('còn hàng') || text.includes('trong kho') || text.includes('danh sách tồn')) {
    const inStock = products.filter(p => p.stock > 0).sort((a, b) => b.stock - a.stock);
    const totalUnits = inStock.reduce((sum, p) => sum + p.stock, 0);
    const totalCost = inStock.reduce((sum, p) => sum + (p.stock * p.cost), 0);
    const totalRetail = inStock.reduce((sum, p) => sum + (p.stock * p.price), 0);

    return {
      intent: 'inventory_in_stock',
      title: 'Báo Cáo Danh Sách Hàng Còn Tồn Trong Kho',
      summary: `Hiện tại cửa hàng đang có ${inStock.length} mã sản phẩm còn hàng với tổng cộng ${totalUnits} chiếc/món. Tổng giá trị vốn lưu kho là ${formatVND(totalCost)}, giá trị niêm yết bán lẻ tương đương ${formatVND(totalRetail)}.`,
      recommendations: [
        'Các dòng xe đạp đường phố (City) và Phụ kiện có tỷ lệ quay vòng tốt nhất.',
        'Nên theo dõi dòng xe cao cấp có vốn lưu kho lớn để lên kế hoạch tiếp thị phù hợp.',
        'Có thể xuất file Excel/CSV danh sách này để đối soát kiểm kê kho định kỳ cuối tuần.'
      ],
      tableHeaders: ['Mã SKU', 'Tên sản phẩm', 'Phân loại', 'Tồn kho', 'Giá vốn', 'Giá bán', 'Tổng vốn tồn'],
      tableRows: inStock.map(p => [
        p.sku,
        p.name,
        getCategoryLabel(p.category),
        `${p.stock} chiếc`,
        formatVND(p.cost),
        formatVND(p.price),
        formatVND(p.stock * p.cost)
      ]),
      rawData: inStock
    };
  }

  // 2. INTENT: Bán chạy nhất
  if (text.includes('bán chạy') || text.includes('top bán') || text.includes('chạy nhất') || text.includes('hot')) {
    const bestsellers = getBestsellers(products);
    const topItem = bestsellers[0];
    const topRevenueItem = [...products].sort((a, b) => (b.sold * b.price) - (a.sold * a.price))[0];

    return {
      intent: 'bestsellers',
      title: 'Thống Kê Sản Phẩm Bán Chạy Nhất',
      summary: `Mặt hàng bán chạy nhất về số lượng là "${topItem ? topItem.name : 'N/A'}" với ${topItem ? topItem.sold : 0} lượt bán. Mặt hàng mang lại doanh thu cao nhất là "${topRevenueItem ? topRevenueItem.name : 'N/A'}" với doanh số đạt ${topRevenueItem ? formatVND(topRevenueItem.sold * topRevenueItem.price) : '0đ'}.`,
      recommendations: [
        'Duy trì lượng tồn an toàn tối thiểu 5 chiếc cho top 3 sản phẩm bán chạy nhất.',
        'Tạo combo bán chéo (Cross-sell) xe đạp cùng phụ kiện (Mũ bảo hiểm, Khóa số, Đèn xe) để tăng giá trị trung bình trên mỗi đơn.',
        'Đàm phán với xưởng/nhà phân phối chiết khấu số lượng lớn cho dòng xe bán chạy.'
      ],
      tableHeaders: ['Thứ hạng', 'Tên sản phẩm', 'Mã SKU', 'Phân loại', 'Đã bán', 'Giá bán', 'Doanh thu tạo ra', 'Lợi nhuận gộp'],
      tableRows: bestsellers.map((p, idx) => [
        `#${idx + 1}`,
        p.name,
        p.sku,
        getCategoryLabel(p.category),
        `${p.sold} món`,
        formatVND(p.price),
        formatVND(p.sold * p.price),
        formatVND(p.sold * (p.price - p.cost))
      ]),
      rawData: bestsellers
    };
  }

  // 3. INTENT: Cảnh báo hàng sắp hết / hết hàng
  if (text.includes('sắp hết') || text.includes('hết hàng') || text.includes('cảnh báo') || text.includes('thiếu hàng') || text.includes('nhập thêm')) {
    const lowStock = getLowStockProducts(products, 2);
    const outCount = lowStock.filter(p => p.stock === 0).length;

    return {
      intent: 'low_stock_alert',
      title: 'Cảnh Báo Sản Phẩm Cần Nhập Thêm Khẩn Cấp',
      summary: `Hệ thống ghi nhận ${lowStock.length} sản phẩm đang ở mức báo động (tồn kho ≤ 2 chiếc). Đặc biệt có ${outCount} sản phẩm đã hoàn toàn hết hàng, gây nguy cơ gián đoạn bán hàng khi khách có nhu cầu.`,
      recommendations: [
        'Lập tức liên hệ nhà cung cấp đặt thêm các sản phẩm đã về 0 chiếc.',
        'Với các dòng xe đạp đua hoặc địa hình sắp hết, đề xuất khách hàng đặt cọc trước (Pre-order).',
        'Cập nhật trạng thái hiển thị trên màn hình POS để nhân viên thu ngân thông báo kịp thời cho khách.'
      ],
      tableHeaders: ['Mã SKU', 'Tên sản phẩm', 'Phân loại', 'Tồn kho hiện tại', 'Đã bán', 'Giá vốn', 'Trạng thái'],
      tableRows: lowStock.map(p => [
        p.sku,
        p.name,
        getCategoryLabel(p.category),
        p.stock === 0 ? '0 chiếc (HẾT)' : `${p.stock} chiếc`,
        `${p.sold} món`,
        formatVND(p.cost),
        p.stock === 0 ? 'Đã hết hàng' : 'Sắp hết hàng'
      ]),
      rawData: lowStock
    };
  }

  // 4. INTENT: Doanh thu & Lợi nhuận
  if (text.includes('doanh thu') || text.includes('lợi nhuận') || text.includes('tài chính') || text.includes('lãi') || text.includes('tiền')) {
    return {
      intent: 'financial_overview',
      title: 'Báo Cáo Tổng Quan Tài Chính & Lợi Nhuận',
      summary: `Tổng doanh thu bán hàng và dịch vụ đạt ${formatVND(financials.totalRevenue)}. Tổng giá vốn hàng bán là ${formatVND(financials.totalCost)}. Lợi nhuận gộp cửa hàng thu về là ${formatVND(financials.grossProfit)}, đạt tỷ suất lợi nhuận biên ${financials.profitMarginPercent}%.`,
      recommendations: [
        'Dịch vụ sửa chữa và bảo dưỡng có biên lợi nhuận gộp trên 80%, nên đẩy mạnh gói bảo dưỡng định kỳ trọn gói.',
        'Kiểm soát tỷ lệ chi phí tồn kho xe đạp đắt tiền để tối ưu hóa dòng tiền mặt.',
        'Áp dụng chính sách thanh toán qua chuyển khoản QR để đối soát tiền về tức thì, giảm thất thoát.'
      ],
      tableHeaders: ['Chỉ số tài chính', 'Giá trị', 'Tỷ trọng / Ghi chú'],
      tableRows: [
        ['Tổng doanh thu (Bán hàng + Dịch vụ)', formatVND(financials.totalRevenue), '100% doanh thu'],
        ['Doanh thu bán xe & phụ tùng', formatVND(financials.totalRevenue - financials.serviceRevenue), `${financials.totalRevenue > 0 ? (((financials.totalRevenue - financials.serviceRevenue) / financials.totalRevenue) * 100).toFixed(1) : 0}%`],
        ['Doanh thu dịch vụ bảo dưỡng', formatVND(financials.serviceRevenue), `${financials.totalRevenue > 0 ? ((financials.serviceRevenue / financials.totalRevenue) * 100).toFixed(1) : 0}%`],
        ['Tổng giá vốn hàng bán (COGS)', formatVND(financials.totalCost), 'Chi phí nhập hàng'],
        ['Lợi nhuận gộp ước tính', formatVND(financials.grossProfit), `Tỷ suất biên lãi: ${financials.profitMarginPercent}%`],
        ['Tổng giá trị vốn đang nằm trong kho', formatVND(financials.totalStockCostValue), `${financials.totalUnitsInStock} sản phẩm đang chờ bán`]
      ]
    };
  }

  // 5. INTENT: Tư vấn chiến lược nhập xe tháng tới
  if (text.includes('nhập hàng') || text.includes('tháng tới') || text.includes('chiến lược') || text.includes('kế hoạch')) {
    const bestsellers = getBestsellers(products).slice(0, 4);
    const lowStock = getLowStockProducts(products, 2);

    return {
      intent: 'strategy_procurement',
      title: 'Đề Xuất Chiến Lược Nhập Hàng Cho Cửa Hàng Xe Đạp',
      summary: `Dựa trên dữ liệu doanh số và tốc độ luân chuyển hàng, cửa hàng nên ưu tiên nhập bổ sung 2 nhóm: Nhóm bán chạy đang có nguy cơ đứt hàng và Nhóm phụ tùng thay thế nhanh (xích, lốp, mũ bảo hiểm).`,
      recommendations: [
        `Ưu tiên 1: Đặt gấp ${lowStock.map(p => p.name).slice(0, 2).join(', ')} vì lượng tồn kho đang ở mức báo động.`,
        `Ưu tiên 2: Tăng tồn kho thêm 20-30% cho dòng xe "${bestsellers[0]?.name || 'Road/City'}" đón mùa cao điểm thể thao.`,
        'Nhập dự phòng săm lốp cỡ 700c và dầu dưỡng sên xe để phục vụ lượng khách ghé sửa xe định kỳ.'
      ],
      tableHeaders: ['Sản phẩm đề xuất nhập', 'Phân loại', 'Tồn kho hiện tại', 'Đã bán', 'Số lượng nhập đề xuất', 'Vốn dự kiến'],
      tableRows: [
        ...lowStock.slice(0, 3).map(p => [
          p.name,
          getCategoryLabel(p.category),
          `${p.stock} chiếc`,
          `${p.sold} món`,
          '5 - 10 chiếc',
          formatVND(p.cost * 5)
        ]),
        ...bestsellers.slice(0, 2).map(p => [
          p.name,
          getCategoryLabel(p.category),
          `${p.stock} chiếc`,
          `${p.sold} món`,
          '3 - 5 chiếc',
          formatVND(p.cost * 3)
        ])
      ]
    };
  }

  // 6. DEFAULT / KEYWORD FILTER
  const matched = products.filter(p => {
    return p.name.toLowerCase().includes(text) ||
           p.sku.toLowerCase().includes(text) ||
           p.category.toLowerCase().includes(text) ||
           getCategoryLabel(p.category).toLowerCase().includes(text) ||
           (p.description && p.description.toLowerCase().includes(text));
  });

  return {
    intent: 'keyword_search',
    title: `Kết Quả Tra Cứu Thông Minh Cho: "${query}"`,
    summary: matched.length > 0 
      ? `Hệ thống tìm thấy ${matched.length} sản phẩm phù hợp với từ khóa "${query}". Dưới đây là bảng dữ liệu chi tiết về thông số, giá bán và lượng tồn kho.`
      : `Không tìm thấy sản phẩm nào khớp chính xác với từ khóa "${query}". Bạn có thể thử các câu hỏi mẫu như: "Hàng còn tồn", "Bán chạy nhất", "Cảnh báo sắp hết", hoặc "Báo cáo doanh thu".`,
    recommendations: matched.length > 0
      ? [
          'Bạn có thể xuất danh sách này thành file CSV để làm việc nội bộ.',
          'Kiểm tra lại giá bán cạnh tranh trên thị trường đối với các dòng xe này.',
          'Nhấp vào từng sản phẩm trong mục "Quản lý kho" để xem chi tiết số khung và thời hạn bảo hành.'
        ]
      : [
          'Thử tìm theo phân loại xe: "Road", "MTB", "City", "Trẻ em", "Phụ kiện".',
          'Hoặc nhấn các nút gợi ý tra cứu nhanh ở trên để có kết quả ngay tức thì.'
        ],
    tableHeaders: ['Mã SKU', 'Tên sản phẩm', 'Phân loại', 'Giá vốn', 'Giá bán', 'Tồn kho', 'Đã bán'],
    tableRows: matched.map(p => [
      p.sku,
      p.name,
      getCategoryLabel(p.category),
      formatVND(p.cost),
      formatVND(p.price),
      `${p.stock} chiếc`,
      `${p.sold} món`
    ]),
    rawData: matched
  };
}

export function exportToCSV(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  // UTF-8 BOM for Excel Vietnamese characters display
  let csvContent = '\uFEFF';
  csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
