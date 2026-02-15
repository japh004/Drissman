import api from './client';
import type { Enrollment } from '@/types/partner';

export interface CreateEnrollmentPayload {
    offerId: string;
    schoolId: string;
}

export const enrollmentService = {
    // For students: Get my enrollments
    async getMyEnrollments(): Promise<Enrollment[]> {
        const { data, error } = await api.get<Enrollment[]>('/enrollments');
        if (error) throw new Error(error);
        return data || [];
    },

    // For students: Create an enrollment (purchase offer)
    async create(payload: CreateEnrollmentPayload): Promise<Enrollment> {
        const { data, error } = await api.post<Enrollment>('/enrollments', payload);
        if (error) throw new Error(error);
        return data!;
    },

    // For partner: Get school enrollments
    async getSchoolEnrollments(schoolId: string): Promise<Enrollment[]> {
        const { data, error } = await api.get<Enrollment[]>(`/partner/enrollments?schoolId=${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    // Update status (e.g. Confirm/Cancel)
    async updateStatus(id: string, status: Enrollment['status']): Promise<Enrollment> {
        const { data, error } = await api.patch<Enrollment>(`/partner/enrollments/${id}/status?status=${status}`);
        if (error) throw new Error(error);
        return data!;
    }
};
