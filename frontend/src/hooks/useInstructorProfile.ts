"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api/client";
import { Monitor } from "@/types/partner";

/**
 * Hook to retrieve the Monitor Profile for the currently authenticated User
 */
export function useInstructorProfile() {
    const [monitorProfile, setMonitorProfile] = useState<Monitor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await api.get<Monitor>("/monitors/me");

            if (error) throw new Error(error);
            setMonitorProfile(data || null);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement du profil Moniteur");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { monitorProfile, loading, error, refetch: fetchProfile };
}
