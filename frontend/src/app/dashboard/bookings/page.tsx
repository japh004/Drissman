"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check, X, Eye, Loader2, Search, SlidersHorizontal, Users, Clock, CheckCircle, Calendar } from "lucide-react";
import { usePartnerEnrollments, useMyEnrollments, useAuth } from "@/hooks";
import { TabNavigation } from "@/components/dashboard/tab-navigation";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { enrollmentService } from "@/lib/api/enrollments";
import { Enrollment } from "@/types/partner";

export default function BookingsPage() {
    const { user } = useAuth();
    const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";
    return isSchoolAdmin ? <AdminBookings user={user} /> : <StudentBookings user={user} />;
}

function AdminBookings({ user }: { user: any }) {
    const { enrollments: bookings, loading, error, refetch } = usePartnerEnrollments(user?.schoolId);

    const updateStatus = async (id: string, status: 'ACTIVE' | 'CANCELLED') => {
        await enrollmentService.updateStatus(id, status);
        refetch();
    };

    return <BookingsList bookings={bookings} loading={loading} error={error} isSchoolAdmin={true} updateStatus={updateStatus} />;
}

function StudentBookings({ user }: { user: any }) {
    const { enrollments: bookings, loading, error } = useMyEnrollments();
    return <BookingsList bookings={bookings} loading={loading} error={error} isSchoolAdmin={false} />;
}

