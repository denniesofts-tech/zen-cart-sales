import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  saveProducts,
  saveCategories,
  getProducts as getLocalProducts,
  getCategories as getLocalCategories,
  updateLocalProductStock,
  addPendingStockUpdate,
} from '@/lib/offlineDb';
import { isOnline, syncFromServer } from '@/lib/syncService';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  sku: string | null;
  stock: number;
  tax_rate: number;
  image_url: string | null;
  is_active: boolean;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // Try to load from local first for instant display
      const [localProducts, localCategories] = await Promise.all([
        getLocalProducts(),
        getLocalCategories(),
      ]);

      if (localProducts.length > 0 || localCategories.length > 0) {
        setProducts(localProducts);
        setCategories(localCategories);
      }

      // Then sync from server if online
      if (isOnline()) {
        const { products: serverProducts, categories: serverCategories } = await syncFromServer();
        
        if (serverProducts.length > 0) {
          setProducts(serverProducts);
        }
        if (serverCategories.length > 0) {
          setCategories(serverCategories);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Using cached data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();

    // Listen for online event to refresh data
    const handleOnline = () => {
      loadData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [loadData]);

  const updateStock = useCallback(async (productId: string, newStock: number) => {
    // Update local state immediately
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    ));

    // Update IndexedDB
    await updateLocalProductStock(productId, newStock);

    if (isOnline()) {
      // Update server
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) {
        console.error('Error updating stock:', error);
        // Queue for later sync
        await addPendingStockUpdate({
          id: `stock-${productId}-${Date.now()}`,
          productId,
          quantity: newStock,
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      // Queue for sync when online
      await addPendingStockUpdate({
        id: `stock-${productId}-${Date.now()}`,
        productId,
        quantity: newStock,
        createdAt: new Date().toISOString(),
      });
    }

    return true;
  }, []);

  const decrementStock = useCallback(async (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const newStock = Math.max(0, product.stock - quantity);
    return updateStock(productId, newStock);
  }, [products, updateStock]);

  return {
    products,
    categories,
    loading,
    refetch: loadData,
    updateStock,
    decrementStock,
  };
}
