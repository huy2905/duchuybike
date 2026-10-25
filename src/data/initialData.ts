import { Product, Order, ServiceTicket, Customer } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Trek Émonda SL 5 Disc (Shimano 105)',
    sku: 'XD-ROAD-01',
    category: 'Road',
    brand: 'Trek',
    cost: 42000000,
    price: 54900000,
    stock: 2,
    sold: 6,
    frameNumbers: ['TRK-EM5-9921', 'TRK-EM5-9922'],
    warrantyMonths: 36,
    description: 'Khung Carbon OCLV 500 series siêu nhẹ, groupset Shimano 105 R7020 phanh đĩa dầu cao cấp.'
  },
  {
    id: 'p2',
    name: 'Giant ATX 830 Phanh Đĩa Dầu Thủy Lực',
    sku: 'XD-MTB-01',
    brand: 'Giant',
    category: 'MTB',
    cost: 7200000,
    price: 9800000,
    stock: 8,
    sold: 18,
    frameNumbers: ['GNT-ATX-301', 'GNT-ATX-302', 'GNT-ATX-303'],
    warrantyMonths: 24,
    description: 'Dòng xe địa hình bán chạy nhất của Giant, khung nhôm Aluxx siêu bền, phuộc nhún dầu có khóa hành trình.'
  },
  {
    id: 'p3',
    name: 'Trinx Free 2.0 Bánh 700c Touring Đi Phố',
    sku: 'XD-CITY-01',
    brand: 'Trinx',
    category: 'City',
    cost: 4100000,
    price: 5800000,
    stock: 1,
    sold: 26,
    frameNumbers: ['TRX-FR2-881'],
    warrantyMonths: 12,
    description: 'Mẫu xe thành phố gọn nhẹ, bộ truyền động Shimano 24 tốc độ, bánh 700x28c lướt nhanh.'
  },
  {
    id: 'p4',
    name: 'Twitter Sniper Pro Carbon Khung Cực Nhẹ',
    sku: 'XD-ROAD-02',
    brand: 'Twitter',
    category: 'Road',
    cost: 14500000,
    price: 18900000,
    stock: 4,
    sold: 11,
    frameNumbers: ['TWT-SN2-01', 'TWT-SN2-02'],
    warrantyMonths: 24,
    description: 'Khung và càng Carbon Nano T800, dây đi âm sườn toàn bộ, tay lắc Retrospec 2x11 tốc độ.'
  },
  {
    id: 'p5',
    name: 'Asama CLB 2602 Đi Phố Cổ Điển Kèm Giỏ',
    sku: 'XD-CITY-02',
    brand: 'Asama',
    category: 'City',
    cost: 2600000,
    price: 3500000,
    stock: 6,
    sold: 21,
    frameNumbers: ['ASM-260-11', 'ASM-260-12'],
    warrantyMonths: 12,
    description: 'Dòng xe mini phố cổ điển phù hợp đi làm, đi chợ, khung thép chịu tải cao, dáng ngồi thoải mái.'
  },
  {
    id: 'p6',
    name: 'RoyalBaby Space Shuttle 16 inch Hợp Kim Magie',
    sku: 'XD-KID-01',
    brand: 'RoyalBaby',
    category: 'Kids',
    cost: 2200000,
    price: 3200000,
    stock: 5,
    sold: 14,
    frameNumbers: ['RBS-16-091', 'RBS-16-092'],
    warrantyMonths: 12,
    description: 'Khung đúc nguyên khối hợp kim Magie không mối hàn, phanh đĩa kép an toàn cho bé từ 4-7 tuổi.'
  },
  {
    id: 'p7',
    name: 'Mũ Bảo Hiểm Cairbull Aero Siêu Nhẹ Có Đèn LED',
    sku: 'PK-HELMET-01',
    brand: 'Cairbull',
    category: 'Accessory',
    cost: 350000,
    price: 650000,
    stock: 16,
    sold: 52,
    warrantyMonths: 6,
    description: 'Thiết kế khí động học, bọt EPS chống xung động cao cấp, tích hợp đèn LED cảnh báo ban đêm.'
  },
  {
    id: 'p8',
    name: 'Khóa Số Dây Thép Tonyon 5 Số Chống Cắt',
    sku: 'PK-LOCK-01',
    brand: 'Tonyon',
    category: 'Accessory',
    cost: 80000,
    price: 170000,
    stock: 25,
    sold: 68,
    warrantyMonths: 6,
    description: 'Lõi cáp thép dày 12mm bọc silicon chống trầy xước khung xe, mật mã 5 số tùy chỉnh an toàn.'
  },
  {
    id: 'p9',
    name: 'Đèn Pha Trước Siêu Sáng Gaciron 800 Lumens',
    sku: 'PK-LIGHT-01',
    brand: 'Gaciron',
    category: 'Accessory',
    cost: 310000,
    price: 540000,
    stock: 0,
    sold: 37,
    warrantyMonths: 12,
    description: 'Chống nước IPX6, pin sạc USB Type-C 2500mAh, góc chiếu rộng an toàn khi đạp xe ban đêm.'
  },
  {
    id: 'p10',
    name: 'Xích Xe Đạp Shimano Deore HG54 10 Tốc Độ',
    sku: 'PT-CHAIN-01',
    brand: 'Shimano',
    category: 'Accessory',
    cost: 270000,
    price: 420000,
    stock: 12,
    sold: 29,
    warrantyMonths: 3,
    description: 'Hàng chính hãng Shimano Japan, công nghệ HG-X chuyển số mượt mà, độ bền xích cao.'
  },
  {
    id: 'p11',
    name: 'Lốp Xe Đạp Maxxis Pace 27.5x1.95 Chống Đinh',
    sku: 'PT-TIRE-01',
    brand: 'Maxxis',
    category: 'Accessory',
    cost: 290000,
    price: 480000,
    stock: 10,
    sold: 43,
    warrantyMonths: 3,
    description: 'Gai lốp thiết kế viền lăn nhẹ, bám đường tốt, hợp chất cao su Silkworm chống dăm đinh.'
  },
  {
    id: 'p12',
    name: 'Gói Bảo Dưỡng Toàn Diện VeloBiz Pro (Spa Xe Đạp)',
    sku: 'DV-MAINT-PRO',
    brand: 'VeloBiz',
    category: 'Service',
    cost: 50000,
    price: 350000,
    stock: 999,
    sold: 48,
    warrantyMonths: 1,
    description: 'Vệ sinh chi tiết líp xích, cân vành rút căm, tra mỡ trục giữa & cổ phốt, căn chỉnh phanh số chuẩn xác.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'DH-1001',
    time: '2026-10-23 09:30',
    customerName: 'Nguyễn Văn Hùng',
    customerPhone: '0912345678',
    items: [
      {
        productId: 'p2',
        name: 'Giant ATX 830 Phanh Đĩa Dầu Thủy Lực',
        sku: 'XD-MTB-01',
        category: 'MTB',
        cost: 7200000,
        price: 9800000,
        quantity: 1,
        frameNumber: 'GNT-ATX-301'
      },
      {
        productId: 'p7',
        name: 'Mũ Bảo Hiểm Cairbull Aero Siêu Nhẹ Có Đèn LED',
        sku: 'PK-HELMET-01',
        category: 'Accessory',
        cost: 350000,
        price: 650000,
        quantity: 1
      }
    ],
    totalAmount: 10450000,
    totalCost: 7550000,
    paymentMethod: 'transfer',
    staffName: 'Quốc Huy',
    notes: 'Khách thanh toán chuyển khoản VietQR, hẹn 1 tháng tới quay lại bảo dưỡng miễn phí lần đầu.'
  },
  {
    id: 'DH-1002',
    time: '2026-10-22 16:15',
    customerName: 'Trần Thị Mai',
    customerPhone: '0988765432',
    items: [
      {
        productId: 'p6',
        name: 'RoyalBaby Space Shuttle 16 inch Hợp Kim Magie',
        sku: 'XD-KID-01',
        category: 'Kids',
        cost: 2200000,
        price: 3200000,
        quantity: 1,
        frameNumber: 'RBS-16-091'
      },
      {
        productId: 'p8',
        name: 'Khóa Số Dây Thép Tonyon 5 Số Chống Cắt',
        sku: 'PK-LOCK-01',
        category: 'Accessory',
        cost: 80000,
        price: 170000,
        quantity: 1
      }
    ],
    totalAmount: 3370000,
    totalCost: 2280000,
    paymentMethod: 'cash',
    staffName: 'Quốc Huy',
    notes: 'Tặng kèm chuông xe đạp trẻ em.'
  },
  {
    id: 'DH-1003',
    time: '2026-10-21 11:20',
    customerName: 'Lê Hoàng Long',
    customerPhone: '0903334455',
    items: [
      {
        productId: 'p1',
        name: 'Trek Émonda SL 5 Disc (Shimano 105)',
        sku: 'XD-ROAD-01',
        category: 'Road',
        cost: 42000000,
        price: 54900000,
        quantity: 1,
        frameNumber: 'TRK-EM5-9920'
      }
    ],
    totalAmount: 54900000,
    totalCost: 42000000,
    paymentMethod: 'transfer',
    staffName: 'Quốc Huy',
    notes: 'Khách hàng VIP chơi xe đua đường trường, hỗ trợ căn chỉnh bike fitting tại chỗ.'
  }
];

