import { Category, Product, Staff } from '@/types/pos';

export const categories: Category[] = [
  { id: 'beverages', name: 'Beverages', color: 'category-1', icon: 'Coffee' },
  { id: 'food', name: 'Food', color: 'category-2', icon: 'UtensilsCrossed' },
  { id: 'snacks', name: 'Snacks', color: 'category-3', icon: 'Cookie' },
  { id: 'desserts', name: 'Desserts', color: 'category-4', icon: 'Cake' },
  { id: 'merchandise', name: 'Merchandise', color: 'category-5', icon: 'ShoppingBag' },
];

export const products: Product[] = [
  // Beverages
  { id: 'esp-001', name: 'Espresso', description: 'Rich single shot', price: 3.50, categoryId: 'beverages', sku: 'BEV001', stock: 100, taxRate: 8.5 },
  { id: 'lat-001', name: 'Latte', description: 'Espresso with steamed milk', price: 5.00, categoryId: 'beverages', sku: 'BEV002', stock: 100, taxRate: 8.5 },
  { id: 'cap-001', name: 'Cappuccino', description: 'Espresso with foam', price: 4.75, categoryId: 'beverages', sku: 'BEV003', stock: 100, taxRate: 8.5 },
  { id: 'ame-001', name: 'Americano', description: 'Espresso with hot water', price: 3.75, categoryId: 'beverages', sku: 'BEV004', stock: 100, taxRate: 8.5 },
  { id: 'moc-001', name: 'Mocha', description: 'Espresso with chocolate', price: 5.50, categoryId: 'beverages', sku: 'BEV005', stock: 100, taxRate: 8.5 },
  { id: 'tea-001', name: 'Green Tea', description: 'Organic green tea', price: 3.25, categoryId: 'beverages', sku: 'BEV006', stock: 80, taxRate: 8.5 },
  { id: 'smo-001', name: 'Smoothie', description: 'Fresh fruit blend', price: 6.50, categoryId: 'beverages', sku: 'BEV007', stock: 50, taxRate: 8.5 },
  { id: 'col-001', name: 'Cold Brew', description: '24hr cold steeped', price: 4.50, categoryId: 'beverages', sku: 'BEV008', stock: 60, taxRate: 8.5 },
  
  // Food
  { id: 'san-001', name: 'Club Sandwich', description: 'Triple-decker classic', price: 12.50, categoryId: 'food', sku: 'FOO001', stock: 25, taxRate: 8.5 },
  { id: 'sal-001', name: 'Caesar Salad', description: 'Fresh romaine & parmesan', price: 10.00, categoryId: 'food', sku: 'FOO002', stock: 20, taxRate: 8.5 },
  { id: 'wra-001', name: 'Chicken Wrap', description: 'Grilled chicken wrap', price: 11.00, categoryId: 'food', sku: 'FOO003', stock: 18, taxRate: 8.5 },
  { id: 'sou-001', name: 'Soup of Day', description: 'Chef\'s daily soup', price: 6.50, categoryId: 'food', sku: 'FOO004', stock: 15, taxRate: 8.5 },
  { id: 'qch-001', name: 'Quiche', description: 'Spinach & feta quiche', price: 8.50, categoryId: 'food', sku: 'FOO005', stock: 12, taxRate: 8.5 },
  { id: 'bag-001', name: 'Bagel & Cream', description: 'Fresh bagel with spread', price: 5.50, categoryId: 'food', sku: 'FOO006', stock: 30, taxRate: 8.5 },
  
  // Snacks
  { id: 'cro-001', name: 'Croissant', description: 'Buttery French pastry', price: 4.00, categoryId: 'snacks', sku: 'SNA001', stock: 40, taxRate: 8.5 },
  { id: 'muf-001', name: 'Blueberry Muffin', description: 'Fresh baked muffin', price: 3.75, categoryId: 'snacks', sku: 'SNA002', stock: 35, taxRate: 8.5 },
  { id: 'coo-001', name: 'Chocolate Chip Cookie', description: 'Classic cookie', price: 2.50, categoryId: 'snacks', sku: 'SNA003', stock: 50, taxRate: 8.5 },
  { id: 'gra-001', name: 'Granola Bar', description: 'Healthy oat bar', price: 3.00, categoryId: 'snacks', sku: 'SNA004', stock: 45, taxRate: 8.5 },
  { id: 'chi-001', name: 'Chips', description: 'Kettle cooked chips', price: 2.25, categoryId: 'snacks', sku: 'SNA005', stock: 60, taxRate: 8.5 },
  
  // Desserts
  { id: 'che-001', name: 'Cheesecake', description: 'NY style cheesecake', price: 7.50, categoryId: 'desserts', sku: 'DES001', stock: 10, taxRate: 8.5 },
  { id: 'bro-001', name: 'Brownie', description: 'Fudgy chocolate brownie', price: 4.50, categoryId: 'desserts', sku: 'DES002', stock: 25, taxRate: 8.5 },
  { id: 'tir-001', name: 'Tiramisu', description: 'Italian coffee dessert', price: 8.00, categoryId: 'desserts', sku: 'DES003', stock: 8, taxRate: 8.5 },
  { id: 'mac-001', name: 'Macarons (3)', description: 'Assorted French macarons', price: 6.00, categoryId: 'desserts', sku: 'DES004', stock: 20, taxRate: 8.5 },
  
  // Merchandise
  { id: 'mug-001', name: 'Branded Mug', description: 'Ceramic coffee mug', price: 15.00, categoryId: 'merchandise', sku: 'MER001', stock: 30, taxRate: 8.5 },
  { id: 'tum-001', name: 'Travel Tumbler', description: 'Insulated tumbler', price: 25.00, categoryId: 'merchandise', sku: 'MER002', stock: 20, taxRate: 8.5 },
  { id: 'bag-002', name: 'Tote Bag', description: 'Canvas tote bag', price: 18.00, categoryId: 'merchandise', sku: 'MER003', stock: 25, taxRate: 8.5 },
  { id: 'bea-001', name: 'Coffee Beans 250g', description: 'House blend beans', price: 16.00, categoryId: 'merchandise', sku: 'MER004', stock: 40, taxRate: 0 },
];

export const staff: Staff[] = [
  { id: 'staff-001', name: 'Alex Johnson', role: 'manager', pin: '1234' },
  { id: 'staff-002', name: 'Sam Williams', role: 'cashier', pin: '5678' },
  { id: 'staff-003', name: 'Jordan Lee', role: 'cashier', pin: '9012' },
];
