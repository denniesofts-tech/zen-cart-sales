export interface Category {
  id: string;
  name: string;
  color: 'category-1' | 'category-2' | 'category-3' | 'category-4' | 'category-5';
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sku: string;
  stock: number;
  taxRate: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  cashReceived?: number;
  change?: number;
  timestamp: Date;
  status: 'completed' | 'voided' | 'refunded';
  staffId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'manager' | 'admin';
  pin: string;
}

export type PaymentMethod = 'cash' | 'card' | 'digital';
