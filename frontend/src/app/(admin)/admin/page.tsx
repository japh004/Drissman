"use client";

import { useAuth } from "@/hooks";
import {
    Users, GraduationCap, DollarSign, CalendarDays,
    TrendingUp, ArrowUpRight, Clock, BookOpen
} from "lucide-react";

// Temporary mock data — will connect to API in later phases
const mockStats = {
    totalStudents: 47,
    activeEnrollments: 32,
    monthlyRevenue: 2_450_000,
    sessionsToday: 8,
    pendingEnrollments: 5,
    totalOffers: 4,
    totalMonitors: 3,
    completionRate: 78,
};

const recentActivity = [
    { id: 1, type: "enrollment", text: "Sarah K. s'est inscrite à Permis B Classique", time: "Il y a 2h" },
    { id: 2, type: "session", text: "Séance de conduite terminée — Moniteur Jean-Paul", time: "Il y a 3h" },
    { id: 3, type: "payment", text: "Paiement reçu de Junior M. — 65 000 FCFA", time: "Il y a 5h" },
    { id: 4, type: "enrollment", text: "Alice K. — inscription en attente de validation", time: "Hier" },
    { id: 5, type: "session", text: "3 séances de code planifiées pour demain", time: "Hier" },
];

const upcomingSessions = [
    { id: 1, module: "Code de la route", monitor: "Marie D.", time: "09:00 - 11:00", students: 12, type: "CODE" },
    { id: 2, module: "Conduite B", monitor: "Jean-Paul", time: "11:00 - 12:00", students: 1, type: "CONDUITE" },
    { id: 3, module: "Conduite B", monitor: "Jean-Paul", time: "14:00 - 15:00", students: 1, type: "CONDUITE" },
    { id: 4, module: "Examen Blanc", monitor: "Marie D.", time: "15:00 - 17:00", students: 6, type: "EXAMEN" },
];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-snow">
                    Bonjour, {user?.firstName} 👋
                </h1>
                <p className="text-mist mt-1">
                    Voici un aperçu de votre auto-école aujourd&apos;hui.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Élèves actifs"
                    value={mockStats.totalStudents}
                    icon={GraduationCap}
                    trend="+12%"
                    color="blue"
                />
                <StatCard
                    title="CA Mensuel"
                    value={`${formatCurrency(mockStats.monthlyRevenue)} F`}
                    icon={DollarSign}
                    trend="+8%"
                    color="green"
                />
                <StatCard
                    title="Séances aujourd'hui"
                    value={mockStats.sessionsToday}
                    icon={CalendarDays}
                    color="signal"
                />
                <StatCard
                    title="Inscriptions en attente"
                    value={mockStats.pendingEnrollments}
                    icon={Clock}
                    color="orange"
                    alert
                />
            </div>

            {/* Mini stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="Formules" value={mockStats.totalOffers} icon={BookOpen} />
                <MiniStat label="Moniteurs" value={mockStats.totalMonitors} icon={Users} />
                <MiniStat label="Inscriptions" value={mockStats.activeEnrollments} icon={TrendingUp} />
                <MiniStat label="Taux réussite" value={`${mockStats.completionRate}%`} icon={ArrowUpRight} />
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Upcoming sessions */}
                <div className="lg:col-span-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <h2 className="text-lg font-black text-snow mb-4">Séances du jour</h2>
                    <div className="space-y-3">
                        {upcomingSessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-all"
                            >
                                <div className={`
                                    p-2.5 rounded-xl text-xs font-black
                                    ${session.type === "CODE" ? "bg-blue-500/10 text-blue-400" :
                                        session.type === "CONDUITE" ? "bg-signal/10 text-signal" :
                                            "bg-purple-500/10 text-purple-400"}
                                `}>
                                    {session.type === "CODE" ? "📖" : session.type === "CONDUITE" ? "🚗" : "📝"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-snow truncate">{session.module}</p>
                                    <p className="text-xs text-mist/60">{session.monitor} · {session.students} élève{session.students > 1 ? "s" : ""}</p>
                                </div>
                                <span className="text-xs font-mono text-mist bg-white/5 px-2.5 py-1 rounded-lg">
                                    {session.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent activity */}
                <div className="lg:col-span-2 bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <h2 className="text-lg font-black text-snow mb-4">Activité récente</h2>
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-3 group">
                                <div className={`
                                    mt-1 h-2 w-2 rounded-full shrink-0
                                    ${activity.type === "enrollment" ? "bg-blue-400" :
                                        activity.type === "session" ? "bg-signal" : "bg-green-400"}
                                `} />
                                <div className="min-w-0">
                                    <p className="text-sm text-snow/80 leading-snug">{activity.text}</p>
                                    <p className="text-xs text-mist/40 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// -- Sub-components --

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    color: "blue" | "green" | "signal" | "orange";
    alert?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, color, alert }: StatCardProps) {
    const colorMap = {
        blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
        green: "from-green-500/10 to-green-600/5 border-green-500/20 text-green-400",
        signal: "from-signal/10 to-amber-500/5 border-signal/20 text-signal",
        orange: "from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-400",
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} rounded-2xl border p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
            <div className="flex items-start justify-between mb-3">
                <Icon className="h-5 w-5 opacity-60" />
                {alert && (
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400 animate-pulse" />
                )}
            </div>
            <p className="text-2xl font-black text-snow">{value}</p>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-mist/60">{title}</p>
                {trend && (
                    <span className="text-xs font-bold text-green-400 flex items-center gap-0.5">
                        <ArrowUpRight className="h-3 w-3" />
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 flex items-center gap-3">
            <Icon className="h-4 w-4 text-mist/40" />
            <div>
                <p className="text-lg font-black text-snow leading-none">{value}</p>
                <p className="text-[10px] text-mist/50 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
        </div>
    );
}
