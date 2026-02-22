export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'SCHOOL_ADMIN' | 'MONITOR' | 'VISITOR';
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
    role: 'STUDENT' | 'SCHOOL_ADMIN' | 'MONITOR' | 'VISITOR';
    schoolName?: string;
}
