"use client";

import Link from "next/link";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { useBookings, useAuth } from "@/hooks";
import { formatPrice } from "@/lib/format";

export default function BookingsPage() {
    const { user } = useAuth();
    const { bookings, loading, error, updateStatus } = useBookings(user?.id);

    // Only school admins can confirm/reject bookings
    const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";

    const handleConfirm = async (id: string) => {
        if (!isSchoolAdmin) return;
        try {
            await updateStatus(id, "CONFIRMED");
        } catch (err) {
            console.error("Failed to confirm booking:", err);
        }
    };

    const handleReject = async (id: string) => {
        if (!isSchoolAdmin) return;
        try {
            await updateStatus(id, "CANCELLED");
        } catch (err) {
            console.error("Failed to reject booking:", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-snow">
                        {isSchoolAdmin ? "Gestion des Réservations" : "Mes Réservations"}
                    </h2>
                    <p className="text-mist">
                        {isSchoolAdmin
                            ? "Gérez les demandes d'inscription et les paiements."
                            : "Suivez vos inscriptions aux auto-écoles."}
                    </p>
                </div>
                {isSchoolAdmin && (
                    <button className="px-4 py-2 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold transition-all">Exporter CSV</button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-signal animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-10">
                    <p className="text-red-400 mb-2">Erreur: {error}</p>
                    <p className="text-mist text-sm">Vérifiez que le backend est démarré</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && bookings.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-mist">Aucune réservation pour le moment.</p>
                </div>
            )}

            {/* Bookings Table */}
            {!loading && !error && bookings.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-mist font-medium border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Auto-école</th>
                                <th className="px-6 py-4">Offre</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Montant</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 font-medium text-snow">{booking.school.name}</td>
                                    <td className="px-6 py-4 text-mist">{booking.offer.name}</td>
                                    <td className="px-6 py-4 text-mist">
                                        {new Date(booking.date).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-signal">{formatPrice(booking.offer.price)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={booking.status.toLowerCase()} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* View school - visible for students */}
                                            <Link
                                                href={`/school/${booking.school.id}`}
                                                className="p-1.5 hover:bg-white/5 rounded text-mist hover:text-snow transition-colors"
                                                title="Voir l'auto-école"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>

                                            {/* Confirm/Reject buttons - only visible for school admins */}
                                            {isSchoolAdmin && booking.status === "PENDING" && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirm(booking.id)}
                                                        className="p-1.5 hover:bg-green-500/10 rounded text-green-400 transition-colors"
                                                        title="Confirmer la réservation"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(booking.id)}
                                                        className="p-1.5 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                                                        title="Refuser la réservation"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
        completed: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    };

    const labels: Record<string, string> = {
        pending: "En attente",
        confirmed: "Confirmé",
        cancelled: "Annulé",
        completed: "Terminé"
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}

