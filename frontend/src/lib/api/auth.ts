import api from './client';
import type { User, AuthResponse, RegisterPayload, LoginPayload } from '@/types/auth';

// Auth Service
export const authService = {
    async register(payload: RegisterPayload): Promise<AuthResponse> {
        const { data, error } = await api.post<AuthResponse>('/auth/register', payload);
        if (error) throw new Error(error);
        if (data) {
            api.setToken(data.token);
        }
        return data!;
    },

    async login(payload: LoginPayload): Promise<AuthResponse> {
        const { data, error } = await api.post<AuthResponse>('/auth/login', payload);
        if (error) throw new Error(error);
        if (data) {
            api.setToken(data.token);
        }
        return data!;
    },

    logout() {
        api.setToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
    },

    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!api.getToken();
    }
};
