import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSession {
  token: string;
  role: string;
  sub_role?: string;
  full_name: string;
}

interface AuthContextType {
  user: UserSession | null;
  loginSession: (data: UserSession) => void;
  logoutSession: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('medai_token');
    const userData = localStorage.getItem('medai_user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          token,
          role: parsedUser.role,
          sub_role: parsedUser.sub_role,
          full_name: parsedUser.full_name,
        });
      } catch (e) {
        console.error('Error al parsear usuario almacenado', e);
        localStorage.removeItem('medai_token');
        localStorage.removeItem('medai_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginSession = (data: UserSession) => {
    localStorage.setItem('medai_token', data.token);
    localStorage.setItem('medai_user', JSON.stringify(data));
    setUser(data);
  };

  const logoutSession = () => {
    localStorage.removeItem('medai_token');
    localStorage.removeItem('medai_user');
    setUser(null);
  };

  const value = {
    user,
    loginSession,
    logoutSession,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook para consumir el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};