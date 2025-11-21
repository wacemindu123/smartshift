import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Bell, Calendar, Home, Clock, Users, TrendingUp, Settings, RefreshCw, Palmtree } from 'lucide-react';
import { useAuthUser } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function Navbar() {
  const { user, isOperator } = useAuthUser();
  const { unreadCount } = useNotifications();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary-600">
                ShiftSmart
              </div>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {isOperator && (
                <>
                  <Link
                    href="/team"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Users className="w-4 h-4" />
                    <span>Team</span>
                  </Link>
                  <Link
                    href="/capacity"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Capacity</span>
                  </Link>
                  <Link
                    href="/availability-requests"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Availability</span>
                  </Link>
                  <Link
                    href="/time-off"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Palmtree className="w-4 h-4" />
                    <span>Time Off</span>
                  </Link>
                </>
              )}

              {!isOperator && (
                <>
                  <Link
                    href="/my-shifts"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>My Shifts</span>
                  </Link>
                  <Link
                    href="/availability"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Availability</span>
                  </Link>
                  <Link
                    href="/time-off"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <Palmtree className="w-4 h-4" />
                    <span>Time Off</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/notifications"
              className="relative p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-50"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>

            {isOperator && (
              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
