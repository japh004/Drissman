"use client";

import { useAuth } from "@/hooks";
import { Users, BookOpen, GraduationCap, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const { user } = useAuth();

    const stats = [
        { label: "Candidats Actifs", value: "142", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Offres", value: "8", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Modules", value: "24", icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Sessions Aujourd'hui", value: "12", icon: CalendarDays, color: "text-amber-400", bg: "bg-amber-400/10" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Bonjour, {user?.firstName}
                </h1>
                <p className="text-white/60">
                    Voici un aperçu de l'activité de votre auto-école aujourd'hui.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-asphalt-light border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                        <h3 className="text-white/60 text-sm font-medium mb-1">{stat.label}</h3>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-asphalt-light border border-white/5 rounded-2xl p-6 min-h-[300px]">
                    <h2 className="text-xl font-bold text-white mb-4">Activité Récente</h2>
                    <div className="flex items-center justify-center h-48 text-white/40">
                        Aucune activité récente
                    </div>
                </div>

                <div className="bg-asphalt-light border border-white/5 rounded-2xl p-6 min-h-[300px]">
                    <h2 className="text-xl font-bold text-white mb-4">Prochaines Sessions</h2>
                    <div className="flex items-center justify-center h-48 text-white/40">
                        Aucune session planifiée
                    </div>
                </div>
            </div>
        </div>
    );
}
