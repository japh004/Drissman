import api from './client';
import type { PartnerStats, UpdateSchoolRequest } from '@/types/partner';

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
