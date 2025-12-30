import { useState, useCallback } from 'react';
import { Transaction, CartItem, PaymentMethod } from '@/types/pos';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const createTransaction = useCallback((
    items: CartItem[],
    subtotal: number,
    tax: number,
    discount: number,
    total: number,
    paymentMethod: PaymentMethod,
    cashReceived?: number
  ): Transaction => {
    const transaction: Transaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: [...items],
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      cashReceived,
      change: cashReceived ? cashReceived - total : undefined,
      timestamp: new Date(),
      status: 'completed',
    };

    setTransactions(prev => [transaction, ...prev]);
    return transaction;
  }, []);

  const voidTransaction = useCallback((transactionId: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === transactionId
          ? { ...txn, status: 'voided' as const }
          : txn
      )
    );
  }, []);

  const refundTransaction = useCallback((transactionId: string) => {
    setTransactions(prev =>
      prev.map(txn =>
        txn.id === transactionId
          ? { ...txn, status: 'refunded' as const }
          : txn
      )
    );
  }, []);

  const getDailySummary = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = transactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      txnDate.setHours(0, 0, 0, 0);
      return txnDate.getTime() === today.getTime() && txn.status === 'completed';
    });

    const totalRevenue = todayTransactions.reduce((sum, txn) => sum + txn.total, 0);
    const totalTax = todayTransactions.reduce((sum, txn) => sum + txn.tax, 0);
    const cashTotal = todayTransactions
      .filter(txn => txn.paymentMethod === 'cash')
      .reduce((sum, txn) => sum + txn.total, 0);
    const cardTotal = todayTransactions
      .filter(txn => txn.paymentMethod === 'card')
      .reduce((sum, txn) => sum + txn.total, 0);
    const digitalTotal = todayTransactions
      .filter(txn => txn.paymentMethod === 'digital')
      .reduce((sum, txn) => sum + txn.total, 0);

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
    createTransaction,
    voidTransaction,
    refundTransaction,
    getDailySummary,
  };
}
