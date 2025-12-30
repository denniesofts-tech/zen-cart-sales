import { useState, useMemo } from 'react';
import { categories, products } from '@/data/sampleData';
import { useCart } from '@/hooks/useCart';
import { useTransactions } from '@/hooks/useTransactions';
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
import { Store, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  
  const cart = useCart();
  const { transactions, createTransaction, voidTransaction, refundTransaction, getDailySummary } = useTransactions();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (activeCategory) {
      filtered = filtered.filter(p => p.categoryId === activeCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activeCategory, searchQuery]);

  const handleProductClick = (product: typeof products[0]) => {
    cart.addItem(product);
    toast({
      title: "Added to cart",
      description: product.name,
      duration: 1500,
    });
  };

  const handlePaymentComplete = (method: PaymentMethod, cashReceived?: number) => {
    const transaction = createTransaction(
      cart.items,
      cart.subtotal,
      cart.tax,
      cart.discount,
      cart.total,
      method,
      cashReceived
    );
    
    cart.clearCart();
    setShowPayment(false);
    setCompletedTransaction(transaction);
  };

  const handleVoid = (transactionId: string) => {
    voidTransaction(transactionId);
    toast({
      title: "Transaction voided",
      description: transactionId,
    });
  };

  const handleRefund = (transactionId: string) => {
    refundTransaction(transactionId);
    toast({
      title: "Transaction refunded",
      description: transactionId,
    });
  };

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
          <DailySummary summary={getDailySummary()} />
          <TransactionHistory
            transactions={transactions}
            onVoid={handleVoid}
            onRefund={handleRefund}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Search */}
          <div className="mb-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          
          {/* Categories */}
          <div className="mb-4">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
          
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
