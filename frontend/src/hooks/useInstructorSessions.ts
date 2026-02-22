"use client";

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { Session, SessionStatus } from '@/types/partner';
import { toast } from 'sonner';

export function useInstructorSessions(monitorId?: string) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        if (!monitorId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: apiError } = await api.get<Session[]>(`/schools/admin/sessions/monitor/${monitorId}`);

            if (apiError) throw new Error(apiError);
            setSessions(data || []);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement de vos sessions assignées");
        } finally {
            setLoading(false);
        }
    }, [monitorId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Validation feature allows the instructor to validate the session
    const validateSession = async (sessionId: string, notes?: string) => {
        try {
            const { data, error } = await api.patch<Session>(`/schools/admin/sessions/${sessionId}/complete`, { notes });
            if (error) throw new Error(error);

            if (data) {
                setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
            }
            return data;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la validation");
            throw err;
        }
    };

    return {
        sessions,
        loading,
        error,
        refetch: fetchSessions,
        validateSession
    };
}
