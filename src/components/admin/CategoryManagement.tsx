import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, Pencil, Trash2, FolderOpen, Coffee, Sandwich, IceCream, Cake, Pizza, Salad, Beer, Wine,
  Utensils, ShoppingBag, Gift, Apple, Cookie, Croissant, Soup, Milk, Egg, Fish, Drumstick, Popcorn,
  Candy, CupSoda, GlassWater, Leaf, Sparkles, Star, Heart, Zap
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

const ICONS = [
  { value: 'Coffee', label: 'Coffee', icon: Coffee },
  { value: 'Sandwich', label: 'Sandwich', icon: Sandwich },
  { value: 'IceCream', label: 'Ice Cream', icon: IceCream },
  { value: 'Cake', label: 'Cake', icon: Cake },
  { value: 'Pizza', label: 'Pizza', icon: Pizza },
  { value: 'Salad', label: 'Salad', icon: Salad },
  { value: 'Beer', label: 'Beer', icon: Beer },
  { value: 'Wine', label: 'Wine', icon: Wine },
  { value: 'Utensils', label: 'Utensils', icon: Utensils },
  { value: 'ShoppingBag', label: 'Shopping Bag', icon: ShoppingBag },
  { value: 'Gift', label: 'Gift', icon: Gift },
  { value: 'Apple', label: 'Apple', icon: Apple },
  { value: 'Cookie', label: 'Cookie', icon: Cookie },
  { value: 'Croissant', label: 'Croissant', icon: Croissant },
  { value: 'Soup', label: 'Soup', icon: Soup },
  { value: 'Milk', label: 'Milk', icon: Milk },
  { value: 'Egg', label: 'Egg', icon: Egg },
  { value: 'Fish', label: 'Fish', icon: Fish },
  { value: 'Drumstick', label: 'Drumstick', icon: Drumstick },
  { value: 'Popcorn', label: 'Popcorn', icon: Popcorn },
  { value: 'Candy', label: 'Candy', icon: Candy },
  { value: 'CupSoda', label: 'Soda', icon: CupSoda },
  { value: 'GlassWater', label: 'Water', icon: GlassWater },
  { value: 'Leaf', label: 'Leaf', icon: Leaf },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Zap', label: 'Zap', icon: Zap },
];

const COLORS = [
  { value: 'category-1', label: 'Blue', class: 'bg-blue-500' },
  { value: 'category-2', label: 'Green', class: 'bg-green-500' },
  { value: 'category-3', label: 'Orange', class: 'bg-orange-500' },
  { value: 'category-4', label: 'Purple', class: 'bg-purple-500' },
  { value: 'category-5', label: 'Red', class: 'bg-red-500' },
];

const getIconComponent = (iconName: string) => {
  const iconData = ICONS.find(i => i.value === iconName);
  return iconData?.icon || Coffee;
};

export function CategoryManagement() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: 'category-1',
    icon: 'Coffee',
    sort_order: 0,
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast({
        title: 'Error loading categories',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      color: 'category-1',
      icon: 'Coffee',
      sort_order: 0,
    });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon,
        sort_order: category.sort_order,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon,
      sort_order: formData.sort_order,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);

      if (error) {
        toast({
          title: 'Error updating category',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Category updated successfully' });
    } else {
      const { error } = await supabase
        .from('categories')
        .insert(categoryData);

      if (error) {
        toast({
          title: 'Error creating category',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Category created successfully' });
    }

    setDialogOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting category',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Category deleted successfully' });
    fetchCategories();
  };

  const getColorClass = (colorValue: string) => {
    return COLORS.find(c => c.value === colorValue)?.class || 'bg-gray-500';
  };

  return (
    <section className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Category Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, or remove product categories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => {
                      const IconComponent = icon.icon;
                      return (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full ${color.class}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No categories found. Add your first category!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full ${getColorClass(category.color)}`} />
                        <span className="text-sm text-muted-foreground capitalize">
                          {COLORS.find(c => c.value === category.color)?.label || category.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"? Products in this category will become uncategorized.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
