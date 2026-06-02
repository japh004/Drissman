"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { superAdminService, GlobalStatsDto } from "@/lib/superadmin-service";
import { Loader2, Users, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<GlobalStatsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchStats = async () => {
            try {
                const data = await superAdminService.getStats(token);
                setStats(data);
            } catch (err: any) {
                toast.error(err.message || "Erreur lors du chargement des statistiques");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-snow mb-1">Vue d'ensemble</h1>
                <p className="text-mist text-sm">Statistiques globales de la plateforme Drissman.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-rose-500/10 p-3 rounded-xl">
                            <Users className="h-6 w-6 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-mist uppercase tracking-wider">Total Utilisateurs</p>
                            <h3 className="text-2xl font-black text-snow">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl">
                            <Building2 className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-mist uppercase tracking-wider">Auto-écoles Inscrits</p>
                            <h3 className="text-2xl font-black text-snow">{stats.totalSchools}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-500/10 p-3 rounded-xl">
                            <AlertCircle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-mist uppercase tracking-wider">En attente de validation</p>
                            <h3 className="text-2xl font-black text-snow">{stats.pendingSchools}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
