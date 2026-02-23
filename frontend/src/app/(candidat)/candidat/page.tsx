"use client";

import { useAuth } from "@/hooks";
import { CalendarDays, Clock, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CandidatDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-snow">Bienvenue, {user?.firstName} 👋</h1>
                <p className="text-mist mt-1">Suivez votre parcours de formation.</p>
            </div>

            {/* Quick stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-5">
                    <Clock className="h-5 w-5 text-blue-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">22/35h</p>
                    <p className="text-xs text-mist/60">Heures effectuées</p>
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: "63%" }} />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-signal/10 to-amber-500/5 rounded-2xl border border-signal/20 p-5">
                    <CalendarDays className="h-5 w-5 text-signal opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">3</p>
                    <p className="text-xs text-mist/60">Séances cette semaine</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                    <TrendingUp className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">65%</p>
                    <p className="text-xs text-mist/60">Progression globale</p>
                </div>
            </div>

            {/* Next session */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-lg font-black text-snow mb-4">Prochaine séance</h2>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-signal/5 border border-signal/20">
                    <div className="bg-signal/10 p-3 rounded-xl text-2xl">🚗</div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-snow">Conduite B — Leçon en ville</p>
                        <p className="text-xs text-mist/60">Moniteur Jean-Paul · Véhicule #1</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-signal">Demain</p>
                        <p className="text-xs text-mist/40">11:00 - 12:00</p>
                    </div>
                </div>
            </div>

            {/* Offer details */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-lg font-black text-snow mb-4">Ma Formule</h2>
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-xl"><BookOpen className="h-6 w-6 text-blue-400" /></div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-snow">Permis B Classique</p>
                        <p className="text-xs text-mist/60">3 modules · 35 heures · 65 000 FCFA</p>
                    </div>
                    <Link href="/candidat/progression" className="flex items-center gap-1 text-xs text-signal font-bold hover:underline">
                        Voir détails <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
