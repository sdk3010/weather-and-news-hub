
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeatherCard } from './WeatherCard';
import { ForecastChart } from './ForecastChart';
import { AddCityDialog } from './AddCityDialog';
import { Plus, MapPin, Thermometer } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: {
    date: string;
    temp: number;
    description: string;
    icon: string;
  }[];
}

export const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCity, setShowAddCity] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Get user and load favorite cities
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadFavoriteCities(user.id);
      }
    };
    getUser();
  }, []);

  const loadFavoriteCities = async (userId: string) => {
    try {
      setLoading(true);
      const { data: favoriteCities, error } = await supabase
        .from('favorite_cities')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (favoriteCities && favoriteCities.length > 0) {
        const weatherPromises = favoriteCities.map(city => fetchWeatherData(city.city_name));
        const weatherResults = await Promise.all(weatherPromises);
        setWeatherData(weatherResults.filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading favorite cities:', error);
      toast.error('Failed to load favorite cities');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (city: string): Promise<WeatherData | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { city }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return null;
    }
  };

  const handleAddCity = async (city: string) => {
    if (!user) {
      toast.error('Please sign in to add cities');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch weather data first to validate the city
      const weatherData = await fetchWeatherData(city);
      if (!weatherData) {
        toast.error('City not found. Please check the spelling and try again.');
        return;
      }

      // Save to favorite cities
      const { error } = await supabase
        .from('favorite_cities')
        .insert({
          user_id: user.id,
          city_name: weatherData.city,
          country: null, // We can enhance this later
          latitude: null,
          longitude: null
        });

      if (error) throw error;

      // Add to current weather data
      setWeatherData(prev => [...prev, weatherData]);
      toast.success(`Added ${weatherData.city} to your favorite cities`);
      setShowAddCity(false);
    } catch (error) {
      console.error('Error adding city:', error);
      toast.error('Failed to add city');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCity = async (city: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorite_cities')
        .delete()
        .eq('user_id', user.id)
        .eq('city_name', city);

      if (error) throw error;

      setWeatherData(prev => prev.filter(data => data.city !== city));
      toast.success(`Removed ${city} from your favorite cities`);
    } catch (error) {
      console.error('Error removing city:', error);
      toast.error('Failed to remove city');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weather Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time weather information for your favorite cities
          </p>
        </div>
        <Button onClick={() => setShowAddCity(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add City</span>
        </Button>
      </div>

      {weatherData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cities added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your favorite cities to see their weather information
            </p>
            <Button onClick={() => setShowAddCity(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First City
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weatherData.map((data, index) => (
              <WeatherCard
                key={index}
                data={data}
                onRemove={() => handleRemoveCity(data.city)}
              />
            ))}
          </div>

          {weatherData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5" />
                  <span>7-Day Forecast</span>
                </CardTitle>
                <CardDescription>
                  Temperature trends for your favorite cities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ForecastChart data={weatherData} />
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AddCityDialog
        open={showAddCity}
        onOpenChange={setShowAddCity}
        onAddCity={handleAddCity}
      />
    </div>
  );
};
