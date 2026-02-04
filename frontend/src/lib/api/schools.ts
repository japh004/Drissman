import api from './client';

// Types
export interface School {
    id: string;
    name: string;
    description?: string;
    address: string;
    city: string;
    phone?: string;
    email?: string;
    rating: number;
    imageUrl?: string;
    offers?: Offer[];
}

export interface Offer {
    id: string;
    name: string;
    description?: string;
    price: number;
    hours: number;
    permitType?: string; // A, B, C, D, E, F, G
}

// Schools Service
export const schoolsService = {
    async getAll(city?: string): Promise<School[]> {
        const query = city ? `?city=${encodeURIComponent(city)}` : '';
        const { data, error } = await api.get<School[]>(`/schools${query}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async getById(id: string): Promise<School> {
        const { data, error } = await api.get<School>(`/schools/${id}`);
        if (error) throw new Error(error);
        return data!;
    },
};

// Offers Service
export const offersService = {
    async getBySchool(schoolId: string): Promise<Offer[]> {
        const { data, error } = await api.get<Offer[]>(`/offers/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async create(payload: {
        schoolId: string;
        name: string;
        description?: string;
        price: number;
        hours: number;
        permitType?: string;
    }): Promise<Offer> {
        const { data, error } = await api.post<Offer>('/offers', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async update(id: string, payload: Partial<Offer>): Promise<Offer> {
        const { data, error } = await api.patch<Offer>(`/offers/${id}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async delete(id: string): Promise<void> {
        const { error } = await api.delete(`/offers/${id}`);
        if (error) throw new Error(error);
    }
};
