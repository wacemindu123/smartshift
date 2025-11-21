import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { User } from '@/shared/types';

export function useAuthUser() {
  const { user: clerkUser, isLoaded } = useUser();
  const api = useApi();

  const { data: dbUser, isLoading } = useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return response.data;
    },
    enabled: isLoaded && !!clerkUser,
  });

  const isOperator = dbUser?.role === 'OPERATOR';
  const isEmployee = dbUser?.role === 'EMPLOYEE';

  return {
    user: dbUser,
    clerkUser,
    isLoaded,
    isLoading,
    isOperator,
    isEmployee,
  };
}
