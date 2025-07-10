
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsCard } from './NewsCard';
import { NewsFilters } from './NewsFilters';
import { Newspaper, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const NewsSection = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const categories = ['all', 'weather', 'science', 'technology', 'environment'];

  // Fetch news articles
  const fetchNews = async (category: string = 'all') => {
    setLoading(true);
    try {
      console.log('Fetching news for category:', category);
      
      const response = await supabase.functions.invoke('get-news', {
        body: { category, page: 1 }
      });

      if (response.error) {
        console.error('Error fetching news:', response.error);
        toast.error('Failed to fetch news articles');
        return;
      }

      const newsData = response.data;
      console.log('News fetched successfully:', newsData.articles.length, 'articles');
      
      setArticles(newsData.articles || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news articles');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNews(selectedCategory);
  }, []);

  // Filter articles when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => 
        article.category === selectedCategory || 
        article.title.toLowerCase().includes(selectedCategory) ||
        article.description.toLowerCase().includes(selectedCategory)
      );
      setFilteredArticles(filtered);
    }
  }, [selectedCategory, articles]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchNews(category);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Newspaper className="h-8 w-8" />
            <span>Latest News</span>
          </h2>
          <p className="text-muted-foreground">
            Stay updated with weather and climate-related news
          </p>
        </div>
      </div>

      <NewsFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading latest news...</p>
          </CardContent>
        </Card>
      ) : filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};
