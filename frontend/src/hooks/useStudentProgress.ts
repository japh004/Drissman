"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";

export interface StudentProgress {
    codeProgress: number;
    codeExamsCompleted: number;
    codeTotalExams: number;
    conduiteProgress: number;
    conduiteHoursCompleted: number;
    conduiteTotalHours: number;
    nextExamDate: string;
    nextExamType: string | null;
}

export function useStudentProgress() {
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProgress = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await api.get<StudentProgress>("/student/progress");

            if (error) throw new Error(error);
            setProgress(data || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement de la progression");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    return { progress, loading, error, refetch: fetchProgress };
}
