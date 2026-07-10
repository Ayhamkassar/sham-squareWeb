import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AdminUser } from '../types';
import { useLocale } from '../i18n/LocaleContext';
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import { postJson } from '@/services/apiClient';

const LOGGED_IN_KEY = '@sham_presto/isLoggedIn';
const ADMIN_USER_KEY = '@sham_presto/adminUser';

interface AuthContextValue {
  isLoggedIn: boolean;
  adminUser: AdminUser | null;
  login: (user: AdminUser) => void;
  loginWithCredentials: (phone: string, password: string) => Promise<void>;
    registerWithCredentials: (data: {firstName: string; lastName: string; email: string; phone: string; password: string;}) => Promise<void>;
  logout: () => void;
  updateAdminUser: (user: AdminUser) => void;
  isSuperAdmin: boolean;
  isDepartmentAdmin: boolean;
  adminDepartmentId: string | null;
  authLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const loggedIn = await storage.getItem(LOGGED_IN_KEY);
        const savedUser = await storage.getItem(ADMIN_USER_KEY);
        const tokens = await authService.getTokens();

        if (loggedIn === 'true' && savedUser && tokens.access) {
          const user: AdminUser = JSON.parse(savedUser);
          setAdminUser(user);
          setIsLoggedIn(true);
        } else if (tokens.access) {
          // Try to verify with backend
          const userData = await authService.getMe();
          if (userData) {
            const roleType = mapRoleToType(userData.role);
            const mappedUser: AdminUser = {
              id: userData.id,
              name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
              email: userData.email || '',
              role: userData.role || t('مدير عام المتجر'),
              roleType,
              avatar: userData.avatar || '',
              phone: userData.phone || '',
              password: '',
              status: 'active',
              createdAt: '',
            };
            setAdminUser(mappedUser);
            setIsLoggedIn(true);
            await storage.setItem(LOGGED_IN_KEY, 'true');
            await storage.setItem(ADMIN_USER_KEY, JSON.stringify(mappedUser));
          } else {
            await authService.clearTokens();
          }
        }
      } catch {
        // No saved session, stay logged out
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  const login = useCallback((user: AdminUser) => {
    setAdminUser(user);
    setIsLoggedIn(true);
    setAuthError(null);
    storage.setItem(LOGGED_IN_KEY, 'true');
    storage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }, []);

  function mapRoleToType(role?: string): 'super' | 'department' {
    if (!role) return 'super';
    const upper = role.toUpperCase();
    if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'super';
    return 'department';
  }

  const registerWithCredentials = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  setAuthLoading(true);
  try {
    const res = await postJson('/web-auth/register', data);
    const { accessToken, refreshToken } = res.data.tokens;
    await authService.saveTokens(accessToken, refreshToken);
    setAdminUser(res.data.user);
  } catch (err) {
    throw err;
  } finally {
    setAuthLoading(false);
  }
};

  const loginWithCredentials = useCallback(async (phone: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login(phone, password);
      const roleType = mapRoleToType(data.user.role);
      const mappedUser: AdminUser = {
        id: data.user.id,
        name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
        email: data.user.email || '',
        role: data.user.role || t('مدير عام المتجر'),
        roleType,
        avatar: data.user.avatar || '',
        phone: data.user.phone || phone,
        password: '',
        status: 'active',
        createdAt: '',
      };
      setAdminUser(mappedUser);
      setIsLoggedIn(true);
      await storage.setItem(LOGGED_IN_KEY, 'true');
      await storage.setItem(ADMIN_USER_KEY, JSON.stringify(mappedUser));
    } catch (err: any) {
      const message = err?.message || t('بيانات الدخول غير صحيحة');
      setAuthError(message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [t]);

  const logout = useCallback(async () => {
    await authService.clearTokens();
    await storage.removeItem(LOGGED_IN_KEY);
    await storage.removeItem(ADMIN_USER_KEY);
    setAdminUser(null);
    setIsLoggedIn(false);
  }, []);

  const value: AuthContextValue = {
    isLoggedIn,
    adminUser,
    login,
    loginWithCredentials,
    registerWithCredentials,
    logout,
    updateAdminUser: setAdminUser as any,
    isSuperAdmin: adminUser?.roleType === 'super',
    isDepartmentAdmin: adminUser?.roleType === 'department',
    adminDepartmentId: adminUser?.departmentId ?? null,
    authLoading,
    authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