export const INITIAL_SERVICES: ServiceTicket[] = [
  {
    id: 'SC-2001',
    serviceType: 'repair',
    customerName: 'Hoàng Minh Tuấn',
    customerPhone: '0938112233',
    customerAddress: 'Số 45 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    bikeModel: 'Giant Escape City 2024',
    bikeParts: ['Bộ đề / Líp xích', 'Phanh đĩa / Thắng'],
    issueDescription: 'Bộ đề sau bị nhảy líp lách cách khi leo dốc, phanh đĩa trước kêu két két khi bóp phanh.',
    laborCost: 100000,
    partsCost: 80000,
    estimatedCost: 180000,
    actualCost: 180000,
    status: 'completed',
    createdAt: '2026-10-23 08:30',
    completedAt: '2026-10-23 11:00',
    mechanicNotes: 'Đã căn chỉnh ốc L/H củ đề sau, vệ sinh đĩa phanh và mài nhẹ má phanh gốm.'
  },
  {
    id: 'SC-2002',
    serviceType: 'both',
    customerName: 'Đặng Quốc Bảo',
    customerPhone: '0977445566',
    customerAddress: 'Tòa R2 Royal City, 72A Nguyễn Trãi, Hà Nội',
    bikeModel: 'Trek Marlin 7',
    bikeParts: ['Bảo dưỡng toàn bộ xe', 'Bộ đề / Líp xích', 'Phuộc nhún / Thụt'],
    issueDescription: 'Bảo dưỡng toàn bộ xe sau chuyến đi phượt Tây Bắc, thay xích mới và vệ sinh thụt trước Rockshox.',
    laborCost: 250000,
    partsCost: 400000,
    estimatedCost: 650000,
    status: 'in_progress',
    createdAt: '2026-10-23 10:15',
    mechanicNotes: 'Đang ngâm tẩy dầu xích líp cũ, chuẩn bị thay xích Shimano HG54 mới.'
  },
  {
    id: 'SC-2003',
    serviceType: 'repair',
    customerName: 'Phạm Thu Trang',
    customerPhone: '0919223344',
    customerAddress: 'Ngõ 116 Nhân Hòa, Nhân Chính, Thanh Xuân',
    bikeModel: 'Trinx Free 1.0',
    bikeParts: ['Bánh / Vành / Lốp săm'],
    issueDescription: 'Thủng săm sau và vành xe bị đảo nhẹ va vào má phanh.',
    laborCost: 50000,
    partsCost: 70000,
    estimatedCost: 120000,
    status: 'received',
    createdAt: '2026-10-23 11:45',
    mechanicNotes: 'Đã nhận xe tại quầy, hẹn trả xe vào lúc 16:30 chiều nay.'
  },
  {
    id: 'SC-2004',
    serviceType: 'maintenance',
    customerName: 'Vũ Đức Thắng',
    customerPhone: '0983123456',
    customerAddress: 'Khu Đô Thị Linh Đàm, Hoàng Mai, Hà Nội',
    bikeModel: 'Twitter Sniper Pro Carbon',
    bikeParts: ['Bảo dưỡng toàn bộ xe', 'Cổ phốt / Trục giữa'],
    issueDescription: 'Bảo dưỡng định kỳ 6 tháng: Tra mỡ vòng bi gốm, siết lực ốc pô tăng theo thông số Nm.',
    laborCost: 350000,
    partsCost: 0,
    estimatedCost: 350000,
    status: 'received',
    createdAt: '2026-10-24 09:15',
    mechanicNotes: 'Khách hàng dặn kỹ kiểm tra lực siết khóa cọc yên carbon.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Lê Hoàng Long',
    phone: '0903334455',
    email: 'long.le@gmail.com',
    address: 'Hà Nội',
    totalSpent: 54900000,
    orderCount: 1,
    lastPurchaseDate: '2026-10-21'
  },
  {
    id: 'c2',
    name: 'Nguyễn Văn Hùng',
    phone: '0912345678',
    email: 'hung.nguyen@gmail.com',
    address: 'Đống Đa, Hà Nội',
    totalSpent: 10450000,
    orderCount: 1,
    lastPurchaseDate: '2026-10-23'
  },
  {
    id: 'c3',
    name: 'Trần Thị Mai',
    phone: '0988765432',
    email: 'mai.tran@yahoo.com',
    address: 'Cầu Giấy, Hà Nội',
    totalSpent: 3370000,
    orderCount: 1,
    lastPurchaseDate: '2026-10-22'
  }
];
