import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbTransaction {
  id: string;
  transaction_number: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  cash_received: number | null;
  change_amount: number | null;
  status: string;
  staff_id: string | null;
  created_at: string;
}

export interface TransactionItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_type: string | null;
  discount_value: number | null;
}

export function useDbTransactions(profileId: string | null) {
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data as DbTransaction[];
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
      setLoading(false);
    };
    load();
  }, [fetchTransactions]);

  const createTransaction = useCallback(async (
    items: TransactionItem[],
    subtotal: number,
    tax: number,
    discount: number,
    total: number,
    paymentMethod: string,
    cashReceived?: number
  ): Promise<DbTransaction | null> => {
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const { data: txnData, error: txnError } = await supabase
      .from('transactions')
      .insert({
        transaction_number: transactionNumber,
        subtotal,
        tax,
        discount,
        total,
        payment_method: paymentMethod,
        cash_received: cashReceived || null,
        change_amount: cashReceived ? cashReceived - total : null,
        staff_id: profileId,
        status: 'completed',
      })
      .select()
      .single();
    
    if (txnError) {
      console.error('Error creating transaction:', txnError);
      toast({
        title: 'Transaction failed',
        description: txnError.message,
        variant: 'destructive',
      });
      return null;
    }

    // Insert transaction items
    const itemsToInsert = items.map(item => ({
      transaction_id: txnData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating transaction items:', itemsError);
    }

    setTransactions(prev => [txnData as DbTransaction, ...prev]);
    return txnData as DbTransaction;
  }, [profileId, toast]);

  const updateTransactionStatus = useCallback(async (transactionId: string, status: 'completed' | 'voided' | 'refunded') => {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId);
    
    if (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    setTransactions(prev => prev.map(txn => 
      txn.id === transactionId ? { ...txn, status } : txn
    ));
    return true;
  }, [toast]);

  const getDailySummary = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.created_at);
      txnDate.setHours(0, 0, 0, 0);
      return txnDate.getTime() === today.getTime() && txn.status === 'completed';
    });

    const totalRevenue = todayTransactions.reduce((sum, txn) => sum + Number(txn.total), 0);
    const totalTax = todayTransactions.reduce((sum, txn) => sum + Number(txn.tax), 0);
    const cashTotal = todayTransactions
      .filter(txn => txn.payment_method === 'cash')
      .reduce((sum, txn) => sum + Number(txn.total), 0);
    const cardTotal = todayTransactions
      .filter(txn => txn.payment_method === 'card')
      .reduce((sum, txn) => sum + Number(txn.total), 0);
    const digitalTotal = todayTransactions
      .filter(txn => txn.payment_method === 'digital')
      .reduce((sum, txn) => sum + Number(txn.total), 0);

    return {
      transactionCount: todayTransactions.length,
      totalRevenue,
      totalTax,
      cashTotal,
      cardTotal,
      digitalTotal,
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransactionStatus,
    getDailySummary,
    refetch: fetchTransactions,
  };
}
