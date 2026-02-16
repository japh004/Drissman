"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check, X, Loader2, Search, SlidersHorizontal, Users, Clock, CheckCircle, Calendar, ArrowUpRight, TrendingUp, XCircle } from "lucide-react";
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
    const cancelledCount = bookings.filter(b => b.status === "CANCELLED").length;

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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
                {!loading && totalCount > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-mist font-medium">
                        <TrendingUp className="h-3.5 w-3.5 text-signal" />
                        <span className="text-signal font-bold">{totalCount}</span> inscription{totalCount > 1 ? 's' : ''} au total
                    </div>
                )}
            </div>

            {/* ═══ KPI Cards — with visual mini-elements ═══ */}
            <div className="grid gap-4 md:grid-cols-4">
                {/* Total — with mini bar breakdown */}
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.12] p-6 hover:border-signal/20 transition-all group">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-signal/5 rounded-full blur-2xl group-hover:bg-signal/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Total</span>
                            <div className="p-2 rounded-xl bg-signal/10 text-signal group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        {loading ? (
                            <Loader2 className="h-5 w-5 text-mist animate-spin" />
                        ) : (
                            <>
                                <p className="text-3xl font-black text-snow tracking-tight">{totalCount}</p>
                                {/* Visual breakdown bar */}
                                <div className="flex gap-[2px] h-2 mt-3 rounded-full overflow-hidden">
                                    {totalCount > 0 && (
                                        <>
                                            <div className="bg-green-500/60 rounded-l-full transition-all duration-700" style={{ width: `${(activeCount / totalCount) * 100}%` }} />
                                            <div className="bg-yellow-500/60 transition-all duration-700" style={{ width: `${(pendingCount / totalCount) * 100}%` }} />
                                            <div className="bg-red-500/40 rounded-r-full transition-all duration-700" style={{ width: `${(cancelledCount / totalCount) * 100}%` }} />
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Pending — with pulsing ring */}
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.12] p-6 hover:border-yellow-500/20 transition-all group">
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">En attente</span>
                            <div className="relative">
                                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="h-4 w-4" />
                                </div>
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full flex items-center justify-center text-[7px] text-asphalt font-black animate-pulse" />
                                )}
                            </div>
                        </div>
                        {loading ? (
                            <Loader2 className="h-5 w-5 text-mist animate-spin" />
                        ) : (
                            <>
                                <p className="text-3xl font-black text-yellow-500 tracking-tight">{pendingCount}</p>
                                <p className="text-[10px] text-mist mt-1">À confirmer</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Active — with check ring */}
                <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.12] p-6 hover:border-green-500/20 transition-all group">
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Confirmées</span>
                            <div className="p-2 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </div>
                        {loading ? (
                            <Loader2 className="h-5 w-5 text-mist animate-spin" />
                        ) : (
                            <>
                                <p className="text-3xl font-black text-green-500 tracking-tight">{activeCount}</p>
                                <p className="text-[10px] text-mist mt-1">Actives</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Conversion Rate — with visual gauge */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent rounded-2xl border border-purple-500/20 p-6 group hover:border-purple-500/40 transition-all">
                    <div className="absolute top-3 right-3 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Conversion</span>
                            <ArrowUpRight className="h-4 w-4 text-purple-400 group-hover:scale-125 transition-transform" />
                        </div>
                        {loading ? (
                            <Loader2 className="h-5 w-5 text-mist animate-spin" />
                        ) : (
                            <>
                                <p className="text-3xl font-black text-purple-400 tracking-tight">
                                    {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
                                </p>
                                {/* Mini conversion gauge */}
                                <div className="h-1.5 bg-white/[0.10] rounded-full overflow-hidden mt-3">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-signal rounded-full transition-all duration-1000"
                                        style={{ width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%` }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="relative h-16 w-16">
                        <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-4 border-signal/20 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-10 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <p className="text-red-400 mb-2">Erreur: {error}</p>
                    <p className="text-mist text-sm">Vérifiez que le backend est démarré</p>
                </div>
            )}

            {!loading && !error && bookings.length === 0 && (
                <div className="text-center py-20 bg-white/[0.07] rounded-2xl border border-dashed border-white/[0.14]">
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
                <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.12] overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 border-b border-white/[0.12]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist" />
                            <input
                                type="text"
                                placeholder="Rechercher par ID, offre, nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.08] border border-white/[0.14] rounded-xl text-snow text-sm placeholder:text-mist/60 focus:outline-none focus:border-signal/30 focus:ring-1 focus:ring-signal/20 transition-all"
                            />
                        </div>
                        {/* Quick filter pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { value: "ALL", label: "Tous", count: totalCount },
                                { value: "PENDING", label: "En attente", count: pendingCount },
                                { value: "ACTIVE", label: "Actif", count: activeCount },
                            ].map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setStatusFilter(f.value)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${statusFilter === f.value
                                            ? 'bg-signal/10 border-signal/30 text-signal'
                                            : 'bg-white/[0.07] border-white/[0.12] text-mist hover:border-white/[0.20]'
                                        }`}
                                >
                                    {f.label} <span className="ml-1 opacity-60">{f.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/[0.07] text-mist text-xs font-semibold uppercase tracking-wider border-b border-white/[0.12]">
                                <tr>
                                    <th className="px-5 py-4">Inscription</th>
                                    {isSchoolAdmin && <th className="px-5 py-4">Candidat</th>}
                                    <th className="px-5 py-4">Montant</th>
                                    <th className="px-5 py-4">Statut</th>
                                    <th className="px-5 py-4">Date</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.08]">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSchoolAdmin ? 6 : 5} className="px-5 py-12 text-center text-mist">
                                            Aucun résultat pour cette recherche.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-white/[0.07] transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-signal/20 to-signal/5 border border-signal/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                        <Calendar className="h-4 w-4 text-signal" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-snow block">{booking.offerName || 'Offre inconnue'}</span>
                                                        <span className="font-mono text-[10px] text-mist/50">#{booking.id.substring(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {isSchoolAdmin && (
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-lg bg-white/[0.10] flex items-center justify-center text-[10px] text-mist font-black">
                                                            {(booking.userName || '?')[0].toUpperCase()}
                                                        </div>
                                                        <span className="text-mist text-sm">{booking.userName || '—'}</span>
                                                    </div>
                                                </td>
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
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-bold transition-all"
                                                                title="Confirmer"
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                                Confirmer
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(booking.id)}
                                                                className="p-1.5 hover:bg-red-500/10 rounded-xl text-red-400/50 hover:text-red-400 transition-all"
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
                    <div className="px-5 py-3 border-t border-white/[0.12] flex items-center justify-between text-xs text-mist">
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

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string; icon: any }> = {
        ACTIVE: { label: "Actif", className: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
        COMPLETED: { label: "Terminé", className: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle },
        PENDING: { label: "En attente", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
        CANCELLED: { label: "Annulé", className: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
    };
    const { label, className, icon: Icon } = config[status] || { label: status, className: "bg-white/10 text-mist border-white/10", icon: Clock };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${className}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}
