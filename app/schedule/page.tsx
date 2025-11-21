'use client';

import { useState } from 'react';
import { useShifts } from '@/hooks/useShifts';
import { useAuthUser } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import CreateShiftModal from '@/components/CreateShiftModal';
import { getWeekStart, getWeekEnd, formatDate } from '@/shared/utils';
import { ChevronLeft, ChevronRight, Plus, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import ShiftCard from '@/components/ShiftCard';
import { useApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export default function Schedule() {
  const { isOperator } = useAuthUser();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingShiftId, setDeletingShiftId] = useState<string | null>(null);
  const api = useApi();
  const queryClient = useQueryClient();
  
  const weekStart = getWeekStart(currentWeek);
  const weekEnd = getWeekEnd(currentWeek);
  
  const { shifts, isLoading, publishShifts } = useShifts(weekStart, weekEnd);

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      await api.delete(`/shifts/${shiftId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift deleted and employee notified');
      setDeletingShiftId(null);
    },
    onError: () => {
      toast.error('Failed to delete shift');
      setDeletingShiftId(null);
    },
  });

  const handleDeleteShift = (shiftId: string) => {
    if (window.confirm('Are you sure you want to delete this shift? The employee will be notified.')) {
      setDeletingShiftId(shiftId);
      deleteShiftMutation.mutate(shiftId);
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const handlePublishSchedule = () => {
    const draftShifts = shifts.filter((s) => s.status === 'DRAFT');
    if (draftShifts.length > 0) {
      publishShifts(draftShifts.map((s) => s.id));
    }
  };

  // Group shifts by day
  const shiftsByDay: Record<string, typeof shifts> = {};
  const daysOfWeek = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayKey = formatDate(day, 'YYYY-MM-DD');
    daysOfWeek.push({ date: day, key: dayKey });
    shiftsByDay[dayKey] = [];
  }

  shifts.forEach((shift) => {
    const dayKey = formatDate(shift.startTime, 'YYYY-MM-DD');
    if (shiftsByDay[dayKey]) {
      shiftsByDay[dayKey].push(shift);
    }
  });

  const draftShiftsCount = shifts.filter((s) => s.status === 'DRAFT').length;

  // Calculate weekly hours per employee
  const calculateWeeklyHours = () => {
    const hoursByEmployee: Record<string, { name: string; hours: number; shifts: number }> = {};
    
    shifts.forEach((shift: any) => {
      if (!shift.user) return;
      
      const userId = shift.user.id;
      const startTime = new Date(shift.startTime);
      const endTime = new Date(shift.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (!hoursByEmployee[userId]) {
        hoursByEmployee[userId] = {
          name: shift.user.name,
          hours: 0,
          shifts: 0,
        };
      }
      
      hoursByEmployee[userId].hours += hours;
      hoursByEmployee[userId].shifts += 1;
    });
    
    return hoursByEmployee;
  };

  const weeklyHours = calculateWeeklyHours();
  const overworkedEmployees = Object.entries(weeklyHours).filter(([_, data]) => data.hours > 40);

  if (!isOperator) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600 mt-1">Create and manage employee schedules</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Shift</span>
          </button>
        </div>

        {/* Overwork Warning */}
        {overworkedEmployees.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Employees Over 40 Hours
                </h3>
                <div className="space-y-1">
                  {overworkedEmployees.map(([userId, data]) => (
                    <p key={userId} className="text-sm text-yellow-800">
                      <span className="font-medium">{data.name}:</span> {data.hours.toFixed(1)} hours 
                      ({data.shifts} shifts) - {(data.hours - 40).toFixed(1)} hours over limit
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {formatDate(weekStart, 'MMM D')} - {formatDate(weekEnd, 'MMM D, YYYY')}
              </h2>
              <button
                onClick={goToCurrentWeek}
                className="text-sm text-primary-600 hover:text-primary-700 mt-1"
              >
                Today
              </button>
            </div>

            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {draftShiftsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {draftShiftsCount} draft shift{draftShiftsCount !== 1 ? 's' : ''} ready to publish
              </p>
              <button
                onClick={handlePublishSchedule}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Publish Schedule
              </button>
            </div>
          )}
        </div>

        {/* Schedule Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {daysOfWeek.map(({ date, key }) => (
              <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {formatDate(date, 'ddd')}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(date, 'MMM D')}</p>
                </div>

                <div className="space-y-2">
                  {shiftsByDay[key].length > 0 ? (
                    shiftsByDay[key].map((shift: any) => (
                      <div
                        key={shift.id}
                        className="bg-gray-50 rounded p-2 text-xs border border-gray-200 hover:border-primary-300 transition-colors group relative"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900">{shift.role?.name}</span>
                          <div className="flex items-center gap-1">
                            {shift.status === 'PUBLISHED' && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                PUB
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShift(shift.id);
                              }}
                              disabled={deletingShiftId === shift.id}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                              title="Delete shift"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-600 mb-1">
                          {new Date(shift.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}{' '}
                          -{' '}
                          {new Date(shift.endTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </div>
                        <div className="text-gray-700 font-medium truncate">
                          {shift.user?.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No shifts</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly Hours Summary */}
        {Object.keys(weeklyHours).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Hours Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(weeklyHours)
                .sort(([, a], [, b]) => b.hours - a.hours)
                .map(([userId, data]) => (
                  <div
                    key={userId}
                    className={`border rounded-lg p-4 ${
                      data.hours > 40
                        ? 'border-yellow-300 bg-yellow-50'
                        : data.hours > 35
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{data.name}</span>
                      {data.hours > 40 && (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">{data.hours.toFixed(1)}</span> hours
                      </p>
                      <p className="text-xs text-gray-500">{data.shifts} shifts</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <CreateShiftModal onClose={() => setShowCreateModal(false)} />
      )}
    </Layout>
  );
}
