'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatDate } from '@/shared/utils';

interface ShiftWithCapacity {
  date: string;
  shifts: any[];
  totalStaff: number;
  frontOfHouse: number;
  backOfHouse: number;
  expediter: number;
  isOvercrowded: boolean;
  isOptimal: boolean;
}

const FRONT_OF_HOUSE_ROLES = ['Barista', 'Register', 'Front Manager'];
const BACK_OF_HOUSE_ROLES = ['Hot Food Station', 'Cold Station', 'Prep Work', 'Dishes'];
const EXPEDITER_ROLES = ['Expediter'];

export default function CapacityPage() {
  const api = useApi();
  const { isOperator } = useAuthUser();
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Fetch business settings
  const { data: settings } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/business');
      return response.data;
    },
  });

  const MAX_STAFF_CAPACITY = settings?.maxStaffCapacity || 7;
  const OPTIMAL_STAFF_MIN = settings?.optimalStaffMin || 5;
  const OPTIMAL_STAFF_MAX = settings?.optimalStaffMax || 7;

  // Get week start and end
  const weekStart = new Date(selectedWeek);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Fetch shifts for the week
  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const response = await api.get('/shifts', {
        params: {
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
        },
      });
      return response.data;
    },
  });

  if (!isOperator) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Manager access required</p>
        </div>
      </Layout>
    );
  }

  // Group shifts by date and calculate capacity
  const capacityByDate: Record<string, ShiftWithCapacity> = {};
  
  shifts.forEach((shift: any) => {
    const dateKey = formatDate(shift.startTime, 'YYYY-MM-DD');
    
    if (!capacityByDate[dateKey]) {
      capacityByDate[dateKey] = {
        date: dateKey,
        shifts: [],
        totalStaff: 0,
        frontOfHouse: 0,
        backOfHouse: 0,
        expediter: 0,
        isOvercrowded: false,
        isOptimal: false,
      };
    }

    capacityByDate[dateKey].shifts.push(shift);
    
    // Count by role category
    const roleName = shift.role?.name;
    if (FRONT_OF_HOUSE_ROLES.includes(roleName)) {
      capacityByDate[dateKey].frontOfHouse++;
    } else if (BACK_OF_HOUSE_ROLES.includes(roleName)) {
      capacityByDate[dateKey].backOfHouse++;
    } else if (EXPEDITER_ROLES.includes(roleName)) {
      capacityByDate[dateKey].expediter++;
    }
  });

  // Calculate totals and flags
  Object.values(capacityByDate).forEach((day) => {
    day.totalStaff = day.frontOfHouse + day.backOfHouse + day.expediter;
    day.isOvercrowded = day.totalStaff > MAX_STAFF_CAPACITY;
    day.isOptimal = day.totalStaff >= OPTIMAL_STAFF_MIN && day.totalStaff <= OPTIMAL_STAFF_MAX;
  });

  const sortedDates = Object.keys(capacityByDate).sort();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capacity Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor staffing levels to prevent overcrowding (Max: {MAX_STAFF_CAPACITY} staff)
          </p>
        </div>

        {/* Capacity Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Optimal</h3>
            </div>
            <p className="text-sm text-green-800">
              {OPTIMAL_STAFF_MIN}-{OPTIMAL_STAFF_MAX} staff - Ideal productivity without overcrowding
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">Extended</h3>
            </div>
            <p className="text-sm text-yellow-800">
              Up to {MAX_STAFF_CAPACITY} staff - Busy periods, still manageable
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Overcrowded</h3>
            </div>
            <p className="text-sm text-red-800">
              {MAX_STAFF_CAPACITY + 1}+ staff - Space constraints, reduced productivity
            </p>
          </div>
        </div>

        {/* Daily Capacity View */}
        {isLoading ? (
          <LoadingSpinner />
        ) : sortedDates.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map((dateKey) => {
              const day = capacityByDate[dateKey];
              const date = new Date(dateKey);
              
              return (
                <div
                  key={dateKey}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                    day.isOvercrowded
                      ? 'border-red-300'
                      : day.isOptimal
                      ? 'border-green-300'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(date, 'dddd, MMMM D')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {day.shifts.length} shift{day.shifts.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {day.isOvercrowded && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-semibold">OVERCROWDED</span>
                        </div>
                      )}
                      {day.isOptimal && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">OPTIMAL</span>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {day.totalStaff}
                        </div>
                        <div className="text-xs text-gray-500">Total Staff</div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown by Area */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        Front of House
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {day.frontOfHouse}
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        Barista, Register, Manager
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-sm text-purple-600 font-medium mb-1">
                        Back of House
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {day.backOfHouse}
                      </div>
                      <div className="text-xs text-purple-700 mt-1">
                        Kitchen, Prep, Dishes
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-sm text-amber-600 font-medium mb-1">
                        Expediter
                      </div>
                      <div className="text-2xl font-bold text-amber-900">
                        {day.expediter}
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        Commands & Delivers
                      </div>
                    </div>
                  </div>

                  {/* Warning Messages */}
                  {day.isOvercrowded && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        ⚠️ <strong>Warning:</strong> This day exceeds maximum capacity. 
                        Consider reducing staff or extending hours to spread coverage.
                      </p>
                    </div>
                  )}

                  {day.expediter === 0 && day.totalStaff > 3 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Suggestion:</strong> No expediter scheduled. 
                        Consider adding one to improve kitchen coordination.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No shifts scheduled for this week</p>
            <p className="text-sm text-gray-500 mt-2">
              Create shifts in the Schedule page to see capacity analysis
            </p>
          </div>
        )}

        {/* Extended Hours Consideration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📅 Considering Extended Hours?
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Currently closing at 3pm. Extended hours can help:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Spread staff coverage across more hours</li>
            <li>• Reduce peak-time overcrowding</li>
            <li>• Allow staggered shifts for better space utilization</li>
            <li>• Increase revenue without adding more simultaneous staff</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
