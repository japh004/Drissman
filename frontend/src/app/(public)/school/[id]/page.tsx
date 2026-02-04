"use client";

import { use, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SchoolDetailView } from "@/components/school/school-detail-view";
import { useSchool, useAuth } from "@/hooks";
import { toast } from "sonner";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function SchoolDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const { school, loading, error } = useSchool(id);
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.info("Veuillez vous connecter pour accéder aux offres détaillées.");
            router.push(`/login?redirect=/school/${id}`);
        }
    }, [isAuthenticated, authLoading, router, id]);

    if (loading || authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-asphalt flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-signal animate-spin mx-auto mb-4" />
                    <p className="text-mist">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !school) {
        notFound();
    }

    // Transform API data to match DrivingSchool type
    const schoolData = {
        ...school,
        price: school.offers?.[0]?.price || 150000,
        reviewCount: 25, // Would come from reviews API
        features: ["Permis B", "Conduite accompagnée", "Code en ligne"],
        isVerified: true,
        imageUrl: school.imageUrl || "/hero_student_dark.png",
        coordinates: [3.8480, 11.5021] as [number, number],
    };

    return <SchoolDetailView school={schoolData} />;
}
