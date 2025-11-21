import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { ClockInInput, ClockOutInput } from '@/shared/types';
import { toast } from 'react-toastify';

export function useAttendance() {
  const api = useApi();
  const queryClient = useQueryClient();

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: ClockInInput) => {
      const response = await api.post('/attendance/clockin', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Clocked in successfully');
    },
    onError: () => {
      toast.error('Failed to clock in');
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (data: ClockOutInput) => {
      const response = await api.post('/attendance/clockout', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Clocked out successfully');
    },
    onError: () => {
      toast.error('Failed to clock out');
    },
  });

  return {
    clockIn: clockInMutation.mutate,
    clockOut: clockOutMutation.mutate,
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
  };
}

export function useTodayAttendance() {
  const api = useApi();

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const response = await api.get('/attendance/today');
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  return { shifts, isLoading };
}
