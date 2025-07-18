const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'general' } = await req.json();
    
    const apiKey = Deno.env.get('NEWS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'News API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching news for category: ${category}`);

    // Use NewsAPI.org
    const categoryMap: { [key: string]: string } = {
      'all': 'general',
      'weather': 'science',
      'science': 'science',
      'technology': 'technology',
      'environment': 'science'
    };

    const newsCategory = categoryMap[category] || 'general';
    const url = `https://newsapi.org/v2/top-headlines?category=${newsCategory}&country=us&apiKey=${apiKey}&pageSize=20`;

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`News API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.articles?.length || 0} articles`);

    if (!data.articles) {
      return new Response(
        JSON.stringify([]),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const articles: NewsArticle[] = data.articles
      .filter((article: any) => article.title && article.description && article.title !== '[Removed]')
      .map((article: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: article.title,
        description: article.description || '',
        url: article.url || '#',
        imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source?.name || 'Unknown',
        category: category
      }));

    console.log(`Processed ${articles.length} articles`);

    return new Response(
      JSON.stringify(articles),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-news function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch news data',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});