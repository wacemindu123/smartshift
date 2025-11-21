'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Settings as SettingsIcon, Save, Users, Clock, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

interface BusinessSettings {
  // Capacity Settings
  maxStaffCapacity: number;
  optimalStaffMin: number;
  optimalStaffMax: number;
  
  // Area-specific limits
  maxFrontOfHouse: number;
  maxBackOfHouse: number;
  
  // Hours
  standardOpenTime: string;
  standardCloseTime: string;
  
  // Labor costs (optional)
  averageHourlyWage: number;
  overtimeThreshold: number;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  maxStaffCapacity: 7,
  optimalStaffMin: 5,
  optimalStaffMax: 7,
  maxFrontOfHouse: 3,
  maxBackOfHouse: 4,
  standardOpenTime: '07:00',
  standardCloseTime: '15:00',
  averageHourlyWage: 15,
  overtimeThreshold: 40,
};

export default function SettingsPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { isOperator, user } = useAuthUser();
  
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current settings
  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      try {
        const response = await api.get('/settings/business');
        return response.data;
      } catch (error) {
        // If no settings exist, return defaults
        return DEFAULT_SETTINGS;
      }
    },
    enabled: isOperator,
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: BusinessSettings) => {
      const response = await api.post('/settings/business', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  const handleChange = (field: keyof BusinessSettings, value: number | string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validation
    if (settings.optimalStaffMin > settings.optimalStaffMax) {
      toast.error('Optimal minimum cannot be greater than optimal maximum');
      return;
    }
    if (settings.optimalStaffMax > settings.maxStaffCapacity) {
      toast.error('Optimal maximum cannot exceed max capacity');
      return;
    }
    
    saveSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings(savedSettings || DEFAULT_SETTINGS);
    setHasChanges(false);
  };

  if (!isOperator) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Manager access required</p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
            <p className="text-gray-600 mt-1">Configure capacity limits and operational parameters</p>
          </div>
          
          {hasChanges && (
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saveSettingsMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Capacity Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Capacity Limits</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Staff Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxStaffCapacity}
                  onChange={(e) => handleChange('maxStaffCapacity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum before overcrowding
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optimal Staff (Min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.optimalStaffMin}
                  onChange={(e) => handleChange('optimalStaffMin', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum for optimal operation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optimal Staff (Max)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.optimalStaffMax}
                  onChange={(e) => handleChange('optimalStaffMax', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum for optimal operation
                </p>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Capacity Ranges:</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="h-8 bg-gradient-to-r from-red-200 via-yellow-200 via-green-200 to-red-200 rounded-lg relative">
                    <div 
                      className="absolute top-0 bottom-0 bg-green-500 opacity-30 rounded-lg"
                      style={{
                        left: `${(settings.optimalStaffMin / settings.maxStaffCapacity) * 100}%`,
                        right: `${100 - (settings.optimalStaffMax / settings.maxStaffCapacity) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0</span>
                    <span className="text-green-600 font-medium">
                      {settings.optimalStaffMin}-{settings.optimalStaffMax} (Optimal)
                    </span>
                    <span className="text-red-600 font-medium">
                      {settings.maxStaffCapacity}+ (Over)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Area-Specific Limits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Area-Specific Limits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Front of House Staff
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.maxFrontOfHouse}
                onChange={(e) => handleChange('maxFrontOfHouse', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Barista, Register, Manager
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Back of House Staff
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.maxBackOfHouse}
                onChange={(e) => handleChange('maxBackOfHouse', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kitchen, Prep, Dishes
              </p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Standard Operating Hours</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time
              </label>
              <input
                type="time"
                value={settings.standardOpenTime}
                onChange={(e) => handleChange('standardOpenTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time
              </label>
              <input
                type="time"
                value={settings.standardCloseTime}
                onChange={(e) => handleChange('standardCloseTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Labor Cost Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold">Labor Cost Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Hourly Wage ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={settings.averageHourlyWage}
                onChange={(e) => handleChange('averageHourlyWage', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for labor cost calculations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overtime Threshold (hours/week)
              </label>
              <input
                type="number"
                min="0"
                value={settings.overtimeThreshold}
                onChange={(e) => handleChange('overtimeThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hours before overtime pay applies
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SettingsIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">These settings affect:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Capacity Management page alerts and thresholds</li>
                <li>Schedule creation warnings</li>
                <li>Labor cost calculations (coming soon)</li>
                <li>Optimal staffing recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
