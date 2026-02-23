import { useState, useCallback, useEffect } from "react";
import { MOCK_SCHOOLS, DrivingSchool } from "@/lib/data";

/**
 * Temporary hook using mock data. 
 * Will be replaced with real API calls in Phase 1-2.
 */
export function useSchools(city?: string) {
    const [schools, setSchools] = useState<DrivingSchool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchools = useCallback(async () => {
        setLoading(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 400));
            const filtered = city
                ? MOCK_SCHOOLS.filter(s => s.city === city)
                : MOCK_SCHOOLS;
            setSchools(filtered);
        } catch (err) {
            setError("Impossible de charger les auto-écoles");
        } finally {
            setLoading(false);
        }
    }, [city]);

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    return { schools, loading, error, refetch: fetchSchools };
}

export function useSchool(id: string) {
    const [school, setSchool] = useState<DrivingSchool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchool = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 300));
                const found = MOCK_SCHOOLS.find(s => s.id === id) || null;
                setSchool(found);
                if (!found) setError("Auto-école introuvable");
            } catch {
                setError("Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };
        fetchSchool();
    }, [id]);

    return { school, loading, error };
}
