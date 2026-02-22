'use client';

import { useState, useEffect, useCallback } from 'react';
import { availabilitiesService, Availability, CreateAvailabilityPayload } from '@/lib/api';

export function useAvailabilities(schoolId?: string) {
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailabilities = useCallback(async () => {
        if (!schoolId) {
            setAvailabilities([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await availabilitiesService.getBySchool(schoolId);
            setAvailabilities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchAvailabilities();
    }, [fetchAvailabilities]);

    const createAvailability = useCallback(async (payload: CreateAvailabilityPayload) => {
        const newAvailability = await availabilitiesService.create(payload);
        setAvailabilities(prev => [...prev, newAvailability]);
        return newAvailability;
    }, []);

    const updateAvailability = useCallback(async (id: string, payload: Partial<Availability>) => {
        const updated = await availabilitiesService.update(id, payload);
        setAvailabilities(prev => prev.map(a => a.id === id ? updated : a));
        return updated;
    }, []);

    const deleteAvailability = useCallback(async (id: string) => {
        await availabilitiesService.delete(id);
        setAvailabilities(prev => prev.filter(a => a.id !== id));
    }, []);

    // Group by day
    const groupedByDay = availabilities.reduce((acc, avail) => {
        if (!acc[avail.dayOfWeek]) {
            acc[avail.dayOfWeek] = [];
        }
        acc[avail.dayOfWeek].push(avail);
        return acc;
    }, {} as Record<number, Availability[]>);

    return {
        availabilities,
        groupedByDay,
        loading,
        error,
        refetch: fetchAvailabilities,
        createAvailability,
        updateAvailability,
        deleteAvailability
    };
}
