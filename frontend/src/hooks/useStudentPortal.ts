"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";

export interface StudentPortalData {
    session: {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        status: string;
        offerName: string;
    } | null;
    curriculum: Array<{
        id: string;
        name: string;
        totalHours: number;
        consumedHours: number;
        category: string;
        orderIndex: number;
    }>;
    upcomingSchedule: Array<{
        id: string;
        topic: string;
        date: string;
        startTime: string;
        endTime: string;
        monitorName: string;
        moduleName: string;
    }>;
    summary: {
        overallProgress: number;
        totalHoursConsumed: number;
        totalHoursPurchased: number;
        nextExamDate: string | null;
    };
}

export function useStudentPortal() {
    const [data, setData] = useState<StudentPortalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPortalData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await api.get<StudentPortalData>("/student/portal");

            if (error) throw new Error(error);
            setData(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortalData();
    }, [fetchPortalData]);

    return { data, loading, error, refetch: fetchPortalData };
}
