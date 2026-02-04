import api from './client';

export interface PartnerStats {
    revenue: string;
    enrollments: number;
    successRate: string;
    upcomingLessons: number;
    revenueGrowth: number;
    enrollmentGrowth: number;
}

export interface UpdateSchoolRequest {
    name?: string;
    description?: string;
    imageUrl?: string;
}

export const partnerService = {
    async getStats(): Promise<PartnerStats> {
        const { data, error } = await api.get<PartnerStats>('/partner/stats');
        if (error) throw new Error(error);
        return data!;
    },

    async updateSchool(payload: UpdateSchoolRequest): Promise<void> {
        const { error } = await api.patch('/partner/school', payload);
        if (error) throw new Error(error);
    }
};
