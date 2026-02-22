'use client';

import { useState, useEffect, useCallback } from 'react';
import { enrollmentService } from '@/lib/api/enrollments';
import type { Enrollment } from '@/types/partner';

export function useMyEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEnrollments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await enrollmentService.getMyEnrollments();
            setEnrollments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return { enrollments, loading, error, refetch: fetchEnrollments };
}
