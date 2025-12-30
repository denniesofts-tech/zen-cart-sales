import { useState, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/types/pos';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<{ type: 'fixed' | 'percentage'; value: number } | null>(null);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const applyItemDiscount = useCallback((productId: string, discount: { type: 'fixed' | 'percentage'; value: number } | undefined) => {
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, discount }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartDiscount(null);
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    let itemDiscounts = 0;
    let tax = 0;

    items.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;

      if (item.discount) {
        if (item.discount.type === 'fixed') {
          itemDiscounts += item.discount.value * item.quantity;
        } else {
          itemDiscounts += itemTotal * (item.discount.value / 100);
        }
      }

      const taxableAmount = itemTotal - (item.discount
        ? item.discount.type === 'fixed'
          ? item.discount.value * item.quantity
          : itemTotal * (item.discount.value / 100)
        : 0);
      tax += taxableAmount * (item.product.taxRate / 100);
    });

    let cartDiscountAmount = 0;
    if (cartDiscount) {
      const discountableAmount = subtotal - itemDiscounts;
      if (cartDiscount.type === 'fixed') {
        cartDiscountAmount = Math.min(cartDiscount.value, discountableAmount);
      } else {
        cartDiscountAmount = discountableAmount * (cartDiscount.value / 100);
      }
    }

    const totalDiscount = itemDiscounts + cartDiscountAmount;
    const total = subtotal - totalDiscount + tax;

    return {
      subtotal,
      discount: totalDiscount,
      tax,
      total: Math.max(0, total),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items, cartDiscount]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    applyItemDiscount,
    clearCart,
    cartDiscount,
    setCartDiscount,
    ...totals,
  };
}
