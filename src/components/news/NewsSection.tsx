
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsCard } from './NewsCard';
import { NewsFilters } from './NewsFilters';
import { Newspaper, Filter } from 'lucide-react';
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

  // Load news data
  useEffect(() => {
    fetchNews(selectedCategory);
  }, []);

  const fetchNews = async (category: string) => {
    try {
      setLoading(true);
      console.log(`Fetching news for category: ${category}`);
      
      const { data, error } = await supabase.functions.invoke('get-news', {
        body: { category }
      });

      if (error) throw error;

      console.log('Received data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));

      if (data && Array.isArray(data)) {
        console.log('Processing as array with length:', data.length);
        setArticles(data);
        setFilteredArticles(data);
      } else if (data && data.articles && Array.isArray(data.articles)) {
        console.log('Processing as object with articles array, length:', data.articles.length);
        setArticles(data.articles);
        setFilteredArticles(data.articles);
      } else {
        console.warn('No articles received, data:', data);
        setArticles([]);
        setFilteredArticles([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to load news articles');
      setArticles([]);
      setFilteredArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === selectedCategory));
    }
  }, [selectedCategory, articles]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchNews(category);
  };

  const categories = ['all', 'weather', 'science', 'technology', 'environment'];

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading news articles...</p>
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
