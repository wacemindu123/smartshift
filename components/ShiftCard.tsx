import { Shift } from '@/shared/types';
import { formatDate, formatTime, getDurationInHours, getRelativeTime } from '@/shared/utils';
import { Clock, User, MapPin } from 'lucide-react';

interface ShiftCardProps {
  shift: Shift;
  showUser?: boolean;
  onClick?: () => void;
}

export default function ShiftCard({ shift, showUser = false, onClick }: ShiftCardProps) {
  const duration = getDurationInHours(shift.startTime, shift.endTime);
  const relativeTime = getRelativeTime(shift.startTime);

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PUBLISHED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const attendanceStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ON_SHIFT: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    MISSED: 'bg-red-100 text-red-800',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {shift.role?.name || 'Shift'}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(shift.startTime)}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            statusColors[shift.status]
          }`}
        >
          {shift.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
          </span>
          <span className="ml-2 text-gray-400">({duration}h)</span>
        </div>

        {showUser && shift.user && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>{shift.user.name}</span>
          </div>
        )}

        {shift.attendance && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Attendance</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  attendanceStatusColors[shift.attendance.status]
                }`}
              >
                {shift.attendance.status.replace('_', ' ')}
              </span>
            </div>
            {shift.attendance.clockIn && (
              <div className="text-xs text-gray-500 mt-1">
                In: {formatTime(shift.attendance.clockIn)}
                {shift.attendance.clockOut &&
                  ` | Out: ${formatTime(shift.attendance.clockOut)}`}
              </div>
            )}
          </div>
        )}

        {shift.status === 'PUBLISHED' && !shift.attendance && (
          <div className="mt-2 text-xs text-gray-500">{relativeTime}</div>
        )}
      </div>
    </div>
  );
}
