import { apiClient } from "@/lib/api-client";

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "SCHOOL_ADMIN" | "CANDIDAT" | "MONITOR";
    schoolId?: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: "CANDIDAT" | "SCHOOL_ADMIN";
    schoolName?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export const authService = {
    register: (payload: RegisterPayload) =>
        apiClient.post<AuthResponse>("/auth/register", payload),

    login: (payload: LoginPayload) =>
        apiClient.post<AuthResponse>("/auth/login", payload),
};
