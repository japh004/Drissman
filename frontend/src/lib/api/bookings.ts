import api from './client';
import type { Booking, CreateBookingPayload } from '@/types/booking';

// Bookings Service
export const bookingsService = {
    async create(payload: CreateBookingPayload): Promise<Booking> {
        const { data, error } = await api.post<Booking>('/bookings', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async getMyBookings(userId: string): Promise<Booking[]> {
        const { data, error } = await api.get<Booking[]>('/bookings');
        if (error) throw new Error(error);
        return data || [];
    },

    async getSchoolBookings(schoolId: string): Promise<Booking[]> {
        const { data, error } = await api.get<Booking[]>(`/bookings/school/${schoolId}`);
        if (error) throw new Error(error);
        return data || [];
    },

    async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
        const { data, error } = await api.patch<Booking>(`/bookings/${id}/status?status=${status}`);
        if (error) throw new Error(error);
        return data!;
    }
};

