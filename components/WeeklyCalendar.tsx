'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
    category: string;
  };
}

interface WeeklyCalendarProps {
  shifts: Shift[];
  onDateClick?: (date: Date) => void;
}

export default function WeeklyCalendar({ shifts, onDateClick }: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getCoverageStatus = (dayShifts: Shift[]) => {
    if (dayShifts.length === 0) return 'empty';
    if (dayShifts.length < 5) return 'low';
    if (dayShifts.length > 7) return 'high';
    return 'optimal';
  };

  const getCoverageColor = (status: string) => {
    switch (status) {
      case 'empty':
        return 'bg-red-50 border-red-200';
      case 'low':
        return 'bg-yellow-50 border-yellow-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'optimal':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getCoverageIcon = (status: string) => {
    if (status === 'empty' || status === 'low') {
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
          <p className="text-sm text-gray-600">
            {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Click any day to manage shifts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Today
          </button>
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Calendar Grid - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-7 gap-3">
        {weekDays.map((date, index) => {
          const dayShifts = getShiftsForDay(date);
          const coverageStatus = getCoverageStatus(dayShifts);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className={`border rounded-lg p-3 min-h-[200px] cursor-pointer transition-all hover:shadow-md ${
                getCoverageColor(coverageStatus)
              } ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => onDateClick?.(date)}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-medium text-gray-600">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${isCurrentDay ? 'text-primary-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getCoverageIcon(coverageStatus)}
                  <span className="text-xs font-medium text-gray-600">
                    {dayShifts.length}
                  </span>
                </div>
              </div>

              {/* Shifts */}
              <div className="space-y-2">
                {dayShifts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-400">No shifts</p>
                  </div>
                ) : (
                  dayShifts.slice(0, 3).map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-white rounded p-2 border border-gray-200 hover:border-primary-300 transition-colors"
                    >
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {shift.user.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {shift.role.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </div>
                    </div>
                  ))
                )}
                {dayShifts.length > 3 && (
                  <div className="text-xs text-center text-gray-500 font-medium">
                    +{dayShifts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile List View - Shown only on mobile */}
      <div className="md:hidden space-y-3">
        {weekDays.map((date, index) => {
          const dayShifts = getShiftsForDay(date);
          const coverageStatus = getCoverageStatus(dayShifts);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                getCoverageColor(coverageStatus)
              } ${isCurrentDay ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => onDateClick?.(date)}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-600">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold ${isCurrentDay ? 'text-primary-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getCoverageIcon(coverageStatus)}
                  <span className="text-sm font-medium text-gray-600">
                    {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Shifts Preview */}
              {dayShifts.length > 0 ? (
                <div className="space-y-2">
                  {dayShifts.slice(0, 3).map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between text-sm bg-white bg-opacity-50 rounded p-2">
                      <div>
                        <div className="font-medium text-gray-900">{shift.user.name}</div>
                        <div className="text-xs text-gray-600">{shift.role.name}</div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </div>
                    </div>
                  ))}
                  {dayShifts.length > 3 && (
                    <div className="text-xs text-center text-gray-600 pt-1">
                      +{dayShifts.length - 3} more
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No shifts</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
            <span className="text-gray-600">No coverage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span className="text-gray-600">Low (&lt;5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-gray-600">Optimal (5-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
            <span className="text-gray-600">High (&gt;7)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
