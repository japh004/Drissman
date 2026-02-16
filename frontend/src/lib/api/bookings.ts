import api from './client';
import type { Booking, CreateBookingPayload } from '@/types/booking';

// Bookings Service
export const bookingsService = {
    async create(payload: CreateBookingPayload): Promise<Booking> {
        // Backend maps this to /api/enrollments
        const { data, error } = await api.post<Booking>('/enrollments', payload);
        if (error) throw new Error(error);
        return data!;
    },

    async getMyBookings(userId: string): Promise<Booking[]> {
        // Backend maps this to /api/enrollments
        const { data, error } = await api.get<Booking[]>('/enrollments');
        if (error) throw new Error(error);
        return data || [];
    },

    async getSchoolBookings(schoolId: string): Promise<Booking[]> {
        // Backend maps school-wide enrollments to /api/partner/enrollments
        const { data, error } = await api.get<Booking[]>('/partner/enrollments');
        if (error) throw new Error(error);
        return data || [];
    },

    async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
        const { data, error } = await api.patch<Booking>(`/enrollments/${id}/status?status=${status}`);
        if (error) throw new Error(error);
        return data!;
    }
};

