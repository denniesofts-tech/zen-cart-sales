import { Transaction } from '@/types/pos';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Printer, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function ReceiptModal({ open, onClose, transaction }: ReceiptModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <Check className="h-5 w-5" />
            Payment Complete
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Receipt Preview */}
          <div className="bg-foreground text-background rounded-lg p-6 font-mono text-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">CAFÉ POS</h3>
              <p className="text-xs opacity-70">123 Coffee Street</p>
              <p className="text-xs opacity-70">
                {format(new Date(transaction.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>

            <div className="border-t border-dashed border-background/30 my-3" />

            <div className="space-y-1">
              {transaction.items.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-background/30 my-3" />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-${transaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-background/30 my-3" />

            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL</span>
              <span>${transaction.total.toFixed(2)}</span>
            </div>

            <div className="mt-3 text-xs">
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="uppercase">{transaction.paymentMethod}</span>
              </div>
              {transaction.cashReceived && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Received</span>
                    <span>${transaction.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>${transaction.change?.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-dashed border-background/30 my-3" />

            <div className="text-center text-xs opacity-70">
              <p>Thank you for your visit!</p>
              <p className="mt-1">{transaction.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>

          <Button
            variant="pos-primary"
            className="w-full mt-3"
            onClick={onClose}
          >
            New Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
