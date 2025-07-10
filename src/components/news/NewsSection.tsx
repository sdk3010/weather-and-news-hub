
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsCard } from './NewsCard';
import { NewsFilters } from './NewsFilters';
import { Newspaper, Filter } from 'lucide-react';

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

  // Mock news data
  useEffect(() => {
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'Record-Breaking Heatwave Hits Europe This Summer',
        description: 'Temperatures soar across European cities as climate experts warn of increasing frequency of extreme weather events.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=250&fit=crop',
        publishedAt: '2024-01-15T10:30:00Z',
        source: 'Weather News',
        category: 'weather'
      },
      {
        id: '2',
        title: 'New Climate Research Shows Changing Precipitation Patterns',
        description: 'Scientists discover significant shifts in rainfall distribution across global regions, affecting agriculture and water resources.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=250&fit=crop',
        publishedAt: '2024-01-14T14:15:00Z',
        source: 'Science Today',
        category: 'science'
      },
      {
        id: '3',
        title: 'Hurricane Season Predictions Released by Weather Service',
        description: 'National weather services issue forecasts for the upcoming hurricane season with advanced tracking technology.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=250&fit=crop',
        publishedAt: '2024-01-13T08:45:00Z',
        source: 'Weather Central',
        category: 'weather'
      },
      {
        id: '4',
        title: 'Tech Innovations in Weather Forecasting Accuracy',
        description: 'AI and machine learning revolutionize weather prediction models, improving accuracy by 25% in recent studies.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=250&fit=crop',
        publishedAt: '2024-01-12T16:20:00Z',
        source: 'Tech Weather',
        category: 'technology'
      },
      {
        id: '5',
        title: 'Global Warming Impact on Local Weather Patterns',
        description: 'New study reveals how climate change is affecting day-to-day weather in urban and rural areas worldwide.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop',
        publishedAt: '2024-01-11T12:00:00Z',
        source: 'Climate Journal',
        category: 'environment'
      },
      {
        id: '6',
        title: 'Winter Storm Preparedness: Essential Safety Tips',
        description: 'Emergency services share crucial information for staying safe during severe winter weather conditions.',
        url: '#',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop',
        publishedAt: '2024-01-10T09:30:00Z',
        source: 'Safety News',
        category: 'weather'
      }
    ];
    setArticles(mockArticles);
    setFilteredArticles(mockArticles);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(article => article.category === selectedCategory));
    }
  }, [selectedCategory, articles]);

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
        onCategoryChange={setSelectedCategory}
      />

      {filteredArticles.length === 0 ? (
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
