export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CANDIDAT' | 'SCHOOL_ADMIN' | 'MONITOR';
    schoolId?: string;
}

export type AuthUser = User;

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload extends LoginPayload {
    firstName: string;
    lastName: string;
    role: 'CANDIDAT' | 'SCHOOL_ADMIN' | 'MONITOR';
    schoolName?: string;
}
