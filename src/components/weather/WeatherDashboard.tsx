
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeatherCard } from './WeatherCard';
import { ForecastChart } from './ForecastChart';
import { AddCityDialog } from './AddCityDialog';
import { Plus, MapPin, Thermometer } from 'lucide-react';
import { toast } from 'sonner';

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

  // Mock data for demonstration
  useEffect(() => {
    const mockWeatherData: WeatherData[] = [
      {
        city: 'New York',
        temperature: 22,
        description: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8.5,
        icon: '02d',
        forecast: [
          { date: '2024-01-15', temp: 23, description: 'Sunny', icon: '01d' },
          { date: '2024-01-16', temp: 21, description: 'Cloudy', icon: '03d' },
          { date: '2024-01-17', temp: 19, description: 'Rainy', icon: '09d' },
          { date: '2024-01-18', temp: 25, description: 'Sunny', icon: '01d' },
          { date: '2024-01-19', temp: 24, description: 'Partly Cloudy', icon: '02d' },
          { date: '2024-01-20', temp: 22, description: 'Cloudy', icon: '03d' },
          { date: '2024-01-21', temp: 20, description: 'Rainy', icon: '09d' },
        ]
      },
      {
        city: 'London',
        temperature: 15,
        description: 'Rainy',
        humidity: 78,
        windSpeed: 12.3,
        icon: '09d',
        forecast: [
          { date: '2024-01-15', temp: 16, description: 'Rainy', icon: '09d' },
          { date: '2024-01-16', temp: 14, description: 'Cloudy', icon: '03d' },
          { date: '2024-01-17', temp: 13, description: 'Rainy', icon: '09d' },
          { date: '2024-01-18', temp: 17, description: 'Partly Cloudy', icon: '02d' },
          { date: '2024-01-19', temp: 18, description: 'Sunny', icon: '01d' },
          { date: '2024-01-20', temp: 16, description: 'Cloudy', icon: '03d' },
          { date: '2024-01-21', temp: 15, description: 'Rainy', icon: '09d' },
        ]
      }
    ];
    setWeatherData(mockWeatherData);
  }, []);

  const handleAddCity = (city: string) => {
    // This will be replaced with actual API call
    toast.success(`Added ${city} to your favorite cities`);
    setShowAddCity(false);
  };

  const handleRemoveCity = (city: string) => {
    setWeatherData(prev => prev.filter(data => data.city !== city));
    toast.success(`Removed ${city} from your favorite cities`);
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
