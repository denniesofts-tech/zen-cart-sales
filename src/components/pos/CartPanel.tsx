import { CartItem } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingCart, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartPanelProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
}

export function CartPanel({
  items,
  subtotal,
  discount,
  tax,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
}: CartPanelProps) {
  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Current Order</h2>
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 px-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No items in cart</p>
            <p className="text-xs mt-1">Tap products to add them</p>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            {items.map((item, index) => (
              <div
                key={item.product.id}
                className={cn(
                  "animate-slide-up bg-secondary/30 rounded-lg p-3",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <span className="font-semibold text-sm ml-2">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {item.discount && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-success">
                    <Percent className="h-3 w-3" />
                    <span>
                      {item.discount.type === 'percentage'
                        ? `${item.discount.value}% off`
                        : `-$${item.discount.value.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals */}
      <div className="border-t border-border p-4 space-y-2 bg-secondary/20">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-4 pt-0">
        <Button
          variant="pos-primary"
          className="w-full"
          size="xl"
          disabled={isEmpty}
          onClick={onCheckout}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
