import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error loading categories',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
    return data as Category[];
  }, [toast]);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error loading products',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
    return data as Product[];
  }, [toast]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
    setCategories(cats);
    setProducts(prods);
    setLoading(false);
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStock = useCallback(async (productId: string, newStock: number) => {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);
    
    if (error) {
      console.error('Error updating stock:', error);
      return false;
    }
    
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    ));
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
