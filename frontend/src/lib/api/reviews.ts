import api from './client';
import type { Review, CreateReviewPayload } from '@/types/review';

// Reviews Service
export const reviewsService = {
    async getBySchool(schoolId: string): Promise<Review[]> {
        const { data, error } = await api.get<Review[]>(`/reviews/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async create(payload: CreateReviewPayload): Promise<Review> {
        const { data, error } = await api.post<Review>('/reviews', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async verify(id: string): Promise<Review> {
        const { data, error } = await api.patch<Review>(`/reviews/${id}/verify`);
        if (error) throw new Error(error);
        return data!;
    },

    async delete(id: string): Promise<void> {
        const { error } = await api.delete(`/reviews/${id}`);
        if (error) throw new Error(error);
    }
};
