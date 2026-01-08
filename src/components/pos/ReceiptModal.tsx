import { useRef } from 'react';
import { Transaction } from '@/types/pos';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Check, Printer, Mail, Store } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function ReceiptModal({ open, onClose, transaction }: ReceiptModalProps) {
  const { settings } = useBusinessSettings();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const businessName = settings?.name || 'CAFÉ POS';

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 10mm;
              max-width: 80mm;
              margin: 0 auto;
            }
            .receipt {
              text-align: center;
            }
            .logo {
              max-width: 60px;
              max-height: 60px;
              margin: 0 auto 8px;
              display: block;
            }
            .business-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .info {
              font-size: 10px;
              opacity: 0.7;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .items {
              text-align: left;
            }
            .item-row, .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: bold;
              margin: 8px 0;
            }
            .footer {
              margin-top: 12px;
              font-size: 10px;
              opacity: 0.7;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${settings?.logo_url ? `<img src="${settings.logo_url}" alt="Logo" class="logo" />` : ''}
            <div class="business-name">${businessName}</div>
            <div class="info">${format(new Date(transaction.timestamp), 'MMM d, yyyy h:mm a')}</div>
            
            <div class="divider"></div>
            
            <div class="items">
              ${transaction.items.map(item => `
                <div class="item-row">
                  <span>${item.quantity}x ${item.product.name}</span>
                  <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="items">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>$${transaction.subtotal.toFixed(2)}</span>
              </div>
              ${transaction.discount > 0 ? `
                <div class="summary-row">
                  <span>Discount</span>
                  <span>-$${transaction.discount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="summary-row">
                <span>Tax</span>
                <span>$${transaction.tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="total-row">
              <span>TOTAL</span>
              <span>$${transaction.total.toFixed(2)}</span>
            </div>
            
            <div class="items">
              <div class="summary-row">
                <span>Payment</span>
                <span>${transaction.paymentMethod.toUpperCase()}</span>
              </div>
              ${transaction.cashReceived ? `
                <div class="summary-row">
                  <span>Cash Received</span>
                  <span>$${transaction.cashReceived.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>Change</span>
                  <span>$${transaction.change?.toFixed(2) || '0.00'}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p>Thank you for your visit!</p>
              <p>${transaction.id}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

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
          <div ref={receiptRef} className="bg-foreground text-background rounded-lg p-6 font-mono text-sm">
            <div className="text-center mb-4">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Business logo" 
                  className="h-12 w-12 object-contain mx-auto mb-2 rounded"
                />
              ) : (
                <div className="h-12 w-12 mx-auto mb-2 rounded bg-background/20 flex items-center justify-center">
                  <Store className="h-6 w-6 opacity-50" />
                </div>
              )}
              <h3 className="text-lg font-bold">{businessName}</h3>
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
            <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
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
