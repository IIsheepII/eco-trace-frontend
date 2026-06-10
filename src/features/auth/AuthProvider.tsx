import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import type { LoginFormValues } from '../../schemas/auth';
import { authService } from '../../services/authService';
import type { User } from '../../types/domain';

type AuthContextValue = {
  user?: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (values: LoginFormValues) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
  });
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => queryClient.setQueryData(['auth', 'me'], user),
  });
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => queryClient.removeQueries({ queryKey: ['auth'] }),
  });

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data,
        isLoading: meQuery.isLoading,
        isAuthenticated: Boolean(meQuery.data),
        login: loginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
