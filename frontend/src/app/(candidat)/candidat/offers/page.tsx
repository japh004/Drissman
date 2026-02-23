"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks";
import { useAuth } from "@/hooks";
import { BookOpen, Check, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";

interface Offer {
    id: string;
    name: string;
    description: string;
    price: number;
    hours: number;
    permitType: string;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
    modules: { id: string; name: string; category: string; requiredHours: number }[];
    enrollmentsCount: number;
}

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

function formatPrice(n: number) { return new Intl.NumberFormat("fr-FR").format(n); }

const categoryIcons: Record<string, string> = {
    CODE: "📖",
    CONDUITE: "🚗",
    EXAMEN_BLANC: "📝",
};

export default function CandidatOffersPage() {
    const { user } = useAuth();
    // Read offers created by admin (shared localStorage key)
    const [offers] = useLocalStorage<Offer[]>("offers", []);
    const [enrollments, setEnrollments] = useLocalStorage<Enrollment[]>("candidat_enrollments", []);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmOfferId, setConfirmOfferId] = useState<string | null>(null);

    const activeOffers = offers.filter(o => o.status === "ACTIVE");
    const filtered = activeOffers.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.permitType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isEnrolled = (offerId: string) => enrollments.some(e => e.offerId === offerId);

    const handleEnroll = (offer: Offer) => {
        const enrollment: Enrollment = {
            id: crypto.randomUUID(),
            offerId: offer.id,
            offerName: offer.name,
            price: offer.price,
            hours: offer.hours,
            permitType: offer.permitType,
            modules: offer.modules,
            status: "PENDING",
            enrolledAt: new Date().toISOString(),
        };
        setEnrollments(prev => [...prev, enrollment]);
        setConfirmOfferId(null);
        toast.success(`Inscription envoyée pour "${offer.name}" ! En attente de validation.`);
    };

    return (
        <PageTransition className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-snow">Catalogue des Offres</h1>
                    <p className="text-sm text-mist mt-0.5">
                        {activeOffers.length > 0
                            ? `${activeOffers.length} offre${activeOffers.length > 1 ? "s" : ""} disponible${activeOffers.length > 1 ? "s" : ""}`
                            : "Découvrez les formules de votre auto-école"}
                    </p>
                </div>
                {activeOffers.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/30" />
                        <input type="text" placeholder="Chercher une offre..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-snow text-sm placeholder:text-mist/30 focus:border-signal/30 focus:outline-none transition-all w-56" />
                    </div>
                )}
            </div>

            {/* My enrollments */}
            {enrollments.length > 0 && (
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                    <h2 className="text-sm font-bold text-snow mb-3">Mes inscriptions</h2>
                    <div className="space-y-2">
                        {enrollments.map(e => (
                            <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <BookOpen className="h-4 w-4 text-signal shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-snow truncate">{e.offerName}</p>
                                    <p className="text-[10px] text-mist/40">Permis {e.permitType} · {e.hours}h · {formatPrice(e.price)} F</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${e.status === "ACTIVE" ? "bg-green-500/10 text-green-400" :
                                        e.status === "PENDING" ? "bg-signal/10 text-signal" :
                                            e.status === "REFUSED" ? "bg-red-500/10 text-red-400" :
                                                "bg-blue-500/10 text-blue-400"
                                    }`}>
                                    {e.status === "ACTIVE" ? "✓ Validé" : e.status === "PENDING" ? "⏳ En attente" : e.status === "REFUSED" ? "✗ Refusé" : "✓ Terminé"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Offers grid */}
            {activeOffers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                    <BookOpen className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune offre disponible</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Votre auto-école n&apos;a pas encore publié d&apos;offres. Revenez bientôt !</p>
                </div>
            ) : (
                <StaggerContainer className="grid sm:grid-cols-2 gap-4">
                    {filtered.map(offer => {
                        const enrolled = isEnrolled(offer.id);
                        return (
                            <StaggerItem key={offer.id}>
                                <div className={`bg-white/[0.03] rounded-2xl border p-5 transition-all ${enrolled ? "border-green-500/20 bg-green-500/[0.02]" : "border-white/[0.06] hover:border-signal/20"}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-base font-bold text-snow">{offer.name}</h3>
                                            <p className="text-xs text-mist/50 mt-0.5">{offer.description}</p>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-signal/10 text-signal border border-signal/20 shrink-0">
                                            Permis {offer.permitType}
                                        </span>
                                    </div>

                                    {/* Modules */}
                                    {offer.modules.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {offer.modules.map(m => (
                                                <span key={m.id} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 text-mist/60 border border-white/[0.04]">
                                                    {categoryIcons[m.category] || "📦"} {m.name} ({m.requiredHours}h)
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                        <div>
                                            <span className="text-xl font-black text-signal">{formatPrice(offer.price)}</span>
                                            <span className="text-[10px] text-mist/40 ml-1">FCFA · {offer.hours}h</span>
                                        </div>
                                        {enrolled ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-3 py-2 rounded-xl">
                                                <Check className="h-3.5 w-3.5" /> Inscrit
                                            </span>
                                        ) : confirmOfferId === offer.id ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setConfirmOfferId(null)}
                                                    className="text-xs font-bold text-mist px-3 py-2 rounded-xl hover:bg-white/5 transition-all">Annuler</button>
                                                <button onClick={() => handleEnroll(offer)}
                                                    className="text-xs font-bold text-asphalt bg-signal px-4 py-2 rounded-xl hover:bg-signal/80 transition-all shadow-lg shadow-signal/20">
                                                    Confirmer
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmOfferId(offer.id)}
                                                className="flex items-center gap-1 text-xs font-bold text-snow bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-signal/30 hover:bg-signal/5 hover:text-signal transition-all">
                                                <BookOpen className="h-3.5 w-3.5" /> S&apos;inscrire
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </StaggerItem>
                        );
                    })}
                </StaggerContainer>
            )}
        </PageTransition>
    );
}
