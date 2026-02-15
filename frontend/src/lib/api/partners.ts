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

    async getMonitors(schoolId: string): Promise<Monitor[]> {
        const { data, error } = await api.get<Monitor[]>(`/monitors/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async createMonitor(payload: CreateMonitorRequest): Promise<Monitor> {
        const { data, error } = await api.post<Monitor>('/monitors', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateMonitor(id: string, payload: CreateMonitorRequest): Promise<Monitor> {
        const { data, error } = await api.put<Monitor>(`/monitors/${id}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async deleteMonitor(id: string): Promise<void> {
        const { error } = await api.delete(`/monitors/${id}`);
        if (error) throw new Error(error);
    },

    // Sessions (Lessons)
    async getSessions(schoolId: string): Promise<Session[]> {
        const { data, error } = await api.get<Session[]>(`/sessions/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async createSession(payload: CreateSessionRequest): Promise<Session> {
        const { data, error } = await api.post<Session>('/sessions', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async updateSessionStatus(id: string, status: SessionStatus): Promise<Session> {
        const { data, error } = await api.patch<Session>(`/sessions/${id}/status?status=${status}`);
        if (error) throw new Error(error);
        return data!;
    },

    async deleteSession(id: string): Promise<void> {
        const { error } = await api.delete(`/sessions/${id}`);
        if (error) throw new Error(error);
    },

    // Enrollments
    async getEnrollments(schoolId: string): Promise<Enrollment[]> {
        const { data, error } = await api.get<Enrollment[]>(`/partner/enrollments?schoolId=${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    }
};
