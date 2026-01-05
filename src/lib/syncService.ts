import { supabase } from '@/integrations/supabase/client';
import {
  getPendingTransactions,
  removePendingTransaction,
  getPendingStockUpdates,
  removePendingStockUpdate,
  saveProducts,
  saveCategories,
  saveTransactions,
  setLastSync,
  getProducts as getLocalProducts,
  getCategories as getLocalCategories,
  type PendingTransaction,
} from './offlineDb';
import type { Product, Category } from '@/hooks/useProducts';
import type { DbTransaction } from '@/hooks/useDbTransactions';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

type SyncListener = (status: SyncStatus, pendingCount: number) => void;
const listeners: Set<SyncListener> = new Set();

let isSyncing = false;
let pendingCount = 0;

export function addSyncListener(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(status: SyncStatus, count: number) {
  pendingCount = count;
  listeners.forEach(l => l(status, count));
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export async function syncPendingTransactions(): Promise<void> {
  if (isSyncing || !isOnline()) return;

  isSyncing = true;
  notifyListeners('syncing', pendingCount);

  try {
    const pending = await getPendingTransactions();

    for (const txn of pending) {
      const success = await syncSingleTransaction(txn);
      if (success) {
        await removePendingTransaction(txn.id);
        pendingCount = Math.max(0, pendingCount - 1);
        notifyListeners('syncing', pendingCount);
      }
    }

    // Sync pending stock updates
    const stockUpdates = await getPendingStockUpdates();
    for (const update of stockUpdates) {
      const { error } = await supabase
        .from('products')
        .update({ stock: update.quantity })
        .eq('id', update.productId);

      if (!error) {
        await removePendingStockUpdate(update.id);
      }
    }

    notifyListeners('success', pendingCount);
  } catch (error) {
    console.error('Sync error:', error);
    notifyListeners('error', pendingCount);
  } finally {
    isSyncing = false;
  }
}

async function syncSingleTransaction(txn: PendingTransaction): Promise<boolean> {
  const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data: txnData, error: txnError } = await supabase
    .from('transactions')
    .insert({
      transaction_number: transactionNumber,
      subtotal: txn.subtotal,
      tax: txn.tax,
      discount: txn.discount,
      total: txn.total,
      payment_method: txn.paymentMethod,
      cash_received: txn.cashReceived || null,
      change_amount: txn.cashReceived ? txn.cashReceived - txn.total : null,
      staff_id: txn.profileId,
      status: 'completed',
    })
    .select()
    .single();

  if (txnError) {
    console.error('Error syncing transaction:', txnError);
    return false;
  }

  // Insert transaction items
  const itemsToInsert = txn.items.map(item => ({
    transaction_id: txnData.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_type: item.discount_type,
    discount_value: item.discount_value,
  }));

  await supabase.from('transaction_items').insert(itemsToInsert);

  return true;
}

export async function syncFromServer(): Promise<{
  products: Product[];
  categories: Category[];
  transactions: DbTransaction[];
}> {
  if (!isOnline()) {
    // Return cached data
    const [products, categories] = await Promise.all([
      getLocalProducts(),
      getLocalCategories(),
    ]);
    return { products, categories, transactions: [] };
  }

  try {
    const [productsRes, categoriesRes, transactionsRes] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('name'),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    const products = (productsRes.data || []) as Product[];
    const categories = (categoriesRes.data || []) as Category[];
    const transactions = (transactionsRes.data || []) as DbTransaction[];

    // Cache locally
    await Promise.all([
      saveProducts(products),
      saveCategories(categories),
      saveTransactions(transactions),
      setLastSync(Date.now()),
    ]);

    return { products, categories, transactions };
  } catch (error) {
    console.error('Error syncing from server:', error);
    // Return cached data on error
    const [products, categories] = await Promise.all([
      getLocalProducts(),
      getLocalCategories(),
    ]);
    return { products, categories, transactions: [] };
  }
}

export async function updatePendingCount(): Promise<number> {
  const pending = await getPendingTransactions();
  pendingCount = pending.length;
  notifyListeners('idle', pendingCount);
  return pendingCount;
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingTransactions();
    syncFromServer();
  });
}
