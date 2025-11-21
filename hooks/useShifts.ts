import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Shift, CreateShiftInput, UpdateShiftInput } from '@/shared/types';
import { toast } from 'react-toastify';

export function useShifts(startDate?: Date, endDate?: Date) {
  const api = useApi();
  const queryClient = useQueryClient();

  // Fetch shifts
  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['shifts', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      const response = await api.get(`/shifts?${params.toString()}`);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (data: CreateShiftInput) => {
      const response = await api.post('/shifts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift created successfully');
    },
    onError: () => {
      toast.error('Failed to create shift');
    },
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateShiftInput }) => {
      const response = await api.put(`/shifts/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift updated successfully');
    },
    onError: () => {
      toast.error('Failed to update shift');
    },
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/shifts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete shift');
    },
  });

  // Publish shifts mutation
  const publishShiftsMutation = useMutation({
    mutationFn: async (shiftIds: string[]) => {
      const response = await api.post('/shifts/publish', { shiftIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Schedule published successfully');
    },
    onError: () => {
      toast.error('Failed to publish schedule');
    },
  });

  return {
    shifts,
    isLoading,
    createShift: createShiftMutation.mutate,
    updateShift: updateShiftMutation.mutate,
    deleteShift: deleteShiftMutation.mutate,
    publishShifts: publishShiftsMutation.mutate,
  };
}

export function useMyShifts() {
  const api = useApi();

  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['shifts', 'my'],
    queryFn: async () => {
      const response = await api.get('/shifts/my');
      return response.data;
    },
  });

  return { shifts, isLoading };
}

export function useNextShift() {
  const api = useApi();

  const { data: shift, isLoading } = useQuery<Shift | null>({
    queryKey: ['shifts', 'next'],
    queryFn: async () => {
      const response = await api.get('/shifts/next');
      return response.data;
    },
  });

  return { shift, isLoading };
}
