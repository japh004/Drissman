"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";

export interface PartnerStats {
    revenue: string;
    enrollments: number;
    successRate: string;
    upcomingLessons: number;
    revenueGrowth: number;
    enrollmentGrowth: number;
}

export function usePartnerStats() {
    const [stats, setStats] = useState<PartnerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await api.get<PartnerStats>("/partner/stats");

            if (error) throw new Error(error);
            setStats(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des statistiques");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}
