
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface NewsFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const NewsFilters = ({ categories, selectedCategory, onCategoryChange }: NewsFiltersProps) => {
  const formatCategoryName = (category: string) => {
    if (category === 'all') return 'All News';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by category:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="text-sm"
          >
            {formatCategoryName(category)}
          </Button>
        ))}
      </div>
    </div>
  );
};
