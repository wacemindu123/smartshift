'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Clock, Calendar, Check, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

interface AvailabilitySlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  available: boolean;
}

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DEFAULT_AVAILABILITY: Record<DayOfWeek, AvailabilitySlot> = {
  MONDAY: { day: 'MONDAY', startTime: '09:00', endTime: '17:00', available: true },
  TUESDAY: { day: 'TUESDAY', startTime: '09:00', endTime: '17:00', available: true },
  WEDNESDAY: { day: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', available: true },
  THURSDAY: { day: 'THURSDAY', startTime: '09:00', endTime: '17:00', available: true },
  FRIDAY: { day: 'FRIDAY', startTime: '09:00', endTime: '17:00', available: true },
  SATURDAY: { day: 'SATURDAY', startTime: '09:00', endTime: '17:00', available: false },
  SUNDAY: { day: 'SUNDAY', startTime: '09:00', endTime: '17:00', available: false },
};

export default function AvailabilityPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  // Check if this is first-time setup (no availability set yet)
  const isFirstTimeSetup = !user?.availability;

  // Initialize with default or user's current availability
  const [availability, setAvailability] = useState<Record<DayOfWeek, AvailabilitySlot>>(
    user?.availability || DEFAULT_AVAILABILITY
  );

  useEffect(() => {
    if (user?.availability) {
      setAvailability(user.availability);
    }
  }, [user]);

  // First-time setup mutation (direct update)
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: Record<DayOfWeek, AvailabilitySlot>) => {
      const response = await api.patch(`/users/${user?.id}`, {
        availability: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      toast.success('Availability set successfully!');
    },
    onError: () => {
      toast.error('Failed to set availability');
    },
  });

  // Change request mutation (requires manager approval)
  const requestChangeMutation = useMutation({
    mutationFn: async ({ requestedChanges, reason }: { requestedChanges: Record<DayOfWeek, AvailabilitySlot>, reason: string }) => {
      const response = await api.post('/availability-changes', {
        requestedChanges,
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      setShowChangeRequestModal(false);
      setChangeReason('');
      setAvailability(user?.availability || DEFAULT_AVAILABILITY); // Reset to current
      toast.success('Change request submitted! Waiting for manager approval.');
    },
    onError: () => {
      toast.error('Failed to submit change request');
    },
  });

  const handleToggleDay = (day: DayOfWeek) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
      },
    }));
  };

  const handleTimeChange = (day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    if (isFirstTimeSetup) {
      // First-time setup - save directly
      updateAvailabilityMutation.mutate(availability);
    } else {
      // Already has availability - show change request modal
      setShowChangeRequestModal(true);
    }
  };

  const handleSubmitChangeRequest = () => {
    if (!changeReason.trim()) {
      toast.error('Please provide a reason for the change');
      return;
    }
    requestChangeMutation.mutate({ requestedChanges: availability, reason: changeReason });
  };

  const handleSetAllDays = (available: boolean) => {
    const updated = { ...availability };
    DAYS.forEach((day) => {
      updated[day] = { ...updated[day], available };
    });
    setAvailability(updated);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
          <p className="text-gray-600 mt-1">
            Set your preferred work schedule so managers know when you're available
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSetAllDays(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Available All Days
              </button>
              <button
                onClick={() => handleSetAllDays(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day}
                className={`border rounded-lg p-4 transition-colors ${
                  availability[day].available
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Day Toggle */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleDay(day)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        availability[day].available
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {availability[day].available && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <span className="font-medium text-gray-900 w-24">
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Time Inputs */}
                  {availability[day].available && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={availability[day].startTime}
                          onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={availability[day].endTime}
                          onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {!availability[day].available && (
                    <span className="text-sm text-gray-500">Not available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateAvailabilityMutation.isPending}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        {/* Info Box */}
        <div className={`border rounded-lg p-4 ${isFirstTimeSetup ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start space-x-3">
            {isFirstTimeSetup ? (
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            )}
            <div className="text-sm">
              {isFirstTimeSetup ? (
                <>
                  <p className="font-medium mb-1 text-blue-900">First Time Setup:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Check the days you're available to work</li>
                    <li>Set your preferred start and end times for each day</li>
                    <li>Managers will see your availability when creating shifts</li>
                    <li>After initial setup, changes require manager approval</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1 text-yellow-900">Request Availability Change:</p>
                  <p className="text-yellow-800">
                    Your availability is already set. Any changes will be sent to your manager for approval.
                    You'll be notified once they review your request.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Request Modal */}
      {showChangeRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Availability Change
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Your changes will be sent to your manager for approval. Please provide a reason for this change.
              </p>

              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g., Need to adjust schedule for school classes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowChangeRequestModal(false);
                    setChangeReason('');
                    setAvailability(user?.availability || DEFAULT_AVAILABILITY);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitChangeRequest}
                  disabled={requestChangeMutation.isPending || !changeReason.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {requestChangeMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
