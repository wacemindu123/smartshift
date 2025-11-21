'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { User, WorkRole } from '@/shared/types';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface CreateShiftModalProps {
  onClose: () => void;
  defaultDate?: Date;
}

export default function CreateShiftModal({ onClose, defaultDate }: CreateShiftModalProps) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  const today = defaultDate || new Date();
  const [date, setDate] = useState(today.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');

  // Fetch employees
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users?role=EMPLOYEE');
      return response.data;
    },
  });

  // Fetch work roles
  const { data: roles = [] } = useQuery<WorkRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data;
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      roleId: string;
      startTime: string;
      endTime: string;
    }) => {
      const response = await api.post('/shifts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create shift');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Please select an employee');
      return;
    }

    if (!roleId) {
      toast.error('Please select a work role');
      return;
    }

    // Combine date and time
    const startDateTime = new Date(`${date}T${startTime}`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}`).toISOString();

    // Validate times
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      toast.error('End time must be after start time');
      return;
    }

    createShiftMutation.mutate({
      userId,
      roleId,
      startTime: startDateTime,
      endTime: endDateTime,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Create Shift</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select an employee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.workRoleId && `(${roles.find(r => r.id === user.workRoleId)?.name})`}
                </option>
              ))}
            </select>
            {users.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No employees found. Add team members first.
              </p>
            )}
          </div>

          {/* Work Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Role *
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {roles.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No work roles found. Add roles in Team page first.
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createShiftMutation.isPending || users.length === 0 || roles.length === 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createShiftMutation.isPending ? 'Creating...' : 'Create Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
