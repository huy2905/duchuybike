import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFinancials,
  getBestsellers,
  getLowStockProducts,
  processSmartAiQuery,
  formatVND,
  getStockStatus
} from './businessLogic.js';
import { Product, Order, ServiceTicket } from '../types/index.js';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Trek Emonda SL 5',
    sku: 'XD-ROAD-01',
    category: 'Road',
    cost: 40000000,
    price: 50000000,
    stock: 2,
    sold: 10,
    warrantyMonths: 36
  },
  {
    id: 'p2',
    name: 'Giant ATX 830',
    sku: 'XD-MTB-01',
    category: 'MTB',
    cost: 7000000,
    price: 10000000,
    stock: 0,
    sold: 25,
    warrantyMonths: 24
  },
  {
    id: 'p3',
    name: 'Mu bao hiem Cairbull',
    sku: 'PK-HELMET-01',
    category: 'Accessory',
    cost: 300000,
    price: 600000,
    stock: 15,
    sold: 50,
    warrantyMonths: 12
  }
];

const mockOrders: Order[] = [
  {
    id: 'DH-1001',
    time: '2026-10-23 10:00',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    items: [
      {
        productId: 'p1',
        name: 'Trek Emonda SL 5',
        sku: 'XD-ROAD-01',
        category: 'Road',
        price: 50000000,
        cost: 40000000,
        quantity: 1
      }
    ],
    totalAmount: 50000000,
    totalCost: 40000000,
    paymentMethod: 'transfer',
    staffName: 'Huy'
  }
];

const mockServices: ServiceTicket[] = [
  {
    id: 'DV-101',
    serviceType: 'maintenance',
    customerName: 'Tran Van B',
    customerPhone: '0987654321',
    customerAddress: '128 Nguyen Trai, Ha Noi',
    bikeModel: 'Giant Escape 2',
    bikeParts: ['Bộ đề / Líp xích', 'Bảo dưỡng toàn bộ xe'],
    issueDescription: 'Can chinh bo de va bao duong xich',
    estimatedCost: 200000,
    actualCost: 200000,
    status: 'completed',
    createdAt: '2026-10-23 08:30'
  }
];

test('calculateFinancials computes correct revenue, profit, and inventory values', () => {
  const fin = calculateFinancials(mockProducts, mockOrders, mockServices);
  
  // Total revenue = 50,000,000 (order) + 200,000 (service) = 50,200,000
  assert.equal(fin.totalRevenue, 50200000);
  assert.equal(fin.totalCost, 40000000);
  assert.equal(fin.grossProfit, 10200000);
  assert.equal(fin.serviceRevenue, 200000);
  assert.equal(fin.totalUnitsInStock, 17); // 2 + 0 + 15
  assert.equal(fin.outOfStockCount, 1);    // p2 has 0
  assert.equal(fin.lowStockCount, 1);      // p1 has 2
});

test('getBestsellers sorts products by sold count descending', () => {
  const bestsellers = getBestsellers(mockProducts);
  assert.equal(bestsellers[0].id, 'p3'); // 50 sold
  assert.equal(bestsellers[1].id, 'p2'); // 25 sold
  assert.equal(bestsellers[2].id, 'p1'); // 10 sold
});

test('getLowStockProducts returns items with stock <= threshold', () => {
  const low = getLowStockProducts(mockProducts, 2);
  assert.equal(low.length, 2);
  assert.equal(low[0].stock, 0); // sorted asc
  assert.equal(low[1].stock, 2);
});

test('getStockStatus returns correct badge classification', () => {
  assert.equal(getStockStatus(0).label, 'Hết hàng');
  assert.equal(getStockStatus(2).label, 'Sắp hết hàng');
  assert.equal(getStockStatus(5).label, 'Còn hàng');
});

test('processSmartAiQuery handles in-stock inventory query', () => {
  const res = processSmartAiQuery('xuất các hàng còn tồn trong kho', mockProducts, mockOrders, mockServices);
  assert.equal(res.intent, 'inventory_in_stock');
  assert.match(res.title, /Tồn Trong Kho/);
  assert.equal(res.tableRows.length, 2); // only p1 (stock 2) and p3 (stock 15)
});

test('processSmartAiQuery handles bestsellers query', () => {
  const res = processSmartAiQuery('thống kê sản phẩm bán chạy nhất', mockProducts, mockOrders, mockServices);
  assert.equal(res.intent, 'bestsellers');
  assert.match(res.title, /Bán Chạy/);
  assert.equal(res.tableRows.length, 3);
});

test('processSmartAiQuery handles low stock alert query', () => {
  const res = processSmartAiQuery('cảnh báo hàng sắp hết', mockProducts, mockOrders, mockServices);
  assert.equal(res.intent, 'low_stock_alert');
  assert.equal(res.tableRows.length, 2);
});

test('formatVND formats number to Vietnamese currency string', () => {
  const formatted = formatVND(1000000);
  assert.ok(formatted.includes('1.000.000') || formatted.includes('1,000,000'));
});
