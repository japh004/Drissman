import { useState, useCallback, useEffect } from "react";
import { MOCK_SCHOOLS, DrivingSchool, Offer } from "@/lib/data";

/**
 * Hook that merges:
 * 1. The 2 test mock schools
 * 2. Any "real" school created via admin Settings (stored in localStorage "admin_school")
 *    — with offers injected from localStorage "offers"
 */

interface AdminOffer {
    id: string;
    name: string;
    description: string;
    price: number;
    hours: number;
    permitType: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    modules: { id: string; name: string; category: string; requiredHours: number }[];
    enrollmentsCount: number;
}

function adminOfferToSchoolOffer(a: AdminOffer): Offer {
    return {
        id: a.id,
        title: a.name,
        price: a.price,
        description: a.description,
        type: a.permitType === "A" ? "Permis A" : a.permitType === "B" ? "Permis B" : "Permis B",
        features: a.modules.map(m => `${m.name} (${m.requiredHours}h)`),
    };
}

function loadAdminSchools(): DrivingSchool[] {
    if (typeof window === "undefined") return [];
    try {
        // Load admin-created offers
        const offersRaw = localStorage.getItem("drissman_offers");
        const adminOffers: AdminOffer[] = offersRaw ? JSON.parse(offersRaw) : [];
        const activeOffers = adminOffers.filter(o => o.status === "ACTIVE" || o.status === "DRAFT");

        // Load school settings (name, address, etc.)
        const settingsRaw = localStorage.getItem("school_settings");
        const settings = settingsRaw ? JSON.parse(settingsRaw) : null;

        // If no active offers AND no settings, no real school to show
        if (activeOffers.length === 0 && !settings) return [];

        // Create a "real" school entry from admin data
        const schoolName = settings?.name || "Auto-École Nouvelle Génération";
        const schoolAddress = settings?.address || "Yaoundé, Cameroun";
        const schoolCity = settings?.city || "Yaoundé";
        const schoolDesc = settings?.description || "Une auto-école moderne pour une réussite assurée.";

        const realSchool: DrivingSchool = {
            id: "admin-school",
            name: schoolName,
            address: schoolAddress,
            city: schoolCity,
            price: activeOffers[0]?.price || 0,
            rating: 4.9,
            reviewCount: 12,
            imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop",
            coordinates: schoolCity === "Douala" ? [4.0511, 9.7679] : [3.8480, 11.5021],
            features: activeOffers.length > 0
                ? [...new Set(activeOffers.map(o => `Permis ${o.permitType}`))]
                : ["Formation complète", "Code & Conduite"],
            isVerified: true,
            description: schoolDesc,
            offers: activeOffers.map(adminOfferToSchoolOffer),
            reviews: [
                { id: "rev-1", user: "Mamadou B.", rating: 5, date: "Aujourd'hui", comment: "Excellente formation, très recommandé !" }
            ],
        };

        // Only return if it has offers (as requested: "relie le catalogue aux offres")
        // but let's be generous: if settings exist, show it as "Ouverture prochaine" or similar if no offers
        return activeOffers.length > 0 ? [realSchool] : [];
    } catch {
        return [];
    }
}

export function useSchools(city?: string) {
    const [schools, setSchools] = useState<DrivingSchool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchools = useCallback(async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

            // Merge mock schools + admin-created real schools
            const allSchools = [...MOCK_SCHOOLS, ...loadAdminSchools()];

            const filtered = city
                ? allSchools.filter(s => s.city === city)
                : allSchools;
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
                await new Promise(resolve => setTimeout(resolve, 200));

                // Check mock schools first
                let found = MOCK_SCHOOLS.find(s => s.id === id) || null;

                // If not in mocks, check admin school
                if (!found) {
                    const adminSchools = loadAdminSchools();
                    found = adminSchools.find(s => s.id === id) || null;
                }

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
