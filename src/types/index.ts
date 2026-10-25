export type ProductCategory = 
  | 'Road' 
  | 'MTB' 
  | 'City' 
  | 'Touring' 
  | 'Kids' 
  | 'Accessory' 
  | 'Service';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  cost: number;
  price: number;
  stock: number;
  sold: number;
  frameNumbers?: string[]; // Danh sách số khung xe đạp
  warrantyMonths: number;  // Thời gian bảo hành (tháng)
  description?: string;
  brand?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  cost: number;
  quantity: number;
  frameNumber?: string;
}

export interface Order {
  id: string;
  time: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  paymentMethod: 'cash' | 'transfer' | 'card';
  notes?: string;
  staffName: string;
}

export type ServiceStatus = 'received' | 'in_progress' | 'completed' | 'delivered';
export type ServiceType = 'repair' | 'maintenance' | 'both';

export interface ServiceTicket {
  id: string;
  serviceType: ServiceType; // Sửa chữa / Bảo dưỡng / Cả hai
  customerName: string;
  customerPhone: string;
  customerAddress: string;  // Địa chỉ khách hàng
  bikeModel: string;
  frameNumber?: string;
  bikeParts: string[];      // Các bộ phận cần sửa / bảo dưỡng
  issueDescription: string;
  laborCost?: number;       // Tiền công thợ
  partsCost?: number;       // Tiền linh kiện thay thế
  estimatedCost: number;    // Tổng chi phí ước tính
  actualCost?: number;      // Chi phí thực tế thanh toán
  status: ServiceStatus;
  createdAt: string;
  completedAt?: string;
  mechanicNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  orderCount: number;
  lastPurchaseDate?: string;
}

export interface AiQueryResult {
  intent: string;
  title: string;
  summary: string;
  recommendations: string[];
  tableHeaders: string[];
  tableRows: Array<Array<string | number>>;
  rawData?: any[];
}
