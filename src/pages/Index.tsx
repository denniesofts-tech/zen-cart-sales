import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useDbTransactions } from '@/hooks/useDbTransactions';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { TransactionHistory } from '@/components/pos/TransactionHistory';
import { DailySummary } from '@/components/pos/DailySummary';
import { SearchBar } from '@/components/pos/SearchBar';
import { Transaction, PaymentMethod } from '@/types/pos';
import { useToast } from '@/hooks/use-toast';
import { Store, Clock, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut, isManager } = useAuth();
  const { products, categories, loading: productsLoading, decrementStock } = useProducts();
  const { transactions, createTransaction, updateTransactionStatus, getDailySummary } = useDbTransactions(profile?.id || null);
  const cart = useCart();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (activeCategory) {
      filtered = filtered.filter(p => p.category_id === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [activeCategory, searchQuery, products]);

  const handleProductClick = (product: Product) => {
    // Convert to cart-compatible format
    cart.addItem({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      categoryId: product.category_id || '',
      sku: product.sku || '',
      stock: product.stock,
      taxRate: Number(product.tax_rate),
    });
    toast({
      title: "Added to cart",
      description: product.name,
      duration: 1500,
    });
  };

  const handlePaymentComplete = async (method: PaymentMethod, cashReceived?: number) => {
    // Convert cart items for database
    const items = cart.items.map(item => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      discount_type: item.discount?.type || null,
      discount_value: item.discount?.value || null,
    }));

    const dbTransaction = await createTransaction(
      items,
      cart.subtotal,
      cart.tax,
      cart.discount,
      cart.total,
      method,
      cashReceived
    );

    if (dbTransaction) {
      // Decrement stock for each item
      for (const item of cart.items) {
        await decrementStock(item.product.id, item.quantity);
      }

      // Convert to display format
      const displayTransaction: Transaction = {
        id: dbTransaction.transaction_number,
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        discount: cart.discount,
        total: cart.total,
        paymentMethod: method,
        cashReceived,
        change: cashReceived ? cashReceived - cart.total : undefined,
        timestamp: new Date(dbTransaction.created_at),
        status: 'completed',
        staffId: profile?.id,
      };

      cart.clearCart();
      setShowPayment(false);
      setCompletedTransaction(displayTransaction);
    }
  };

  const handleVoid = async (transactionId: string) => {
    const success = await updateTransactionStatus(transactionId, 'voided');
    if (success) {
      toast({
        title: "Transaction voided",
        description: `Transaction ${transactionId.slice(0, 8)}...`,
      });
    }
  };

  const handleRefund = async (transactionId: string) => {
    const success = await updateTransactionStatus(transactionId, 'refunded');
    if (success) {
      toast({
        title: "Transaction refunded",
        description: `Transaction ${transactionId.slice(0, 8)}...`,
      });
    }
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Store className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Café POS</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(), 'EEEE, MMM d')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* User info */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{profile?.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary capitalize">
              {profile?.role}
            </span>
          </div>
          
          <DailySummary summary={getDailySummary()} />
          <TransactionHistory
            transactions={transactions}
            isManager={isManager}
            onVoid={handleVoid}
            onRefund={handleRefund}
          />
          
          <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Empty state if no products */}
      {products.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Store className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
            <p className="text-muted-foreground mb-4">
              Add products and categories to start using the POS system.
            </p>
            {isManager && (
              <p className="text-sm text-muted-foreground">
                Use the database to add products and categories.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Main Content */
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          {/* Products Section */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Search */}
            <div className="mb-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-4">
                <CategoryTabs
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>
            )}
            
            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto pr-2">
              <ProductGrid
                products={filteredProducts}
                categories={categories}
                onProductClick={handleProductClick}
              />
              
              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <p className="text-sm">No products found</p>
                  <p className="text-xs mt-1">Try a different search or category</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0">
            <CartPanel
              items={cart.items}
              subtotal={cart.subtotal}
              discount={cart.discount}
              tax={cart.tax}
              total={cart.total}
              onUpdateQuantity={cart.updateQuantity}
              onRemoveItem={cart.removeItem}
              onCheckout={() => setShowPayment(true)}
              onClearCart={cart.clearCart}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        total={cart.total}
        onComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={!!completedTransaction}
        onClose={() => setCompletedTransaction(null)}
        transaction={completedTransaction}
      />
    </div>
  );
};

export default Index;
