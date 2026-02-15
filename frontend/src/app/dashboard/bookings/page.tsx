"use client";

import Link from "next/link";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { usePartnerEnrollments, useMyEnrollments, useAuth } from "@/hooks";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { enrollmentService } from "@/lib/api/enrollments";

export default function BookingsPage() {
    const { user } = useAuth();

    // Only school admins can confirm/reject bookings
    const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";

    // Fetch enrollments based on user role
    // If Admin: usePartnerEnrollments(schoolId)
    // If Student: useMyEnrollments()

    // Note: conditions are hooks, so we must call both but use only one's data?
    // Or conditionals. React hooks cannot be conditional.
    // We can refactor into sub-components or use a wrapper hook (like useBookings was).
    // Let's use a unified approach here or sub-components.

    // Using sub-components is cleaner but might differ from current structure.
    // Let's implement a conditional data fetch using a custom effect or just call both and pick one.
    // Calling both is wasteful.

    // Better: Refactor usage to a single 'useEnrollments' hook that wraps logic? 
    // Or just inline the logic here since we are deprecating useBookings.

    // Let's separate component for Admin and Student? No, too much change.
    // Let's use a simple condition block for rendering? No, hooks rules.

    // Let's create `useEnrollmentData` inside here or use the existing ones properly.
    // Since we have `usePartnerEnrollments` and `useMyEnrollments`, we can just import them.
    // BUT we cannot call them conditionally.

    // Solution: Create a specific hook for this page `usePageEnrollments`? 
    // Or just use `useBookings` updated to use `enrollmentService`!
    // But I wanted to deprecate useBookings.

    // I already created `useMyEnrollments`. `usePartnerEnrollments` exists.
    // I'll create a local helper or just accept calling both with `skip` option if supported?
    // They don't support skip.

    // I will refactor this page to use a single `useGenericEnrollments` that handles the logic, 
    // OR just use `usePartnerEnrollments` if schoolId exists, else `useMyEnrollments`.
    // Wait, I can't do `if (isSchoolAdmin) usePartner... else useMy...`

    // I'll update `useBookings.ts` to be that wrapper!
    // That's the best path to minimal friction.
    // I will rewrite `useBookings` to use `enrollmentService`.

    // BUT `useBookings` returns `Booking[]`. I need it to return `Enrollment[]`.
    // So I need to update the return type of `useBookings` too.
    // Which means updating `BookingsPage` to handle `Enrollment` type.

    // So: 
    // 1. Update `useBookings` to fetch `Enrollment[]` via `enrollmentService`.
    // 2. Update `BookingsPage` to consume `Enrollment[]`.

    // Let's do that.

    // For now, I will rewrite `BookingsPage` to use `useEnrollmentsWrapper` which I will define locally or inside `useBookings.ts`.
    // Actually, I'll just rewrite `useBookings.ts` to `useEnrollments.ts` (new file) or update `useBookings.ts`.
    // Updating `useBookings.ts` keeps import paths in other files valid (if any).
    // But `Booking` type is deprecated.

    // I'll stick to updating `BookingsPage` to use `usePartnerEnrollments` and `useMyEnrollments` 
    // by creating TWO components: `AdminBookings` and `StudentBookings`.
    // Then `BookingsPage` just renders one or the other.

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

import { Enrollment } from "@/types/partner";

function BookingsList({ bookings, loading, error, isSchoolAdmin, updateStatus }: {
    bookings: Enrollment[],
    loading: boolean,
    error: string | null,
    isSchoolAdmin: boolean,
    updateStatus?: (id: string, status: any) => Promise<void>
}) {
    const handleConfirm = async (id: string) => {
        if (!updateStatus) return;
        try {
            await updateStatus(id, "ACTIVE"); // Enrollment status is ACTIVE, not CONFIRMED
            toast.success("Réservation confirmée !");
        } catch (err) {
            toast.error("Erreur confirmation");
        }
    };

    const handleReject = async (id: string) => {
        if (!updateStatus) return;
        try {
            await updateStatus(id, "CANCELLED"); // Enrollment status CANCELLED
            toast.success("Réservation refusée.");
        } catch (err) {
            toast.error("Erreur refus");
        }
    };

    // ... Rendering logic adapted from original page ...

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-snow">
                        {isSchoolAdmin ? "Gestion des Inscriptions" : "Mes Inscriptions"}
                    </h2>
                    <p className="text-mist">
                        {isSchoolAdmin
                            ? "Gérez les demandes d'inscription et les paiements."
                            : "Suivez vos inscriptions aux auto-écoles."}
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 text-signal animate-spin" />
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-10">
                    <p className="text-red-400 mb-2">Erreur: {error}</p>
                    <p className="text-mist text-sm">Vérifiez que le backend est démarré</p>
                </div>
            )}

            {!loading && !error && bookings.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-mist mb-6">Aucune inscription pour le moment.</p>
                    {!isSchoolAdmin && (
                        <Link
                            href="/search"
                            className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(255,193,7,0.1)] transition-all"
                        >
                            Trouver une auto-école
                        </Link>
                    )}
                </div>
            )}

            {!loading && !error && bookings.length > 0 && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-mist font-medium border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">ID</th>
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
                                    <td className="px-6 py-4 font-medium text-snow">#{booking.id.substring(0, 8)}</td>
                                    <td className="px-6 py-4 text-mist">{booking.offerName || 'Offre inconnue'}</td>
                                    <td className="px-6 py-4 text-mist">
                                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("fr-FR") : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-signal">{formatPrice(booking.offerPrice || 0)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Link to details? */}

                                            {isSchoolAdmin && booking.status === "PENDING" && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirm(booking.id)}
                                                        className="p-1.5 hover:bg-green-500/10 rounded text-green-400 transition-colors"
                                                        title="Confirmer"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(booking.id)}
                                                        className="p-1.5 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                                                        title="Refuser"
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
    const isGood = status === "ACTIVE" || status === "COMPLETED";
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isGood
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : status === "CANCELLED" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            }`}>
            {status}
        </span>
    );
}
