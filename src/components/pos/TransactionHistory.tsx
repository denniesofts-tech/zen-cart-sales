import { Transaction } from '@/types/pos';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History, Banknote, CreditCard, Smartphone, XCircle, RotateCcw, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const paymentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  card: CreditCard,
  digital: Smartphone,
};

interface TransactionHistoryProps {
  transactions: Transaction[];
  onVoid: (transactionId: string) => void;
  onRefund: (transactionId: string) => void;
}

export function TransactionHistory({ transactions, onVoid, onRefund }: TransactionHistoryProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="pos" size="pos" className="gap-2">
          <History className="h-5 w-5" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <History className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3 pr-4">
              {transactions.map((transaction) => {
                const PaymentIcon = paymentIcons[transaction.paymentMethod];
                
                return (
                  <div
                    key={transaction.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      transaction.status === 'completed' && "bg-secondary/30 border-border",
                      transaction.status === 'voided' && "bg-destructive/10 border-destructive/30",
                      transaction.status === 'refunded' && "bg-accent/10 border-accent/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {transaction.id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(transaction.timestamp), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                        <span className={cn(
                          "text-lg font-bold",
                          transaction.status === 'completed' && "text-foreground",
                          transaction.status === 'voided' && "text-destructive line-through",
                          transaction.status === 'refunded' && "text-accent"
                        )}>
                          ${transaction.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-3">
                      {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                      {transaction.status !== 'completed' && (
                        <span className={cn(
                          "ml-2 px-1.5 py-0.5 rounded uppercase font-medium",
                          transaction.status === 'voided' && "bg-destructive/20 text-destructive",
                          transaction.status === 'refunded' && "bg-accent/20 text-accent"
                        )}>
                          {transaction.status}
                        </span>
                      )}
                    </div>

                    {transaction.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onVoid(transaction.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Void
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => onRefund(transaction.id)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Refund
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
