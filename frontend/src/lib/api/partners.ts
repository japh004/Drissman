import api from './client';
import type {
    PartnerStats,
    UpdateSchoolRequest,
    Monitor,
    CreateMonitorRequest,
    Session,
    CreateSessionRequest,
    SessionStatus,
    Enrollment
} from '@/types/partner';

export const partnerService = {
    async getStats(): Promise<PartnerStats> {
        const { data, error } = await api.get<PartnerStats>('/partner/stats');
        if (error) throw new Error(error);
        return data!;
    },

    async updateSchool(payload: UpdateSchoolRequest): Promise<void> {
        const { error } = await api.patch('/partner/school', payload);
        if (error) throw new Error(error);
    },

    async getMonitors(): Promise<Monitor[]> {
        const { data, error } = await api.get<Monitor[]>(`/schools/admin/monitors`);
        if (error) throw new Error(error);
        return data || [];
    },

    async createMonitor(payload: CreateMonitorRequest): Promise<Monitor> {
        const { data, error } = await api.post<Monitor>('/schools/admin/monitors', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateMonitor(id: string, payload: CreateMonitorRequest): Promise<Monitor> {
        const { data, error } = await api.put<Monitor>(`/schools/admin/monitors/${id}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async deleteMonitor(id: string): Promise<void> {
        const { error } = await api.delete(`/schools/admin/monitors/${id}`);
        if (error) throw new Error(error);
    },

    // Sessions (Lessons)
    async getSessions(): Promise<Session[]> {
        const { data, error } = await api.get<Session[]>(`/schools/admin/sessions`);
        if (error) throw new Error(error);
        return data || [];
    },

    async createSession(payload: CreateSessionRequest): Promise<Session> {
        const { data, error } = await api.post<Session>('/schools/admin/sessions', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateSessionStatus(id: string, status: SessionStatus): Promise<Session> {
        const { data, error } = await api.patch<Session>(`/schools/admin/sessions/${id}/status?status=${status}`);
        if (error) throw new Error(error);
        return data!;
    },

    async deleteSession(id: string): Promise<void> {
        const { error } = await api.delete(`/schools/admin/sessions/${id}`);
        if (error) throw new Error(error);
    },

    // Enrollments
    async getEnrollments(): Promise<Enrollment[]> {
        const { data, error } = await api.get<Enrollment[]>(`/schools/admin/enrollments`);
        if (error) throw new Error(error);
        return data || [];
    },

    async updateEnrollmentStatus(id: string, status: Enrollment['status']): Promise<Enrollment> {
        const { data, error } = await api.patch<Enrollment>(`/schools/admin/enrollments/${id}/status?status=${status}`);
        if (error) throw new Error(error);
        return data!;
    },

    // Monitor Profile (for logged-in monitors)
    async getMonitorProfile(): Promise<Monitor> {
        const { data, error } = await api.get<Monitor>('/monitors/me');
        if (error) throw new Error(error);
        return data!;
    },

    // Sessions by Monitor
    async getSessionsByMonitor(monitorId: string): Promise<Session[]> {
        const { data, error } = await api.get<Session[]>(`/sessions/monitor/${monitorId}`);
        if (error) throw new Error(error);
        return data || [];
    }
};
