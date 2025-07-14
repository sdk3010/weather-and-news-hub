
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'weather', page = 1 } = await req.json();
    
    const apiKey = Deno.env.get('NEWS_API_KEY');
    if (!apiKey) {
      console.error('Newsdata API key not found');
      return new Response(
        JSON.stringify({ error: 'News service unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Define search queries for different categories
    const categoryQueries = {
      all: 'weather,climate,environment,technology',
      weather: 'weather,climate,meteorology',
      science: 'science,climate,environment',
      technology: 'technology,innovation,tech',
      environment: 'environment,sustainability,climate'
    };

    const query = categoryQueries[category as keyof typeof categoryQueries] || categoryQueries.all;
    
    // Newsdata API parameters - fetch from multiple countries
    const countries = 'us,gb,ca,au,de,fr,in,jp'; // Multiple countries for diverse news
    const newsUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&country=${countries}&language=en&size=20&page=${page}`;
    
    console.log('Fetching news with query:', query, 'from countries:', countries);
    
    const response = await fetch(newsUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('NewsAPI error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.message || 'Failed to fetch news' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const newsData = await response.json();
    
    // Process and filter articles (Newsdata API uses 'results' instead of 'articles')
    const articles = newsData.results || [];
    const processedArticles = articles
      .filter((article: any) => 
        article.title && 
        article.description && 
        article.link && 
        article.title !== '[Removed]' &&
        article.description !== '[Removed]'
      )
      .map((article: any, index: number) => ({
        id: `${article.pubDate}-${index}`,
        title: article.title,
        description: article.description,
        url: article.link,
        imageUrl: article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
        publishedAt: article.pubDate,
        source: article.source_id || 'Unknown',
        category: category === 'all' ? 'general' : category,
        country: article.country?.[0] || 'global'
      }));

    console.log(`News fetched successfully: ${processedArticles.length} articles from ${countries}`);

    return new Response(
      JSON.stringify({
        articles: processedArticles,
        totalResults: newsData.totalResults || processedArticles.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-news function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
