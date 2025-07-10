
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface ForecastChartProps {
  data: WeatherData[];
}

export const ForecastChart = ({ data }: ForecastChartProps) => {
  // Transform data for the chart
  const chartData = data[0]?.forecast.map((day, index) => {
    const result: any = {
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    };
    
    data.forEach((cityData) => {
      if (cityData.forecast[index]) {
        result[cityData.city] = cityData.forecast[index].temp;
      }
    });
    
    return result;
  }) || [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Legend />
          {data.map((cityData, index) => (
            <Line
              key={cityData.city}
              type="monotone"
              dataKey={cityData.city}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
