import api from './client';

// Types
export interface Review {
    id: string;
    userId: string;
    userName: string;
    schoolId: string;
    rating: number; // 1-5
    comment?: string;
    verified: boolean;
    createdAt: string;
}

export interface CreateReviewPayload {
    schoolId: string;
    rating: number;
    comment?: string;
}

// Reviews Service
export const reviewsService = {
    async getBySchool(schoolId: string): Promise<Review[]> {
        const { data, error } = await api.get<Review[]>(`/reviews/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async create(payload: CreateReviewPayload, userId: string): Promise<Review> {
        const { data, error } = await api.post<Review>('/reviews', payload, {
            'X-User-Id': userId
        });
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
