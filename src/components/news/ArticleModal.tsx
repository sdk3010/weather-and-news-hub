
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Tag, X } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  category: string;
}

interface ArticleModalProps {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ArticleModal = ({ article, open, onOpenChange }: ArticleModalProps) => {
  if (!article) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      weather: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      science: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      environment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-bold leading-tight pr-8">
              {article.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              <span>{article.source}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                <Tag className="w-3 h-3 mr-1" />
                {article.category}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <AspectRatio ratio={16 / 9}>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="object-cover w-full h-full rounded-lg"
            />
          </AspectRatio>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed">{article.description}</p>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Click below to read the full article on {article.source}
            </p>
            <Button asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Full Article
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
