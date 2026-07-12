import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { AdminUser } from '../types';
import { useLocale } from '../i18n/LocaleContext';
import { authService, AuthUser } from '../services/authService';
import { storage } from '../services/storage';

const LOGGED_IN_KEY = '@sham_presto/isLoggedIn';
const ADMIN_USER_KEY = '@sham_presto/adminUser';

interface AuthContextValue {
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  authLoading: boolean;
  authError: string | null;
  loginWithCredentials: (phone: string, password: string) => Promise<void>;
  registerWithCredentials: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  restoreSession: () => Promise<void>;
  forgotPassword: (identifier: string) => Promise<void>;
  verifyResetCode: (identifier: string, code: string) => Promise<string | null>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  isSuperAdmin: boolean;
  isDepartmentAdmin: boolean;
  adminDepartmentId: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapAuthUserToAdminUser(user: AuthUser): AdminUser {
  const roleType = mapRoleToType(user.role);
  return {
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    email: user.email || '',
    role: user.role || '',
    roleType,
    avatar: user.avatar || '',
    phone: user.phone || '',
    password: '',
    status: 'active',
    createdAt: '',
    departmentId: user.departmentId,
  };
}

function mapRoleToType(role?: string): 'super' | 'department' {
  if (!role) return 'super';
  const upper = role.toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'ADMIN') return 'super';
  return 'department';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const restoreAttempted = useRef(false);

  const persistSession = useCallback(async (user: AdminUser) => {
    await storage.setItem(LOGGED_IN_KEY, 'true');
    await storage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    setAdminUser(user);
    setIsLoggedIn(true);
    setAuthError(null);
  }, []);

  const clearSession = useCallback(async () => {
    await authService.clearTokens();
    await storage.removeItem(LOGGED_IN_KEY);
    await storage.removeItem(ADMIN_USER_KEY);
    setAdminUser(null);
    setIsLoggedIn(false);
  }, []);

  const restoreSession = useCallback(async () => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;
    setAuthLoading(true);
    try {
      const loggedIn = await storage.getItem(LOGGED_IN_KEY);
      const savedUser = await storage.getItem(ADMIN_USER_KEY);
      const tokens = await authService.getTokens();

      if (tokens.access) {
        const userData = await authService.getMe();
        if (userData) {
          const mappedUser = mapAuthUserToAdminUser(userData);
          await persistSession(mappedUser);
          return;
        }

        if (tokens.refresh) {
          const newAccessToken = await authService.refreshAccessToken();
          if (newAccessToken) {
            const refreshedUser = await authService.getMe();
            if (refreshedUser) {
              const mappedUser = mapAuthUserToAdminUser(refreshedUser);
              await persistSession(mappedUser);
              return;
            }
          }
        }

        if (loggedIn === 'true' && savedUser) {
          try {
            const user: AdminUser = JSON.parse(savedUser);
            setAdminUser(user);
            setIsLoggedIn(true);
            return;
          } catch {
            // invalid saved user data
          }
        }
      }

      await clearSession();
    } catch {
      await clearSession();
    } finally {
      setAuthLoading(false);
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const loginWithCredentials = useCallback(async (identifier: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login(identifier, password);
      const mappedUser = mapAuthUserToAdminUser(data.user);
      await persistSession(mappedUser);
    } catch (err: any) {
      const message = err?.message || t('بيانات الدخول غير صحيحة');
      setAuthError(message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [t, persistSession]);

  const registerWithCredentials = useCallback(async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await authService.register(data);
      const mappedUser = mapAuthUserToAdminUser(result.user);
      await persistSession(mappedUser);
    } catch (err: any) {
      const message = err?.message || t('حدث خطأ أثناء إنشاء الحساب');
      setAuthError(message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, [t, persistSession]);

  const logout = useCallback(async () => {
    setAuthLoading(true);
    await authService.logout();
    await clearSession();
    setAuthLoading(false);
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    try {
      const tokens = await authService.getTokens();
      if (!tokens.access) {
        await clearSession();
        return;
      }
      const userData = await authService.getMe();
      if (userData) {
        const mappedUser = mapAuthUserToAdminUser(userData);
        await persistSession(mappedUser);
      } else if (tokens.refresh) {
        const newToken = await authService.refreshAccessToken();
        if (newToken) {
          const refreshedUser = await authService.getMe();
          if (refreshedUser) {
            const mappedUser = mapAuthUserToAdminUser(refreshedUser);
            await persistSession(mappedUser);
            return;
          }
        }
        await clearSession();
      }
    } catch {
      await clearSession();
    }
  }, [clearSession, persistSession]);

  const forgotPassword = useCallback(async (identifier: string) => {
    await authService.forgotPassword(identifier);
  }, []);

  const verifyResetCode = useCallback(async (identifier: string, code: string) => {
    return authService.verifyResetCode(identifier, code);
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    await authService.resetPassword(resetToken, newPassword);
  }, []);

  const value: AuthContextValue = {
    isLoggedIn,
    isAuthenticated: isLoggedIn,
    adminUser,
    authLoading,
    authError,
    loginWithCredentials,
    registerWithCredentials,
    logout,
    refreshSession,
    restoreSession,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    isSuperAdmin: adminUser?.roleType === 'super',
    isDepartmentAdmin: adminUser?.roleType === 'department',
    adminDepartmentId: adminUser?.departmentId ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
