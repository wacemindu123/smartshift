'use client';

import { useAuthUser } from '@/hooks/useAuth';
import { useNextShift } from '@/hooks/useShifts';
import { useTodayAttendance } from '@/hooks/useAttendance';
import { useNotifications } from '@/hooks/useNotifications';
import Layout from '@/components/Layout';
import ShiftCard from '@/components/ShiftCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import { Calendar, Clock, Bell, Users } from 'lucide-react';
import Link from 'next/link';
import { useAttendance } from '@/hooks/useAttendance';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import EmployeeOnboarding from '@/components/onboarding/EmployeeOnboarding';
import ManagerOnboarding from '@/components/onboarding/ManagerOnboarding';

export default function Dashboard() {
  const { user, isOperator, isLoading: userLoading } = useAuthUser();
  const { shift: nextShift, isLoading: shiftLoading } = useNextShift();
  const { shifts: todayShifts, isLoading: attendanceLoading } = useTodayAttendance();
  const { unreadCount } = useNotifications();
  const { clockIn, clockOut, isClockingIn, isClockingOut } = useAttendance();
  const router = useRouter();
  const { shouldShowOnboarding, completeOnboarding, skipOnboarding, progress, isLoading: onboardingLoading } = useOnboarding();
  
  // Debug logging
  console.log('Onboarding state:', { shouldShowOnboarding, progress, onboardingLoading, isOperator });

  // Fetch week's shifts for calendar (for both managers and employees)
  const { data: weekShifts = [] } = useQuery({
    queryKey: ['week-shifts'],
    queryFn: async () => {
      // Get current week's date range
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      
      const response = await api.get('/shifts', {
        params: {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
        },
      });
      return response.data;
    },
    enabled: !!user, // Fetch for all logged-in users
  });

  if (userLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const handleClockIn = () => {
    if (nextShift) {
      clockIn({ shiftId: nextShift.id });
    }
  };

  const handleClockOut = () => {
    if (nextShift) {
      clockOut({ shiftId: nextShift.id });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isOperator ? 'Manage your team and schedules' : 'View your shifts and clock in/out'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <Bell className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          {isOperator && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Shifts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayShifts.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On Shift Now</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayShifts.filter((s: any) => s.attendance?.status === 'ON_SHIFT').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Employee View: Next Shift */}
        {!isOperator && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Next Shift</h2>
            {shiftLoading ? (
              <LoadingSpinner />
            ) : nextShift ? (
              <div className="space-y-4">
                <ShiftCard shift={nextShift} />
                
                {/* Clock In/Out Buttons */}
                <div className="flex space-x-4">
                  {!nextShift.attendance?.clockIn && (
                    <button
                      onClick={handleClockIn}
                      disabled={isClockingIn}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isClockingIn ? 'Clocking In...' : 'Clock In'}
                    </button>
                  )}
                  
                  {nextShift.attendance?.clockIn && !nextShift.attendance?.clockOut && (
                    <button
                      onClick={handleClockOut}
                      disabled={isClockingOut}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isClockingOut ? 'Clocking Out...' : 'Clock Out'}
                    </button>
                  )}
                </div>

                <Link
                  href="/my-shifts"
                  className="block text-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Shifts →
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No upcoming shifts scheduled
              </p>
            )}
          </div>
        )}

        {/* Employee View: Weekly Schedule & Hours */}
        {!isOperator && (
          <>
            {/* Weekly Hours Summary */}
            {(() => {
              const myShifts = weekShifts.filter((s: any) => s.user?.id === user?.id);
              const totalHours = myShifts.reduce((sum: number, shift: any) => {
                const start = new Date(shift.startTime);
                const end = new Date(shift.endTime);
                return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              }, 0);

              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">This Week</h2>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className={`text-2xl font-bold ${totalHours > 40 ? 'text-yellow-600' : 'text-primary-600'}`}>
                        {totalHours.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {/* Weekly Calendar - Desktop Grid */}
                  <div className="hidden sm:grid grid-cols-7 gap-2">
                    {(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      
                      return Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        const dayShifts = myShifts.filter((s: any) => 
                          s.startTime.startsWith(dateStr)
                        );
                        const isToday = date.toDateString() === today.toDateString();

                        return (
                          <div
                            key={i}
                            className={`border rounded-lg p-2 ${
                              isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="text-center mb-1">
                              <p className="text-xs font-medium text-gray-600">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </p>
                              <p className={`text-sm font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                                {date.getDate()}
                              </p>
                            </div>
                            {dayShifts.length > 0 ? (
                              <div className="space-y-1">
                                {dayShifts.map((shift: any) => (
                                  <div
                                    key={shift.id}
                                    className="bg-primary-100 rounded px-1 py-0.5 text-[10px] text-primary-800 font-medium"
                                  >
                                    {new Date(shift.startTime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400 text-center">Off</p>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Weekly Calendar - Mobile List */}
                  <div className="sm:hidden space-y-2">
                    {(() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay());
                      
                      return Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        const dayShifts = myShifts.filter((s: any) => 
                          s.startTime.startsWith(dateStr)
                        );
                        const isToday = date.toDateString() === today.toDateString();

                        return (
                          <div
                            key={i}
                            className={`border rounded-lg p-3 ${
                              isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className={`text-xl font-bold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                                  {date.getDate()}
                                </p>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {date.toLocaleDateString('en-US', { month: 'short' })}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {dayShifts.length > 0 ? (
                              <div className="space-y-1">
                                {dayShifts.map((shift: any) => (
                                  <div
                                    key={shift.id}
                                    className="bg-primary-100 rounded px-2 py-1.5 text-sm text-primary-800 font-medium"
                                  >
                                    {new Date(shift.startTime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })} - {new Date(shift.endTime).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 text-center py-1">Day Off</p>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {totalHours > 40 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ You're scheduled for {(totalHours - 40).toFixed(1)} hours over the 40-hour limit this week.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}

        {/* Manager View: Weekly Calendar */}
        {isOperator && (
          <WeeklyCalendar
            shifts={weekShifts}
            onDateClick={(date) => {
              router.push(`/schedule?date=${date.toISOString()}`);
            }}
          />
        )}

        {/* Manager View: Today's Attendance */}
        {isOperator && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Today's Attendance</h2>
              <Link
                href="/schedule"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage Schedule →
              </Link>
            </div>
            
            {attendanceLoading ? (
              <LoadingSpinner />
            ) : todayShifts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayShifts.map((shift: any) => (
                  <ShiftCard key={shift.id} shift={shift} showUser />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No shifts scheduled for today
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/notifications"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Bell className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <p className="text-gray-600">View all your notifications and updates</p>
          </Link>

          <Link
            href={isOperator ? '/schedule' : '/my-shifts'}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Calendar className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {isOperator ? 'Manage Schedule' : 'My Shifts'}
            </h3>
            <p className="text-gray-600">
              {isOperator
                ? 'Create and manage employee schedules'
                : 'View your upcoming shifts'}
            </p>
          </Link>
        </div>
      </div>

      {/* Onboarding Wizard */}
      {shouldShowOnboarding && (
        isOperator ? (
          <ManagerOnboarding
            onComplete={completeOnboarding}
            onSkip={skipOnboarding}
          />
        ) : (
          <EmployeeOnboarding
            onComplete={completeOnboarding}
            onSkip={skipOnboarding}
          />
        )
      )}
    </Layout>
  );
}
