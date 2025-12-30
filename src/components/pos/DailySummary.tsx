import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BarChart3, TrendingUp, Banknote, CreditCard, Smartphone, Receipt } from 'lucide-react';

interface DailySummaryProps {
  summary: {
    transactionCount: number;
    totalRevenue: number;
    totalTax: number;
    cashTotal: number;
    cardTotal: number;
    digitalTotal: number;
  };
}

export function DailySummary({ summary }: DailySummaryProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="pos" size="pos" className="gap-2">
          <BarChart3 className="h-5 w-5" />
          <span className="hidden sm:inline">Summary</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Summary
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Total Revenue */}
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/30">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-primary">
              ${summary.totalRevenue.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              <span>{summary.transactionCount} transactions</span>
            </div>
          </div>

          {/* Tax Collected */}
          <div className="p-4 rounded-lg bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">Tax Collected</p>
            <p className="text-2xl font-bold">${summary.totalTax.toFixed(2)}</p>
          </div>

          {/* Payment Breakdown */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Payment Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-success" />
                  </div>
                  <span>Cash</span>
                </div>
                <span className="font-semibold">${summary.cashTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <span>Card</span>
                </div>
                <span className="font-semibold">${summary.cardTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pos-category-2/20 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-pos-category-2" />
                  </div>
                  <span>Digital Wallet</span>
                </div>
                <span className="font-semibold">${summary.digitalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
