import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { getToken, getUser } from '@/lib/auth';
import type { ApiUser, AuthResponse } from '@/types/platform';

type AuthContextValue = {
  token: string;
  user: ApiUser | null;
  completeAuth: (data: AuthResponse) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<ApiUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      completeAuth(data) {
        const nextToken = getToken(data);
        const nextUser = getUser(data);

        if (!nextToken || !nextUser) {
          return false;
        }

        setToken(nextToken);
        setUser(nextUser);
        return true;
      },
      logout() {
        setToken('');
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
