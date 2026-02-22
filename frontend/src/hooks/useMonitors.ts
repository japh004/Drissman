import { useState, useEffect, useCallback } from 'react';
import { partnerService } from '@/lib/api/partners';
import { Monitor, CreateMonitorRequest } from '@/types/partner';
import { toast } from 'sonner';

export function useMonitors(schoolId: string) {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMonitors = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await partnerService.getMonitors(schoolId);
            setMonitors(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors du chargement des moniteurs");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchMonitors();
    }, [fetchMonitors]);

    const createMonitor = async (payload: CreateMonitorRequest) => {
        try {
            const newMonitor = await partnerService.createMonitor(payload);
            setMonitors(prev => [...prev, newMonitor]);
            return newMonitor;
        } catch (err: any) {
            throw err;
        }
    };

    const updateMonitor = async (id: string, payload: CreateMonitorRequest) => {
        try {
            const updated = await partnerService.updateMonitor(id, payload);
            setMonitors(prev => prev.map(m => m.id === id ? updated : m));
            return updated;
        } catch (err: any) {
            throw err;
        }
    };

    const deleteMonitor = async (id: string) => {
        try {
            await partnerService.deleteMonitor(id);
            setMonitors(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            throw err;
        }
    };

    return {
        monitors,
        loading,
        error,
        refetch: fetchMonitors,
        createMonitor,
        updateMonitor,
        deleteMonitor
    };
}
