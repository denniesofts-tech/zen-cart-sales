import { cn } from '@/lib/utils';
import { Coffee, UtensilsCrossed, Cookie, Cake, ShoppingBag, LayoutGrid, Package } from 'lucide-react';
import type { Category } from '@/hooks/useProducts';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee,
  UtensilsCrossed,
  Cookie,
  Cake,
  ShoppingBag,
  LayoutGrid,
  Package,
};

const colorMap: Record<string, string> = {
  'category-1': 'bg-pos-category-1/15 text-pos-category-1 border-pos-category-1/50 hover:bg-pos-category-1/25',
  'category-2': 'bg-pos-category-2/15 text-pos-category-2 border-pos-category-2/50 hover:bg-pos-category-2/25',
  'category-3': 'bg-pos-category-3/15 text-pos-category-3 border-pos-category-3/50 hover:bg-pos-category-3/25',
  'category-4': 'bg-pos-category-4/15 text-pos-category-4 border-pos-category-4/50 hover:bg-pos-category-4/25',
  'category-5': 'bg-pos-category-5/15 text-pos-category-5 border-pos-category-5/50 hover:bg-pos-category-5/25',
};

const activeColorMap: Record<string, string> = {
  'category-1': 'bg-pos-category-1 text-background border-pos-category-1',
  'category-2': 'bg-pos-category-2 text-background border-pos-category-2',
  'category-3': 'bg-pos-category-3 text-background border-pos-category-3',
  'category-4': 'bg-pos-category-4 text-background border-pos-category-4',
  'category-5': 'bg-pos-category-5 text-background border-pos-category-5',
};

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "flex flex-col items-center justify-center gap-1 min-w-[100px] min-h-[72px] px-4 rounded-xl border-2 transition-all duration-200",
          activeCategory === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary"
        )}
      >
        <LayoutGrid className="h-5 w-5" />
        <span className="text-xs font-medium">All Items</span>
      </button>
      
      {categories.map(category => {
        const Icon = iconMap[category.icon] || Package;
        const isActive = activeCategory === category.id;
        const color = category.color || 'category-1';
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[100px] min-h-[72px] px-4 rounded-xl border-2 transition-all duration-200",
              isActive 
                ? (activeColorMap[color] || activeColorMap['category-1'])
                : (colorMap[color] || colorMap['category-1'])
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
