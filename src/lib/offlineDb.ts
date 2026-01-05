import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Category, Product } from '@/hooks/useProducts';
import type { DbTransaction, TransactionItem } from '@/hooks/useDbTransactions';

interface PendingTransaction {
  id: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  createdAt: string;
  profileId: string | null;
}

interface PendingStockUpdate {
  id: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

interface POSDatabase extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-category': string | null };
  };
  categories: {
    key: string;
    value: Category;
    indexes: { 'by-sort': number };
  };
  transactions: {
    key: string;
    value: DbTransaction;
    indexes: { 'by-date': string };
  };
  pendingTransactions: {
    key: string;
    value: PendingTransaction;
    indexes: { 'by-date': string };
  };
  pendingStockUpdates: {
    key: string;
    value: PendingStockUpdate;
    indexes: { 'by-date': string };
  };
  syncMeta: {
    key: string;
    value: { key: string; value: string | number };
  };
}

const DB_NAME = 'zencart-pos';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<POSDatabase> | null = null;

export async function getDb(): Promise<IDBPDatabase<POSDatabase>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<POSDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-category', 'category_id');
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoryStore.createIndex('by-sort', 'sort_order');
      }

      // Transactions store (cached from server)
      if (!db.objectStoreNames.contains('transactions')) {
        const txnStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txnStore.createIndex('by-date', 'created_at');
      }

      // Pending transactions (created offline)
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        const pendingStore = db.createObjectStore('pendingTransactions', { keyPath: 'id' });
        pendingStore.createIndex('by-date', 'createdAt');
      }

      // Pending stock updates
      if (!db.objectStoreNames.contains('pendingStockUpdates')) {
        const stockStore = db.createObjectStore('pendingStockUpdates', { keyPath: 'id' });
        stockStore.createIndex('by-date', 'createdAt');
      }

      // Sync metadata
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Products operations
export async function saveProducts(products: Product[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('products', 'readwrite');
  await Promise.all([
    ...products.map(p => tx.store.put(p)),
    tx.done,
  ]);
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.getAll('products');
}

export async function updateLocalProductStock(productId: string, newStock: number): Promise<void> {
  const db = await getDb();
  const product = await db.get('products', productId);
  if (product) {
    product.stock = newStock;
    await db.put('products', product);
  }
}

// Categories operations
export async function saveCategories(categories: Category[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('categories', 'readwrite');
  await Promise.all([
    ...categories.map(c => tx.store.put(c)),
    tx.done,
  ]);
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  const categories = await db.getAll('categories');
  return categories.sort((a, b) => a.sort_order - b.sort_order);
}

// Transactions operations
export async function saveTransactions(transactions: DbTransaction[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('transactions', 'readwrite');
  await Promise.all([
    ...transactions.map(t => tx.store.put(t)),
    tx.done,
  ]);
}

export async function getTransactions(): Promise<DbTransaction[]> {
  const db = await getDb();
  const transactions = await db.getAll('transactions');
  return transactions.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function addTransaction(transaction: DbTransaction): Promise<void> {
  const db = await getDb();
  await db.put('transactions', transaction);
}

// Pending transactions (offline queue)
export async function addPendingTransaction(transaction: PendingTransaction): Promise<void> {
  const db = await getDb();
  await db.put('pendingTransactions', transaction);
}

export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  const db = await getDb();
  return db.getAll('pendingTransactions');
}

export async function removePendingTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('pendingTransactions', id);
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb();
  return db.count('pendingTransactions');
}

// Pending stock updates
export async function addPendingStockUpdate(update: PendingStockUpdate): Promise<void> {
  const db = await getDb();
  await db.put('pendingStockUpdates', update);
}

export async function getPendingStockUpdates(): Promise<PendingStockUpdate[]> {
  const db = await getDb();
  return db.getAll('pendingStockUpdates');
}

export async function removePendingStockUpdate(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('pendingStockUpdates', id);
}

// Sync metadata
export async function setLastSync(timestamp: number): Promise<void> {
  const db = await getDb();
  await db.put('syncMeta', { key: 'lastSync', value: timestamp });
}

export async function getLastSync(): Promise<number | null> {
  const db = await getDb();
  const meta = await db.get('syncMeta', 'lastSync');
  return meta ? (meta.value as number) : null;
}

export type { PendingTransaction, PendingStockUpdate };
