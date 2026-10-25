import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  ShoppingCart, 
  Bike, 
  Wrench, 
  Receipt, 
  Users,
  Laptop
} from 'lucide-react';
import { Product, Order, ServiceTicket, Customer, AiQueryResult } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SERVICES, INITIAL_CUSTOMERS } from './data/initialData';
import { calculateFinancials, processSmartAiQuery } from './utils/businessLogic';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AiAssistantView } from './components/AiAssistantView';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { ServiceWorkshopView } from './components/ServiceWorkshopView';
import { OrdersView } from './components/OrdersView';
import { CustomerWarrantyView } from './components/CustomerWarrantyView';
import { RunOnOtherMachineModal } from './components/RunOnOtherMachineModal';
import { InvoiceModal } from './components/InvoiceModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('velobiz_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('velobiz_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [services, setServices] = useState<ServiceTicket[]>(() => {
    const saved = localStorage.getItem('velobiz_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('velobiz_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // AI Query result state
  const [currentAiResult, setCurrentAiResult] = useState<AiQueryResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Modals
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('velobiz_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('velobiz_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('velobiz_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('velobiz_customers', JSON.stringify(customers));
  }, [customers]);

  // Handle URL query parameters (e.g. ?autostart=1 or ?tab=ai)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dashboard', 'ai', 'pos', 'inventory', 'service', 'orders', 'customers'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const financials = calculateFinancials(products, orders, services);

  // --- POS Order Completion ---
  const handleCompleteOrder = (order: Order) => {
    // 1. Deduct stock and increment sold for physical items
    setProducts(prev =>
      prev.map(p => {
        const orderItem = order.items.find(i => i.productId === p.id);
        if (!orderItem) return p;

        const newStock = Math.max(0, p.stock - orderItem.quantity);
        const newSold = p.sold + orderItem.quantity;

        // If specific frame was sold, remove it from available frames
        let updatedFrames = p.frameNumbers;
        if (orderItem.frameNumber && p.frameNumbers) {
          updatedFrames = p.frameNumbers.filter(f => f !== orderItem.frameNumber);
        }

        return {
          ...p,
          stock: p.category === 'Service' ? p.stock : newStock,
          sold: newSold,
          frameNumbers: updatedFrames
        };
      })
    );

    // 2. Add to orders list
    setOrders(prev => [order, ...prev]);

    // 3. Update customer loyalty spend
    if (order.customerPhone) {
      setCustomers(prev => {
        const existing = prev.find(c => c.phone === order.customerPhone);
        if (existing) {
          return prev.map(c =>
            c.phone === order.customerPhone
              ? {
                  ...c,
                  name: order.customerName || c.name,
                  totalSpent: c.totalSpent + order.totalAmount,
                  orderCount: c.orderCount + 1,
                  lastPurchaseDate: new Date().toISOString().slice(0, 10)
                }
              : c
          );
        } else {
          return [
            {
              id: `c_${Date.now()}`,
              name: order.customerName || 'Khách lẻ',
              phone: order.customerPhone,
              totalSpent: order.totalAmount,
              orderCount: 1,
              lastPurchaseDate: new Date().toISOString().slice(0, 10)
            },
            ...prev
          ];
        }
      });
    }

    // 4. Show invoice
    setActiveInvoiceOrder(order);
  };

  // --- Order Cancellation (Refund & Restock) ---
  const handleCancelOrder = (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) return;

    // Restore stock
    setProducts(prev =>
      prev.map(p => {
        const item = orderToCancel.items.find(i => i.productId === p.id);
        if (!item || p.category === 'Service') return p;

        let restoredFrames = p.frameNumbers || [];
        if (item.frameNumber && !restoredFrames.includes(item.frameNumber)) {
          restoredFrames = [...restoredFrames, item.frameNumber];
        }

        return {
          ...p,
          stock: p.stock + item.quantity,
          sold: Math.max(0, p.sold - item.quantity),
          frameNumbers: restoredFrames.length > 0 ? restoredFrames : undefined
        };
      })
    );

    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // --- Product Management ---
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleRestock = (id: string, additionalQty: number, newFrames?: string[]) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const currentFrames = p.frameNumbers || [];
        const combinedFrames = newFrames ? [...currentFrames, ...newFrames] : currentFrames;
        return {
          ...p,
          stock: p.stock + additionalQty,
          frameNumbers: combinedFrames.length > 0 ? combinedFrames : undefined
        };
      })
    );
  };

  // --- Service Workshop ---
  const handleAddService = (ticket: ServiceTicket) => {
    setServices(prev => [ticket, ...prev]);
  };

  const handleUpdateServiceStatus = (id: string, status: any, actualCost?: number) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          status,
          actualCost: actualCost ?? s.actualCost,
          completedAt: status === 'completed' || status === 'delivered' ? new Date().toISOString().slice(0, 16) : s.completedAt
        };
      })
    );
  };

  // --- AI Prompt Shortcut ---
  const handleRunAiPrompt = (prompt: string) => {
    setActiveTab('ai');
    setIsAiLoading(true);

    fetch('/api/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: prompt, products, orders, services })
    })
      .then(res => res.json())
      .then(data => {
        setCurrentAiResult(data);
      })
      .catch(() => {
        const local = processSmartAiQuery(prompt, products, orders, services);
        setCurrentAiResult(local);
      })
      .finally(() => {
        setIsAiLoading(false);
      });
  };

  // --- Reset Demo Data ---
  const handleResetDemo = () => {
    if (confirm('Bạn có chắc muốn khôi phục về dữ liệu mẫu ban đầu? (Toàn bộ dữ liệu bạn tự nhập sẽ được làm mới)')) {
      localStorage.removeItem('velobiz_products');
      localStorage.removeItem('velobiz_orders');
      localStorage.removeItem('velobiz_services');
      localStorage.removeItem('velobiz_customers');
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setServices(INITIAL_SERVICES);
      setCustomers(INITIAL_CUSTOMERS);
      setCurrentAiResult(null);
    }
  };

  // --- Export Database Backup JSON ---
  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'DucHuyBike',
      products,
      orders,
      services,
      customers
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DucHuyBike_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Import Database Backup JSON ---
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          if (data.orders) setOrders(data.orders);
          if (data.services) setServices(data.services);
          if (data.customers) setCustomers(data.customers);
          alert('Khôi phục dữ liệu thành công!');
        } else {
          alert('Tệp JSON không đúng định dạng sao lưu của Đức Huy Bike.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file sao lưu. Vui lòng kiểm tra lại định dạng JSON.');
      }
    };
    reader.readAsText(file);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan & Báo Cáo', icon: LayoutDashboard },
    { id: 'ai', label: 'Trợ Lý AI Tra Cứu', icon: Sparkles, badge: 'Flash AI' },
    { id: 'pos', label: 'Bán Hàng (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Kho Xe & Phụ Tùng', icon: Bike },
    { id: 'service', label: 'Sửa Chữa / Bảo Dưỡng', icon: Wrench, count: services.filter(s => s.status === 'received' || s.status === 'in_progress').length },
    { id: 'orders', label: 'Lịch Sử Đơn Hàng', icon: Receipt },
    { id: 'customers', label: 'Khách Hàng & Bảo Hành', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        financials={financials}
        onResetDemo={handleResetDemo}
        onOpenRunModal={() => setIsRunModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            financials={financials}
            products={products}
            orders={orders}
            services={services}
            onNavigate={(tab) => setActiveTab(tab)}
            onRunAiPrompt={handleRunAiPrompt}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantView
            products={products}
            orders={orders}
            services={services}
            currentResult={currentAiResult}
            onSetResult={setCurrentAiResult}
            isLoading={isAiLoading}
            setIsLoading={setIsAiLoading}
          />
        )}

        {activeTab === 'pos' && (
          <PosView
            products={products}
            onCompleteOrder={handleCompleteOrder}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRestock={handleRestock}
          />
        )}

        {activeTab === 'service' && (
          <ServiceWorkshopView
            services={services}
            onAddService={handleAddService}
            onUpdateStatus={handleUpdateServiceStatus}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onViewOrder={(order) => setActiveInvoiceOrder(order)}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerWarrantyView
            customers={customers}
            orders={orders}
            services={services}
            products={products}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Xe Đạp Thể Thao Đức Huy © 2026 - 33 Trần Đăng Ninh, TP. Ninh Bình (Hotline: 0962.616.402)</span>
          <button
            onClick={() => setIsRunModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Hướng dẫn sao chép & chạy trên máy tính khác</span>
          </button>
        </div>
      </footer>

      {/* Offline Connectivity Toast */}
      <OfflineIndicator />

      {/* Modals */}
      <RunOnOtherMachineModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      <InvoiceModal
        order={activeInvoiceOrder}
        onClose={() => setActiveInvoiceOrder(null)}
      />
    </div>
  );
}
