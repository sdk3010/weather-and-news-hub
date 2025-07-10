
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Thermometer, Bell, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface UserPreferencesData {
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  language: string;
}

export const UserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferencesData>({
    temperatureUnit: 'celsius',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 5,
    language: 'en'
  });

  const [loading, setLoading] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        const parsedPreferences = JSON.parse(saved);
        setPreferences(parsedPreferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // Save to localStorage (will be replaced with Supabase)
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferencesData>(
    key: K,
    value: UserPreferencesData[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          <Settings className="h-8 w-8" />
          <span>User Preferences</span>
        </h2>
        <p className="text-muted-foreground">
          Customize your weather and news experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5" />
              <span>Weather Settings</span>
            </CardTitle>
            <CardDescription>
              Configure how weather information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="temperature-unit">Temperature Unit</Label>
              <Select
                value={preferences.temperatureUnit}
                onValueChange={(value: 'celsius' | 'fahrenheit') =>
                  updatePreference('temperatureUnit', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh-interval">Auto-refresh Interval</Label>
              <Select
                value={preferences.refreshInterval.toString()}
                onValueChange={(value) =>
                  updatePreference('refreshInterval', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-refresh">Auto-refresh Weather</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update weather data
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={preferences.autoRefresh}
                onCheckedChange={(checked) =>
                  updatePreference('autoRefresh', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Settings</span>
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weather alerts and updates
                </p>
              </div>
              <Switch
                id="notifications"
                checked={preferences.notifications}
                onCheckedChange={(checked) =>
                  updatePreference('notifications', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => updatePreference('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
