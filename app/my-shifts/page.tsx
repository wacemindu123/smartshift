'use client';

import { useMyShifts } from '@/hooks/useShifts';
import { useAttendance } from '@/hooks/useAttendance';
import Layout from '@/components/Layout';
import ShiftCard from '@/components/ShiftCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function MyShifts() {
  const { shifts, isLoading } = useMyShifts();
  const { clockIn, clockOut, isClockingIn, isClockingOut } = useAttendance();
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const requestSwapMutation = useMutation({
    mutationFn: (shiftId: string) => api.post('/shift-swaps', { shiftId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      alert('Shift swap requested!');
    },
  });

  const upcomingShifts = shifts.filter(
    (s) => new Date(s.startTime) >= new Date()
  );
  const pastShifts = shifts.filter(
    (s) => new Date(s.startTime) < new Date()
  );

  const handleClockIn = (shiftId: string) => {
    clockIn({ shiftId });
    setSelectedShift(null);
  };

  const handleClockOut = (shiftId: string) => {
    clockOut({ shiftId });
    setSelectedShift(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Shifts</h1>
          <p className="text-gray-600 mt-1">View and manage your work schedule</p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Upcoming Shifts */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Shifts</h2>
              {upcomingShifts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingShifts.map((shift) => (
                    <div key={shift.id} className="space-y-2">
                      <ShiftCard shift={shift} />
                      
                      {/* Clock In/Out & Swap Actions */}
                      {shift.status === 'PUBLISHED' && (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            {!shift.attendance?.clockIn && (
                              <button
                                onClick={() => handleClockIn(shift.id)}
                                disabled={isClockingIn}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                              >
                                Clock In
                              </button>
                            )}
                            
                            {shift.attendance?.clockIn && !shift.attendance?.clockOut && (
                              <button
                                onClick={() => handleClockOut(shift.id)}
                                disabled={isClockingOut}
                                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                Clock Out
                              </button>
                            )}
                          </div>
                          
                          <button
                            onClick={() => requestSwapMutation.mutate(shift.id)}
                            disabled={requestSwapMutation.isPending}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Request Swap
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No upcoming shifts scheduled</p>
                </div>
              )}
            </div>

            {/* Past Shifts */}
            {pastShifts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Past Shifts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastShifts.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
