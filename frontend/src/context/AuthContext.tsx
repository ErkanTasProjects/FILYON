import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const defaultUser: User = {
  id: 'usr-admin-1',
  email: 'admin@filyon.gov.tr',
  firstName: 'Kemal',
  lastName: 'Öztürk',
  role: 'ADMIN',
  tenantId: 'FILYON-DEMO-2026',
  tenantName: 'FILYON Büyükşehir Makine İkmal ve Filo İşletmeleri',
  tenantCode: 'FILYON-DEMO-2026',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  role: 'ADMIN',
  isAuthenticated: true,
  login: () => {},
  switchRole: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);

  const login = (email: string, role: UserRole = 'ADMIN') => {
    setUser({
      id: `usr-${role.toLowerCase()}-1`,
      email,
      firstName: role === 'ADMIN' ? 'Kemal' : role === 'CHIEF' ? 'Fuat' : role === 'MECHANIC' ? 'Mehmet' : role === 'STOREKEEPER' ? 'Ahmet' : role === 'DRIVER' ? 'Ali' : 'Selim',
      lastName: role === 'ADMIN' ? 'Öztürk' : role === 'CHIEF' ? 'Yılmaz' : role === 'MECHANIC' ? 'Demir' : role === 'STOREKEEPER' ? 'Çelik' : role === 'DRIVER' ? 'Kaya' : 'Aksoy',
      role,
      tenantId: 'FILYON-DEMO-2026',
      tenantName: 'FILYON Büyükşehir Makine İkmal ve Filo İşletmeleri',
      tenantCode: 'FILYON-DEMO-2026',
    });
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    setUser({
      ...user,
      role: newRole,
      firstName: newRole === 'ADMIN' ? 'Kemal' : newRole === 'CHIEF' ? 'Fuat' : newRole === 'MECHANIC' ? 'Mehmet' : newRole === 'STOREKEEPER' ? 'Ahmet' : newRole === 'DRIVER' ? 'Ali' : 'Selim',
      lastName: newRole === 'ADMIN' ? 'Öztürk' : newRole === 'CHIEF' ? 'Yılmaz' : newRole === 'MECHANIC' ? 'Demir' : newRole === 'STOREKEEPER' ? 'Çelik' : newRole === 'DRIVER' ? 'Kaya' : 'Aksoy',
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'DRIVER',
        isAuthenticated: !!user,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
