
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Wind, X } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface WeatherCardProps {
  data: WeatherData;
  onRemove: () => void;
}

export const WeatherCard = ({ data, onRemove }: WeatherCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{data.city}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{data.temperature}°C</div>
            <div className="text-sm text-muted-foreground capitalize">
              {data.description}
            </div>
          </div>
          <div className="text-6xl opacity-20">
            🌤️
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{data.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">{data.windSpeed} km/h</div>
              <div className="text-xs text-muted-foreground">Wind Speed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
