
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const UserPreferences = () => {
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return null;
      }

      return data;
    }
  });

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setTemperatureUnit(preferences.temperature_unit);
      setAutoRefreshInterval(preferences.auto_refresh_interval);
      setNotificationsEnabled(preferences.notifications_enabled);
      setLanguage(preferences.language);
    }
  }, [preferences]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const preferenceData = {
        user_id: user.id,
        temperature_unit: temperatureUnit,
        auto_refresh_interval: autoRefreshInterval,
        notifications_enabled: notificationsEnabled,
        language: language,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast.success('Preferences saved successfully');
    },
    onError: (error: any) => {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  });

  const handleSavePreferences = () => {
    savePreferencesMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>User Preferences</span>
        </CardTitle>
        <CardDescription>
          Customize your weather dashboard experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="temperature-unit">Temperature Unit</Label>
            <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select temperature unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh-interval">Auto Refresh Interval</Label>
            <Select value={autoRefreshInterval.toString()} onValueChange={(value) => setAutoRefreshInterval(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select refresh interval" />
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

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about weather alerts
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSavePreferences}
            disabled={savePreferencesMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
