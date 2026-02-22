"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";
import { Session } from "@/types/partner";

/**
 * Hook to retrieve the schedule (sessions) for the currently authenticated User (CANDIDAT)
 */
export function useStudentSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Assuming the backend has a /sessions/student or /partner/sessions endpoint
            // scoped to the authenticated student. We will use the generic generic auth-inferred endpoint.
            const { data, error } = await api.get<Session[]>("/sessions/my-schedule");

            if (error) throw new Error(error);
            setSessions(data || []);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement du planning");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return { sessions, loading, error, refetch: fetchSessions };
}
