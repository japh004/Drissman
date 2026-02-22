"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";
import { Enrollment } from "@/types/partner";
import { partnerService } from "@/lib/api/partners";

export function usePartnerEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEnrollments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await partnerService.getEnrollments();
            setEnrollments(data);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des inscriptions");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return { enrollments, loading, error, refetch: fetchEnrollments };
}
