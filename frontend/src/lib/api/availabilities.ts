import api from './client';
import type { Availability, CreateAvailabilityPayload } from '@/types/availability';

// Days of week helper
export const DAYS_OF_WEEK = [
    { value: 0, label: "Dimanche" },
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" }
];

// Availabilities Service
export const availabilitiesService = {
    async getBySchool(schoolId: string): Promise<Availability[]> {
        const { data, error } = await api.get<Availability[]>(`/availabilities/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async create(payload: CreateAvailabilityPayload): Promise<Availability> {
        const { data, error } = await api.post<Availability>('/availabilities', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async update(id: string, payload: Partial<Availability>): Promise<Availability> {
        const { data, error } = await api.put<Availability>(`/availabilities/${id}`, payload);
        if (error) throw new Error(error);
        return data!;
    },

    async delete(id: string): Promise<void> {
        const { error } = await api.delete(`/availabilities/${id}`);
        if (error) throw new Error(error);
    }
};
