import { useState } from 'react';
import { PaymentMethod } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Banknote, CreditCard, Smartphone, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onComplete: (method: PaymentMethod, cashReceived?: number) => void;
}

const quickCashAmounts = [5, 10, 20, 50, 100];

export function PaymentModal({ open, onClose, total, onComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - total;
  const canCompleteCash = cashAmount >= total;

  const handleComplete = async () => {
    if (!selectedMethod) return;
    
    setProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onComplete(
      selectedMethod,
      selectedMethod === 'cash' ? cashAmount : undefined
    );
    
    setProcessing(false);
    setSelectedMethod(null);
    setCashReceived('');
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setCashReceived('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {selectedMethod === 'cash' ? 'Cash Payment' : 'Select Payment Method'}
          </DialogTitle>
        </DialogHeader>

        {!selectedMethod ? (
          <div className="space-y-4 py-4">
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm">Amount Due</p>
              <p className="text-4xl font-bold text-primary">${total.toFixed(2)}</p>
            </div>

            <div className="grid gap-3">
              <Button
                variant="pos"
                className="h-20 justify-start gap-4 text-lg"
                onClick={() => setSelectedMethod('cash')}
              >
                <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-success" />
                </div>
                <span>Cash</span>
              </Button>

              <Button
                variant="pos"
                className="h-20 justify-start gap-4 text-lg"
                onClick={() => setSelectedMethod('card')}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <span>Card</span>
              </Button>

              <Button
                variant="pos"
                className="h-20 justify-start gap-4 text-lg"
                onClick={() => setSelectedMethod('digital')}
              >
                <div className="h-12 w-12 rounded-lg bg-pos-category-2/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-pos-category-2" />
                </div>
                <span>Digital Wallet</span>
              </Button>
            </div>
          </div>
        ) : selectedMethod === 'cash' ? (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMethod(null)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-2xl font-bold">${total.toFixed(2)}</p>
              </div>
              <div className={cn(
                "p-4 rounded-lg",
                change >= 0 ? "bg-success/20" : "bg-secondary/50"
              )}>
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={cn(
                  "text-2xl font-bold",
                  change >= 0 ? "text-success" : "text-muted-foreground"
                )}>
                  ${change > 0 ? change.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Cash Received
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="text-2xl h-14 text-center font-bold"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickCashAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setCashReceived(amount.toString())}
                  className="flex-1 min-w-[60px]"
                >
                  ${amount}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCashReceived(Math.ceil(total).toString())}
                className="flex-1 min-w-[60px]"
              >
                Exact
              </Button>
            </div>

            <Button
              variant="pos-success"
              className="w-full"
              size="xl"
              disabled={!canCompleteCash || processing}
              onClick={handleComplete}
            >
              {processing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMethod(null)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="text-center py-8">
              <div className={cn(
                "h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                selectedMethod === 'card' ? "bg-primary/20" : "bg-pos-category-2/20"
              )}>
                {selectedMethod === 'card' ? (
                  <CreditCard className="h-10 w-10 text-primary" />
                ) : (
                  <Smartphone className="h-10 w-10 text-pos-category-2" />
                )}
              </div>
              <p className="text-muted-foreground mb-2">
                {selectedMethod === 'card' 
                  ? 'Ready for card payment'
                  : 'Ready for digital wallet'
                }
              </p>
              <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
            </div>

            <Button
              variant="pos-success"
              className="w-full"
              size="xl"
              disabled={processing}
              onClick={handleComplete}
            >
              {processing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
