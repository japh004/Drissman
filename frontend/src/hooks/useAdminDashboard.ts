"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";

export interface RecentActivity {
    id: string;
    title: string;
    description: string;
    type: string;
    timestamp: string;
}

export interface UpcomingSession {
    id: string;
    monitorName: string;
    studentName: string;
    date: string;
    startTime: string;
    endTime: string;
    meetingPoint: string;
    status: string;
}

export interface AdminDashboardStats {
    activeCandidates: number;
    totalOffers: number;
    totalModules: number;
    todaySessions: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingValidations: number;
    recentActivities: RecentActivity[];
    upcomingSessions: UpcomingSession[];
}

export function useAdminDashboard() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await api.get<AdminDashboardStats>("/schools/admin/dashboard");

            if (error) throw new Error(error);
            setStats(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des statistiques du tableau de bord");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}
