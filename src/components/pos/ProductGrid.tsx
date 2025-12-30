import { Product, Category } from '@/types/pos';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

const categoryColorMap: Record<string, string> = {
  'beverages': 'border-l-pos-category-1',
  'food': 'border-l-pos-category-2',
  'snacks': 'border-l-pos-category-3',
  'desserts': 'border-l-pos-category-4',
  'merchandise': 'border-l-pos-category-5',
};

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, categories, onProductClick }: ProductGridProps) {
  const getCategoryColor = (categoryId: string) => {
    return categoryColorMap[categoryId] || 'border-l-primary';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map(product => {
        const isLowStock = product.stock <= 5;
        const isOutOfStock = product.stock <= 0;
        
        return (
          <button
            key={product.id}
            onClick={() => !isOutOfStock && onProductClick(product)}
            disabled={isOutOfStock}
            className={cn(
              "group relative flex flex-col p-4 rounded-xl border-l-4 bg-card hover:bg-card/80 text-left transition-all duration-200 min-h-[120px]",
              getCategoryColor(product.categoryId),
              isOutOfStock && "opacity-50 cursor-not-allowed",
              !isOutOfStock && "hover:shadow-pos-md hover:-translate-y-0.5 active:scale-[0.98]"
            )}
          >
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {product.description}
              </p>
            </div>
            
            <div className="flex items-end justify-between mt-2">
              <span className="text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              
              {isLowStock && !isOutOfStock && (
                <span className="flex items-center gap-1 text-xs text-accent">
                  <AlertCircle className="h-3 w-3" />
                  {product.stock} left
                </span>
              )}
              
              {isOutOfStock && (
                <span className="text-xs font-medium text-destructive">
                  Out of stock
                </span>
              )}
            </div>
            
            {product.taxRate === 0 && (
              <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success font-medium">
                TAX FREE
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
