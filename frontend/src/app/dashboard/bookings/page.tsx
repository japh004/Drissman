"use client";

import { useMyEnrollments } from "@/hooks";
import {
    Users,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    ChevronRight,
    Search,
    GraduationCap,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function BookingsPage() {
    const { enrollments, loading, error } = useMyEnrollments();

    if (loading) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-mist uppercase tracking-widest hover:text-signal transition-colors mb-4">
                        <ArrowLeft className="h-3 w-3" />
                        Tableau de bord
                    </Link>
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Mes <span className="text-signal">Inscriptions</span></h1>
                    <p className="text-mist font-medium">Gérez vos candidatures aux sessions de formation.</p>
                </div>

                <Link href="/" className="px-6 py-3 rounded-2xl bg-signal text-asphalt font-black uppercase text-[10px] tracking-widest hover:bg-signal/80 transition-all flex items-center gap-2">
                    Nouvelle Inscription
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>

            {/* List */}
            <div className="px-4 space-y-6">
                {enrollments.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <Users className="h-16 w-16 text-mist/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-snow mb-2">Aucune inscription en cours</h3>
                        <p className="text-mist text-sm max-w-sm mx-auto">Vous n&apos;avez pas encore de candidatures validées ou en attente. Explorez le catalogue pour commencer votre formation.</p>
                        <Link href="/" className="inline-block mt-8 text-signal font-black uppercase text-[10px] tracking-widest hover:underline">Voir le catalogue</Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="group overflow-hidden bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="hidden sm:flex h-16 w-16 rounded-[1.5rem] bg-signal/10 items-center justify-center border border-signal/20 text-signal group-hover:scale-110 transition-transform">
                                            <GraduationCap className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <StatusTag status={enrollment.status} />
                                                <span className="text-[10px] font-black text-mist uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">#{enrollment.id.slice(0, 8)}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-snow tracking-tight uppercase group-hover:text-signal transition-colors">{enrollment.offerName}</h3>
                                            <p className="text-mist font-bold mt-1 uppercase text-[10px] tracking-wider">{enrollment.schoolName}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-2 text-right w-full md:w-auto">
                                        <div className="text-3xl font-black text-snow tracking-tighter">{formatPrice(enrollment.offerPrice || 0)}</div>
                                        <div className="text-[9px] font-black text-mist uppercase tracking-widest">Montant de la formation</div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-6 items-center">
                                    <div className="flex items-center gap-2 text-xs font-bold text-mist">
                                        <Calendar className="h-4 w-4 text-signal/50" />
                                        <span>Session : <span className="text-snow ml-1">{enrollment.trainingPeriodName || '—'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-mist">
                                        <Clock className="h-4 w-4 text-signal/50" />
                                        <span>Inscrit le : <span className="text-snow ml-1">{new Date(enrollment.createdAt || '').toLocaleDateString("fr-FR")}</span></span>
                                    </div>

                                    <div className="flex-1 md:flex justify-end hidden">
                                        <button className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-mist group-hover:bg-signal group-hover:text-asphalt transition-all">
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusTag({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: any }> = {
        ACTIVE: { label: "Validé", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
        PENDING: { label: "En attente", className: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
        CANCELLED: { label: "Refusé", className: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status] || { label: status, className: "bg-white/10 text-mist", icon: Clock };

    return (
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${className}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
        </span>
    );
}
