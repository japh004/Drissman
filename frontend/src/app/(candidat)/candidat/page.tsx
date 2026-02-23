"use client";

import { useAuth, useLocalStorage } from "@/hooks";
import { CalendarDays, Clock, BookOpen, TrendingUp, ArrowRight, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface Enrollment {
    id: string;
    offerId: string;
    offerName: string;
    price: number;
    hours: number;
    permitType: string;
    modules: { id: string; name: string; category: string; requiredHours: number }[];
    status: "PENDING" | "ACTIVE" | "COMPLETED" | "REFUSED";
    enrolledAt: string;
}

export default function CandidatDashboard() {
    const { user } = useAuth();
    const [enrollments] = useLocalStorage<Enrollment[]>("candidat_enrollments", []);

    const activeEnrollment = enrollments.find(e => e.status === "ACTIVE" || e.status === "PENDING");
    const hasEnrollment = !!activeEnrollment;

    const stats = {
        hoursCompleted: 0,
        hoursRequired: activeEnrollment?.hours || 0,
        sessionsThisWeek: 0,
        globalProgress: 0,
    };

    const nextSession = null; // Will be populated from API
    const recentSessions: { module: string; date: string; icon: string }[] = [];

    return (
        <PageTransition className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-3xl font-black text-snow">Bienvenue, {user?.firstName} 👋</h1>
                <p className="text-mist mt-1">Suivez votre parcours de formation.</p>
            </div>

            {/* Quick stats */}
            <StaggerContainer className="grid sm:grid-cols-3 gap-4">
                <StaggerItem>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-5">
                        <Clock className="h-5 w-5 text-blue-400 opacity-60 mb-2" />
                        <p className="text-2xl font-black text-snow">
                            {stats.hoursCompleted}/{stats.hoursRequired}h
                        </p>
                        <p className="text-xs text-mist/60">Heures effectuées</p>
                        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${stats.hoursRequired > 0 ? Math.round((stats.hoursCompleted / stats.hoursRequired) * 100) : 0}%` }} />
                        </div>
                    </div>
                </StaggerItem>
                <StaggerItem>
                    <div className="bg-gradient-to-br from-signal/10 to-amber-500/5 rounded-2xl border border-signal/20 p-5">
                        <CalendarDays className="h-5 w-5 text-signal opacity-60 mb-2" />
                        <p className="text-2xl font-black text-snow">{stats.sessionsThisWeek}</p>
                        <p className="text-xs text-mist/60">Séances cette semaine</p>
                    </div>
                </StaggerItem>
                <StaggerItem>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                        <TrendingUp className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                        <p className="text-2xl font-black text-snow">{stats.globalProgress}%</p>
                        <p className="text-xs text-mist/60">Progression globale</p>
                        {stats.globalProgress > 0 && (
                            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{ width: `${stats.globalProgress}%` }} />
                            </div>
                        )}
                    </div>
                </StaggerItem>
            </StaggerContainer>

            {/* Next session */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-lg font-black text-snow mb-4">Prochaine séance</h2>
                {nextSession ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-signal/5 border border-signal/20">
                        {/* Will render session data */}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <CalendarDays className="h-10 w-10 text-mist/15 mb-3" />
                        <p className="text-sm text-mist/50">Aucune séance programmée</p>
                        <p className="text-[10px] text-mist/30 mt-1">Vos prochaines séances apparaîtront ici une fois planifiées par votre auto-école</p>
                    </div>
                )}
            </div>

            {/* Recent sessions mini-history */}
            {recentSessions.length > 0 && (
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <h2 className="text-sm font-bold text-snow mb-3">Dernières séances</h2>
                    <div className="space-y-2">
                        {recentSessions.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02]">
                                <span className="text-lg">{s.icon}</span>
                                <span className="text-xs text-snow flex-1">{s.module}</span>
                                <span className="text-[10px] text-mist/40">{s.date}</span>
                                <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg">✓</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My offer / enrollment */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-lg font-black text-snow mb-4">Ma Formule</h2>
                {hasEnrollment && activeEnrollment ? (
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl"><BookOpen className="h-6 w-6 text-blue-400" /></div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-snow">{activeEnrollment.offerName}</p>
                            <p className="text-xs text-mist/60">Permis {activeEnrollment.permitType} · {activeEnrollment.modules.length} module{activeEnrollment.modules.length > 1 ? "s" : ""} · {activeEnrollment.hours}h</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${activeEnrollment.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-signal/10 text-signal"}`}>
                            {activeEnrollment.status === "ACTIVE" ? "✓ Validé" : "⏳ En attente"}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <BookOpen className="h-10 w-10 text-mist/15 mb-3" />
                        <p className="text-sm text-mist/50">Pas encore inscrit à une formule</p>
                        <Link href="/search"
                            className="mt-3 flex items-center gap-1 text-xs font-bold text-signal bg-signal/10 px-4 py-2 rounded-xl hover:bg-signal/20 transition-all">
                            Parcourir les offres <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Motivation badges */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-4 w-4 text-signal" />
                    <h2 className="text-sm font-bold text-snow">Badges & Motivation</h2>
                </div>
                {stats.hoursCompleted === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <Sparkles className="h-8 w-8 text-mist/15 mb-2" />
                        <p className="text-sm text-mist/50">Vos récompenses apparaîtront ici</p>
                        <p className="text-[10px] text-mist/30 mt-1">Complétez des séances pour débloquer des badges</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { icon: "🎯", label: "Première séance", unlocked: stats.hoursCompleted >= 1 },
                            { icon: "📖", label: "5 heures de code", unlocked: stats.hoursCompleted >= 5 },
                            { icon: "🚗", label: "10 heures conduite", unlocked: stats.hoursCompleted >= 10 },
                            { icon: "🏆", label: "Mi-parcours", unlocked: stats.globalProgress >= 50 },
                        ].map((badge, i) => (
                            <div key={i} className={`p-3 rounded-xl border text-center transition-all ${badge.unlocked ? "bg-signal/5 border-signal/20" : "bg-white/[0.02] border-white/[0.04] opacity-30"}`}>
                                <span className="text-2xl block mb-1">{badge.icon}</span>
                                <p className="text-[10px] font-bold text-snow">{badge.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
