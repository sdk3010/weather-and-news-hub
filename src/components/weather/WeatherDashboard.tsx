
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeatherCard } from './WeatherCard';
import { ForecastChart } from './ForecastChart';
import { AddCityDialog } from './AddCityDialog';
import { Plus, MapPin, Thermometer } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const [showAddCity, setShowAddCity] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const queryClient = useQueryClient();

  // Fetch user's favorite cities
  const { data: favoriteCities = [] } = useQuery({
    queryKey: ['favoriteCities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorite_cities')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching favorite cities:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Add city mutation
  const addCityMutation = useMutation({
    mutationFn: async (cityName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, get weather data to validate the city
      const response = await supabase.functions.invoke('get-weather', {
        body: { city: cityName }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch weather data');
      }

      const weatherInfo = response.data;

      // Add to favorite cities
      const { error } = await supabase
        .from('favorite_cities')
        .insert({
          user_id: user.id,
          city_name: weatherInfo.city,
          country: null,
          latitude: null,
          longitude: null
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('City already exists in your favorites');
        }
        throw error;
      }

      return weatherInfo;
    },
    onSuccess: (weatherInfo, cityName) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteCities'] });
      toast.success(`Added ${cityName} to your favorite cities`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add city');
    }
  });

  // Remove city mutation
  const removeCityMutation = useMutation({
    mutationFn: async (cityName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorite_cities')
        .delete()
        .eq('user_id', user.id)
        .eq('city_name', cityName);

      if (error) throw error;
    },
    onSuccess: (_, cityName) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteCities'] });
      setWeatherData(prev => prev.filter(data => data.city !== cityName));
      toast.success(`Removed ${cityName} from your favorite cities`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove city');
    }
  });

  // Fetch weather data for favorite cities
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (favoriteCities.length === 0) {
        setWeatherData([]);
        return;
      }

      console.log('Fetching weather for cities:', favoriteCities.map(c => c.city_name));
      
      const weatherPromises = favoriteCities.map(async (city) => {
        try {
          const response = await supabase.functions.invoke('get-weather', {
            body: { city: city.city_name }
          });

          if (response.error) {
            console.error(`Error fetching weather for ${city.city_name}:`, response.error);
            return null;
          }

          return response.data as WeatherData;
        } catch (error) {
          console.error(`Error fetching weather for ${city.city_name}:`, error);
          return null;
        }
      });

      const results = await Promise.all(weatherPromises);
      const validResults = results.filter((result): result is WeatherData => result !== null);
      setWeatherData(validResults);
    };

    fetchWeatherData();
  }, [favoriteCities]);

  const handleAddCity = (city: string) => {
    addCityMutation.mutate(city);
    setShowAddCity(false);
  };

  const handleRemoveCity = (city: string) => {
    removeCityMutation.mutate(city);
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
                key={`${data.city}-${index}`}
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
