"use client";

import { useState } from "react";
import { usePartnerEnrollments, useMyEnrollments, useAuth } from "@/hooks";
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
    ArrowUpRight,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    FileText,
    AlertCircle,
    UserCircle,
    BadgeCheck
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { partnerService } from "@/lib/api/partners";
import { toast } from "sonner";

export default function BookingsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "SCHOOL_ADMIN";

    return isAdmin ? <AdminBookings schoolId={user?.schoolId || ""} /> : <StudentBookings />;
}

// ─── ADMIN VIEW (REGISTRE) ───
function AdminBookings({ schoolId }: { schoolId: string }) {
    const { enrollments, loading, error, refetch } = usePartnerEnrollments(schoolId);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filtered = enrollments.filter(e => {
        const matchesSearch =
            e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e as any).studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.offerName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await partnerService.updateEnrollmentStatus(id, status as any);
            toast.success("Statut mis à jour");
            refetch();
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Registre <span className="text-signal">Élèves</span></h1>
                    <p className="text-mist font-medium">Gérez les inscriptions, validez les dossiers et suivez les paiements.</p>
                </div>

                <div className="flex bg-white/5 border border-white/5 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setStatusFilter("ALL")}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === "ALL" ? "bg-signal text-asphalt" : "text-mist hover:text-snow"}`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setStatusFilter("PENDING")}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === "PENDING" ? "bg-signal text-asphalt" : "text-mist hover:text-snow"}`}
                    >
                        À Valider
                    </button>
                    <button
                        onClick={() => setStatusFilter("VALIDATED")}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === "VALIDATED" ? "bg-signal text-asphalt" : "text-mist hover:text-snow"}`}
                    >
                        Confirmés
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="px-4">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-mist/30 group-focus-within:text-signal transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par numéro de dossier, nom de l'élève ou formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 pl-16 pr-6 bg-white/[0.03] border border-white/5 rounded-[2rem] text-snow font-bold focus:ring-2 focus:ring-signal/20 focus:border-signal/30 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table / Grid */}
            <div className="px-4 space-y-6">
                {filtered.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/10 rounded-[4rem]">
                        <Users className="h-16 w-16 text-mist/10 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-snow uppercase tracking-tight italic">Aucun résultat</h3>
                        <p className="text-mist text-xs max-w-sm mx-auto uppercase font-bold tracking-widest opacity-60">Aucune inscription ne correspond à vos critères de recherche.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((e) => (
                            <div key={e.id} className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-300">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                                    {/* Student Info */}
                                    <div className="flex items-center gap-5 min-w-[280px]">
                                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-signal group-hover:scale-110 transition-transform duration-500">
                                            {(e as any).studentName?.[0] || 'E'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-snow group-hover:text-signal transition-colors uppercase tracking-tight">
                                                {(e as any).studentName || "Élève Anonyme"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-signal/60" />
                                                <span className="text-[10px] font-black text-mist uppercase tracking-widest">Dossier #00{e.id.slice(0, 4)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Offer Info */}
                                    <div className="lg:flex-1 w-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <GraduationCap className="h-3.5 w-3.5 text-signal" />
                                            <span className="text-[10px] font-black text-mist uppercase tracking-[0.2em]">{e.offerName}</span>
                                        </div>
                                        {e.trainingPeriodName && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 w-fit">
                                                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                                <span className="text-xs font-bold text-snow">{e.trainingPeriodName}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pricing / Status */}
                                    <div className="flex items-center gap-12 w-full lg:w-auto">
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-snow tabular-nums tracking-tighter">{formatPrice(e.offerPrice)}</div>
                                            <div className="text-[8px] font-black text-mist uppercase tracking-widest">Formation Totale</div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={e.status} />

                                            {e.status === "PENDING" && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleUpdateStatus(e.id, "VALIDATED")}
                                                        className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                                                        title="Valider l'inscription"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(e.id, "REJECTED")}
                                                        className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                                        title="Refuser"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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

// ─── STUDENT VIEW ───
function StudentBookings() {
    const { enrollments, loading, error } = useMyEnrollments();

    if (loading) return <LoadingScreen />;

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Mes <span className="text-signal">Inscriptions</span></h1>
                    <p className="text-mist font-medium">Gérez vos candidatures et accédez à vos sessions de formation.</p>
                </div>
                <Link href="/" className="px-8 py-4 bg-signal text-asphalt font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-signal/80 transition-all flex items-center gap-3 shadow-lg shadow-signal/10">
                    <Plus className="h-4 w-4" />
                    Explorer le Catalogue
                </Link>
            </div>

            <div className="space-y-6">
                {enrollments.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <FileText className="h-16 w-16 text-mist/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-snow uppercase tracking-tight italic">Aucun dossier en cours</h3>
                        <p className="text-mist text-sm max-w-sm mx-auto font-bold uppercase tracking-widest opacity-60">Prêt à démarrer l&apos;aventure ? Choisissez votre formation dans notre catalogue.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {enrollments.map((e) => (
                            <div key={e.id} className="group bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-signal/10 border border-signal/20 flex items-center justify-center text-signal group-hover:scale-110 transition-transform duration-500">
                                            <GraduationCap className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <StatusBadge status={e.status} />
                                                <span className="text-[9px] font-black text-mist uppercase tracking-tighter opacity-40">#DOSS-{e.id.slice(0, 6)}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-snow tracking-tight uppercase group-hover:text-signal transition-colors leading-none">{e.offerName}</h3>
                                            <p className="text-mist font-bold mt-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                                <BadgeCheck className="h-3.5 w-3.5 text-signal" /> {e.schoolName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-3xl font-black text-snow tracking-tighter tabular-nums">{formatPrice(e.offerPrice || 0)}</div>
                                        <div className="text-[8px] font-black text-mist uppercase tracking-widest">Montant Total TTC</div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-10 items-center">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-mist uppercase tracking-widest">Promotion / Session</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-snow">
                                            <Calendar className="h-4 w-4 text-signal" />
                                            {e.trainingPeriodName || 'En attente d\'affectation'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-mist uppercase tracking-widest">Dernière mise à jour</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-snow">
                                            <Clock className="h-4 w-4 text-signal" />
                                            {new Date(e.createdAt || '').toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </div>
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

// ─── HELPERS ───
function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 text-signal animate-spin" />
            <p className="text-[10px] font-black text-mist uppercase tracking-widest animate-pulse">Chargement du registre...</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: any = {
        PENDING: { label: "À Valider", color: "text-mist", bgColor: "bg-white/5 border-white/10" },
        VALIDATED: { label: "Confirmé", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
        REJECTED: { label: "Refusé", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
        IN_PROGRESS: { label: "En Cours", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
        COMPLETED: { label: "Terminé", color: "text-signal", bgColor: "bg-signal/10 border-signal/20" },
    };
    const s = config[status] || config.PENDING;
    return (
        <div className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${s.bgColor} ${s.color}`}>
            {s.label}
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg
            className={`animate-spin ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );
}
