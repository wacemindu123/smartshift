import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuthUser } from './useAuth';

export function useOnboarding() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useAuthUser();

  // Fetch onboarding progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ['onboarding-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get(`/onboarding/progress`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/onboarding/complete');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    },
  });

  // Skip onboarding
  const skipOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/onboarding/skip');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    },
  });

  // Update progress
  const updateProgressMutation = useMutation({
    mutationFn: async (step: string) => {
      const response = await api.patch('/onboarding/progress', { step });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    },
  });

  const shouldShowOnboarding = !isLoading && progress !== null && progress !== undefined && !progress.isCompleted && !progress.skippedTour;

  return {
    progress,
    isLoading,
    shouldShowOnboarding,
    completeOnboarding: completeOnboardingMutation.mutate,
    skipOnboarding: skipOnboardingMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isCompleting: completeOnboardingMutation.isPending,
    isSkipping: skipOnboardingMutation.isPending,
  };
}
