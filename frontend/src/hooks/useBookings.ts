'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookingsService, Booking, CreateBookingPayload } from '@/lib/api';

interface UseBookingsOptions {
    userId?: string;
    schoolId?: string;
}

export function useBookings(options: UseBookingsOptions = {}) {
    const { userId, schoolId } = options;
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        // School admins fetch by schoolId, students fetch by userId
        if (!userId && !schoolId) {
            setBookings([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let data: Booking[];
            if (schoolId) {
                // Fetch school's bookings (for school admins)
                data = await bookingsService.getSchoolBookings(schoolId);
            } else {
                // Fetch user's bookings (for students)
                data = await bookingsService.getMyBookings(userId!);
            }

            setBookings(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [userId, schoolId]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const createBooking = useCallback(async (payload: CreateBookingPayload) => {
        if (!userId) throw new Error('User not authenticated');
        const newBooking = await bookingsService.create(payload);
        setBookings(prev => [...prev, newBooking]);
        return newBooking;
    }, [userId]);

    const updateStatus = useCallback(async (id: string, status: Booking['status']) => {
        const updated = await bookingsService.updateStatus(id, status);
        setBookings(prev => prev.map(b => b.id === id ? updated : b));
        return updated;
    }, []);

    return { bookings, loading, error, refetch: fetchBookings, createBooking, updateStatus };
}