function BookingsList({ bookings, loading, error, isSchoolAdmin, updateStatus }: {
    bookings: Enrollment[],
    loading: boolean,
    error: string | null,
    isSchoolAdmin: boolean,
    updateStatus?: (id: string, status: any) => Promise<void>
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const handleConfirm = async (id: string) => {
        if (!updateStatus) return;
        try {
            await updateStatus(id, "ACTIVE");
            toast.success("Inscription confirmée !");
        } catch (err) {
            toast.error("Erreur confirmation");
        }
    };

    const handleReject = async (id: string) => {
        if (!updateStatus) return;
        try {
            await updateStatus(id, "CANCELLED");
            toast.success("Inscription refusée.");
        } catch (err) {
            toast.error("Erreur refus");
        }
    };

    // Stats
    const totalCount = bookings.length;
    const pendingCount = bookings.filter(b => b.status === "PENDING").length;
    const activeCount = bookings.filter(b => b.status === "ACTIVE" || b.status === "COMPLETED").length;

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesSearch = searchTerm === "" ||
                booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (booking.offerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (booking.userName || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, statusFilter]);

    return (
        <div className="space-y-8">
            {isSchoolAdmin && (
                <TabNavigation tabs={[
                    { label: "Inscriptions", href: "/dashboard/bookings", count: totalCount },
                    { label: "Factures", href: "/dashboard/invoices" },
                ]} />
            )}

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-snow">
                    {isSchoolAdmin ? "Gestion des Inscriptions" : "Mes Inscriptions"}
                </h2>
                <p className="text-mist mt-1">
                    {isSchoolAdmin
                        ? "Gérez les demandes d'inscription et les paiements."
                        : "Suivez vos inscriptions aux auto-écoles."}
                </p>
            </div>

            {/* KPI Cards — Finexy-inspired */}
            <div className="grid gap-4 md:grid-cols-3">
                <KpiStatCard
                    icon={Users}
                    label="Total Inscriptions"
                    value={totalCount.toString()}
                    sub="Ce mois"
                    accentColor="signal"
                    loading={loading}
                />
                <KpiStatCard
                    icon={Clock}
                    label="En Attente"
                    value={pendingCount.toString()}
                    sub="À confirmer"
                    accentColor="yellow"
                    loading={loading}
                />
                <KpiStatCard
                    icon={CheckCircle}
                    label="Confirmées"
                    value={activeCount.toString()}
                    sub="Actives"
                    accentColor="green"
                    loading={loading}
                />
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-signal animate-spin" />
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-10 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <p className="text-red-400 mb-2">Erreur: {error}</p>
                    <p className="text-mist text-sm">Vérifiez que le backend est démarré</p>
                </div>
            )}

            {!loading && !error && bookings.length === 0 && (
                <div className="text-center py-20 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-signal/10 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-signal" />
                    </div>
                    <p className="text-mist mb-6">Aucune inscription pour le moment.</p>
                    {!isSchoolAdmin && (
                        <Link
                            href="/search"
                            className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt text-xs font-black uppercase tracking-widest shadow-lg shadow-signal/20 transition-all"
                        >
                            Trouver une auto-école
                        </Link>
                    )}
                </div>
            )}

            {!loading && !error && bookings.length > 0 && (
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
                    {/* Search & Filter Bar — Finexy-inspired */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 border-b border-white/[0.06]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist" />
                            <input
                                type="text"
                                placeholder="Rechercher par ID, offre, nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-snow text-sm placeholder:text-mist/60 focus:outline-none focus:border-signal/30 focus:ring-1 focus:ring-signal/20 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-mist shrink-0" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white/[0.05] border border-white/[0.08] rounded-xl text-snow text-sm px-3 py-2.5 focus:outline-none focus:border-signal/30 transition-all appearance-none cursor-pointer pr-8"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23a0a0a0' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="PENDING">En attente</option>
                                <option value="ACTIVE">Actif</option>
                                <option value="COMPLETED">Terminé</option>
                                <option value="CANCELLED">Annulé</option>
                            </select>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/[0.03] text-mist text-xs font-semibold uppercase tracking-wider border-b border-white/[0.06]">
                                <tr>
                                    <th className="px-5 py-4">ID</th>
                                    <th className="px-5 py-4">Offre</th>
                                    {isSchoolAdmin && <th className="px-5 py-4">Candidat</th>}
                                    <th className="px-5 py-4">Montant</th>
                                    <th className="px-5 py-4">Statut</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSchoolAdmin ? 7 : 6} className="px-5 py-12 text-center text-mist">
                                            Aucun résultat pour cette recherche.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs text-mist/80">#{booking.id.substring(0, 8)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                                                        <Calendar className="h-4 w-4 text-signal" />
                                                    </div>
                                                    <span className="font-medium text-snow">{booking.offerName || 'Offre inconnue'}</span>
                                                </div>
                                            </td>
                                            {isSchoolAdmin && (
                                                <td className="px-5 py-4 text-mist">{booking.userName || '—'}</td>
                                            )}
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-signal">{formatPrice(booking.offerPrice || 0)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="px-5 py-4 text-mist text-xs">
                                                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {isSchoolAdmin && booking.status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleConfirm(booking.id)}
                                                                className="p-2 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors"
                                                                title="Confirmer"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(booking.id)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                                                title="Refuser"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer count */}
                    <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-mist">
                        <span>{filteredBookings.length} inscription{filteredBookings.length > 1 ? 's' : ''} affichée{filteredBookings.length > 1 ? 's' : ''}</span>
                        {searchTerm || statusFilter !== "ALL" ? (
                            <button
                                onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                                className="text-signal hover:underline"
                            >
                                Réinitialiser les filtres
                            </button>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── KPI Stat Card — Finexy-inspired ─── */
function KpiStatCard({ icon: Icon, label, value, sub, accentColor, loading }: {
    icon: any;
    label: string;
    value: string;
    sub: string;
    accentColor: 'signal' | 'yellow' | 'green' | 'blue' | 'red';
    loading?: boolean;
}) {
    const colorMap = {
        signal: { bg: 'bg-signal/10', text: 'text-signal', dot: 'bg-signal' },
        yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500' },
        green: { bg: 'bg-green-500/10', text: 'text-green-500', dot: 'bg-green-500' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
        red: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
    };
    const colors = colorMap[accentColor];

    return (
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all group">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-mist uppercase tracking-wide">{label}</span>
                <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-mist animate-spin" />
                    <span className="text-mist text-sm">Chargement...</span>
                </div>
            ) : (
                <>
                    <p className="text-3xl font-black text-snow tracking-tight">{value}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${colors.dot} animate-pulse`} />
                        <p className="text-xs text-mist font-medium">{sub}</p>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        ACTIVE: { label: "Actif", className: "bg-green-500/10 text-green-400 border-green-500/20" },
        COMPLETED: { label: "Terminé", className: "bg-green-500/10 text-green-400 border-green-500/20" },
        PENDING: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
        CANCELLED: { label: "Annulé", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    const { label, className } = config[status] || { label: status, className: "bg-white/10 text-mist border-white/10" };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${className.includes('green') ? 'bg-green-400' : className.includes('yellow') ? 'bg-yellow-400' : className.includes('red') ? 'bg-red-400' : 'bg-mist'}`} />
            {label}
        </span>
    );
}
