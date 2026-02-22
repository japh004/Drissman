import { useState, useEffect, useCallback } from 'react';
import { partnerService } from '@/lib/api/partners';
import { Session, CreateSessionRequest, SessionStatus } from '@/types/partner';
import { toast } from 'sonner';

export function useSessions(schoolId: string) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await partnerService.getSessions(schoolId);
            setSessions(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement des sessions");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const createSession = async (payload: CreateSessionRequest) => {
        try {
            const newSession = await partnerService.createSession(payload);
            setSessions(prev => [...prev, newSession]);
            return newSession;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création de la session");
            throw err;
        }
    };

    const updateStatus = async (id: string, status: SessionStatus) => {
        try {
            const updated = await partnerService.updateSessionStatus(id, status);
            setSessions(prev => prev.map(s => s.id === id ? updated : s));
            return updated;
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
            throw err;
        }
    };

    const deleteSession = async (id: string) => {
        try {
            await partnerService.deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            toast.error("Erreur lors de la suppression");
            throw err;
        }
    };

    return {
        sessions,
        loading,
        error,
        refetch: fetchSessions,
        createSession,
        updateStatus,
        deleteSession
    };
}
