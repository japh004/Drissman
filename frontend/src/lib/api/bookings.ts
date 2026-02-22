import api from './client';
import type { Booking, CreateBookingPayload } from '@/types/booking';

// Bookings Service
export const bookingsService = {
    // Helper to map backend EnrollmentDto to frontend Booking
    mapEnrollmentToBooking(dto: any): Booking {
        return {
            id: dto.id,
            school: {
                id: dto.schoolId,
                name: dto.schoolName || 'Auto-école'
            },
            offer: {
                id: dto.offerId,
                name: dto.offerName,
                price: dto.offerPrice || 0
            },
            user: dto.userName ? {
                id: dto.userId,
                name: dto.userName,
                email: dto.userEmail || ''
            } : undefined,
            date: dto.createdAt ? dto.createdAt.split('T')[0] : '',
            time: dto.createdAt ? dto.createdAt.split('T')[1]?.substring(0, 5) : '',
            status: dto.status === 'ACTIVE' ? 'CONFIRMED' :
                dto.status === 'CANCELLED' ? 'CANCELLED' :
                    dto.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
            createdAt: dto.createdAt || new Date().toISOString()
        };
    },

    async create(payload: CreateBookingPayload): Promise<Booking> {
        const { data, error } = await api.post<any>('/enrollments', payload);
        if (error) throw new Error(error);
        return this.mapEnrollmentToBooking(data);
    },

    async getMyBookings(userId: string): Promise<Booking[]> {
        const { data, error } = await api.get<any[]>('/enrollments');
        if (error) throw new Error(error);
        return (data || []).map(dto => this.mapEnrollmentToBooking(dto));
    },

    async getSchoolBookings(schoolId: string): Promise<Booking[]> {
        const { data, error } = await api.get<any[]>('/partner/enrollments');
        if (error) throw new Error(error);
        return (data || []).map(dto => this.mapEnrollmentToBooking(dto));
    },

    async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
        const backendStatus = status === 'CONFIRMED' ? 'ACTIVE' : status;
        const { data, error } = await api.patch<any>(`/enrollments/${id}/status?status=${backendStatus}`);
        if (error) throw new Error(error);
        return this.mapEnrollmentToBooking(data);
    }
};

