
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Tag } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useState } from 'react';
import { ArticleModal } from './ArticleModal';

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

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
              <Tag className="w-3 h-3 mr-1" />
              {article.category}
            </span>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <span>{article.source}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-3">
            {article.description}
          </CardDescription>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={(e) => {
              e.stopPropagation();
              window.open(article.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Read Full Article
          </Button>
        </CardContent>
      </Card>

      <ArticleModal
        article={article}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  );
};
