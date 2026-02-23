"use client";

import { useAuth } from "@/hooks";
import {
    Users, GraduationCap, DollarSign, CalendarDays,
    TrendingUp, ArrowUpRight, Clock, BookOpen, Inbox
} from "lucide-react";

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

            {/* KPI Cards — zeroed out for real accounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Élèves actifs" value={0} icon={GraduationCap} color="blue" />
                <StatCard title="CA Mensuel" value="0 F" icon={DollarSign} color="green" />
                <StatCard title="Séances aujourd'hui" value={0} icon={CalendarDays} color="signal" />
                <StatCard title="Inscriptions en attente" value={0} icon={Clock} color="orange" />
            </div>

            {/* Mini stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="Formules" value={0} icon={BookOpen} />
                <MiniStat label="Moniteurs" value={0} icon={Users} />
                <MiniStat label="Inscriptions" value={0} icon={TrendingUp} />
                <MiniStat label="Taux réussite" value="—" icon={ArrowUpRight} />
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Upcoming sessions — empty state */}
                <div className="lg:col-span-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <h2 className="text-lg font-black text-snow mb-4">Séances du jour</h2>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CalendarDays className="h-10 w-10 text-mist/20 mb-3" />
                        <p className="text-sm text-mist/50">Aucune séance programmée aujourd&apos;hui</p>
                        <p className="text-xs text-mist/30 mt-1">Créez des sessions dans l&apos;onglet Sessions</p>
                    </div>
                </div>

                {/* Recent activity — empty state */}
                <div className="lg:col-span-2 bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <h2 className="text-lg font-black text-snow mb-4">Activité récente</h2>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Inbox className="h-10 w-10 text-mist/20 mb-3" />
                        <p className="text-sm text-mist/50">Aucune activité récente</p>
                        <p className="text-xs text-mist/30 mt-1">Les événements apparaîtront ici</p>
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
