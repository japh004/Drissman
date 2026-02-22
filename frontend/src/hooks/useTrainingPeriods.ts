'use client';

import { useState, useEffect, useCallback } from 'react';
import { trainingPeriodService } from '@/lib/api/training-periods';
import type { TrainingPeriod } from '@/lib/api/training-periods';

export function useTrainingPeriods(schoolId?: string) {
    const [periods, setPeriods] = useState<TrainingPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPeriods = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = schoolId
                ? await trainingPeriodService.getBySchool(schoolId)
                : await trainingPeriodService.getMySchoolPeriods();
            setPeriods(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    return { periods, loading, error, refetch: fetchPeriods };
}

export function usePublishedPeriods(schoolId?: string) {
    const [periods, setPeriods] = useState<TrainingPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPeriods = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = schoolId
                ? await trainingPeriodService.getPublishedBySchool(schoolId)
                : await trainingPeriodService.getPublished();
            setPeriods(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    return { periods, loading, error, refetch: fetchPeriods };
}
