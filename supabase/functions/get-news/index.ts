
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
      console.error('NewsAPI key not found');
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
      all: 'weather OR climate OR environment OR technology',
      weather: 'weather OR climate OR meteorology',
      science: 'climate science OR environmental science',
      technology: 'weather technology OR climate tech',
      environment: 'environment OR sustainability OR climate change'
    };

    const query = categoryQueries[category as keyof typeof categoryQueries] || categoryQueries.all;
    
    // Get news from the last 7 days to ensure fresh content
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    const from = fromDate.toISOString().split('T')[0];

    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${from}&sortBy=publishedAt&language=en&page=${page}&pageSize=20&apiKey=${apiKey}`;
    
    console.log('Fetching news with query:', query);
    
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
    
    // Process and filter articles
    const processedArticles = newsData.articles
      .filter((article: any) => 
        article.title && 
        article.description && 
        article.url && 
        article.title !== '[Removed]' &&
        article.description !== '[Removed]'
      )
      .map((article: any, index: number) => ({
        id: `${article.publishedAt}-${index}`,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
        publishedAt: article.publishedAt,
        source: article.source.name,
        category: category === 'all' ? 'general' : category
      }));

    console.log(`News fetched successfully: ${processedArticles.length} articles`);

    return new Response(
      JSON.stringify({
        articles: processedArticles,
        totalResults: newsData.totalResults
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
