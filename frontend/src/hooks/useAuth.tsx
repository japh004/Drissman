'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { authService, AuthUser, AuthResponse } from '@/lib/api';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string, role?: 'STUDENT' | 'SCHOOL_ADMIN' | 'MONITOR' | 'VISITOR', schoolName?: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setUser(response.user);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
    }, []);

    const register = useCallback(async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: 'STUDENT' | 'SCHOOL_ADMIN' | 'MONITOR' | 'VISITOR' = 'STUDENT',
        schoolName?: string
    ) => {
        const response = await authService.register({
            email,
            password,
            firstName,
            lastName,
            role,
            schoolName
        });
        setUser(response.user);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
