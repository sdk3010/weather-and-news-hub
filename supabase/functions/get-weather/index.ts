
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
    const { city } = await req.json();
    
    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      console.error('OpenWeather API key not found');
      return new Response(
        JSON.stringify({ error: 'Weather service unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (!currentResponse.ok) {
      const errorData = await currentResponse.json();
      console.error('OpenWeather API error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.message || 'City not found' }),
        { 
          status: currentResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const currentWeather = await currentResponse.json();
    
    // Get 7-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Process forecast data (get daily forecasts)
    const dailyForecasts = [];
    const processedDates = new Set();
    
    for (const item of forecastData.list.slice(0, 35)) { // Next 5 days
      const date = new Date(item.dt * 1000).toDateString();
      if (!processedDates.has(date)) {
        processedDates.add(date);
        dailyForecasts.push({
          date: item.dt_txt.split(' ')[0],
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon
        });
      }
    }

    const weatherData = {
      city: currentWeather.name,
      temperature: Math.round(currentWeather.main.temp),
      description: currentWeather.weather[0].description,
      humidity: currentWeather.main.humidity,
      windSpeed: currentWeather.wind.speed,
      icon: currentWeather.weather[0].icon,
      forecast: dailyForecasts.slice(0, 7)
    };

    console.log('Weather data fetched successfully for:', city);

    return new Response(
      JSON.stringify(weatherData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
