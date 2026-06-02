"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { superAdminService, School } from "@/lib/superadmin-service";
import { Loader2, CheckCircle2, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminSchoolsPage() {
    const { token } = useAuth();
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState<string | null>(null);

    const fetchSchools = async () => {
        if (!token) return;
        try {
            const data = await superAdminService.getPendingSchools(token);
            setSchools(data);
        } catch (err: any) {
            toast.error(err.message || "Erreur lors du chargement des auto-écoles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, [token]);

    const handleValidate = async (schoolId: string) => {
        if (!token) return;
        setValidating(schoolId);
        try {
            await superAdminService.validateSchool(schoolId, token);
            toast.success("Auto-école validée avec succès");
            setSchools(schools.filter((s) => s.id !== schoolId));
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la validation");
        } finally {
            setValidating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-snow mb-1">Validation des Auto-écoles</h1>
                <p className="text-mist text-sm">Liste des auto-écoles en attente de vérification.</p>
            </div>

            {schools.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-snow mb-2">Tout est à jour !</h3>
                    <p className="text-mist">Aucune auto-école en attente de validation.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {schools.map((school) => (
                        <div
                            key={school.id}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-rose-500/10 p-3 rounded-xl hidden sm:block">
                                    <Building2 className="h-6 w-6 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-snow">{school.name}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-mist text-sm">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {school.address || "Adresse non renseignée"}, {school.city}
                                        </div>
                                    </div>
                                    <p className="text-mist/70 text-xs mt-2 line-clamp-2 max-w-2xl">
                                        {school.description || "Aucune description fournie par l'auto-école."}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleValidate(school.id)}
                                disabled={validating === school.id}
                                className="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {validating === school.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Valider
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
