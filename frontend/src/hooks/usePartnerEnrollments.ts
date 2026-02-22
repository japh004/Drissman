"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";
import { Enrollment } from "@/types/partner";
import { partnerService } from "@/lib/api/partners";

export function usePartnerEnrollments(schoolId?: string) {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEnrollments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // If schoolId is provided, use it. Otherwise rely on service/controller to handle auth context if supported, 
            // but partnerService.getEnrollments requires schoolId. 
            // The previous usePartnerBookings didn't pass schoolId, implying explicit endpoint usage.
            // But partnerService.getEnrollments(schoolId) is typed to require schoolId.
            // We need schoolId.
            if (!schoolId) {
                // Try to get from auth? Or assume caller passes it.
                // For now, if no schoolId, we might return empty or error.
                // But wait, the previous hook didn't take schoolId.
                // It called api.get('/partner/bookings').
                // We replaced that endpoint with /partner/enrollments which behaves similarly (uses Principal).
                // So we should call api.get('/partner/enrollments') directly here if we want to simulate old behavior,
                // OR use partnerService if we pass schoolId.
                // Let's use api.get('/partner/enrollments') to keep it simple and consistent with previous hook having no args.

                const { data, error } = await api.get<Enrollment[]>("/partner/enrollments");
                if (error) throw new Error(error);
                setEnrollments(data || []);
            } else {
                const data = await partnerService.getEnrollments(schoolId);
                setEnrollments(data);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement des inscriptions");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return { enrollments, loading, error, refetch: fetchEnrollments };
}
