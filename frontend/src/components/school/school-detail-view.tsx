"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Phone, ArrowLeft, Car, Clock, BookOpen, Check, Loader2 } from "lucide-react";
import { DrivingSchool } from "@/lib/data";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks";
import { toast } from "sonner";

interface SchoolDetailViewProps {
    school: DrivingSchool & {
        price: number;
        reviewCount: number;
        features: string[];
        isVerified: boolean;
    };
}

interface Enrollment {
    id: string;
    offerId: string;
    offerName: string;
    schoolId: string;
    schoolName: string;
    price: number;
    hours: number;
    permitType: string;
    modules: { id: string; name: string; category: string; requiredHours: number }[];
    status: "PENDING" | "ACTIVE" | "COMPLETED" | "REFUSED";
    enrolledAt: string;
    studentId: string;
    studentName: string;
}

export function SchoolDetailView({ school }: SchoolDetailViewProps) {
    const { user, isAuthenticated, upgradeVisitor } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [confirmOfferId, setConfirmOfferId] = useState<string | null>(null);

    // Load enrollments from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("candidat_enrollments");
            if (stored) setEnrollments(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    const saveEnrollments = (updated: Enrollment[]) => {
        setEnrollments(updated);
        localStorage.setItem("candidat_enrollments", JSON.stringify(updated));
    };

    const isEnrolled = (offerId: string) => enrollments.some(e => e.offerId === offerId);

    const handleEnroll = async (offer: any) => {
        if (!user) return;
        let effectiveUser = user;
        if (user.role === "VISITOR") {
            try {
                const upgraded = await upgradeVisitor({ targetRole: "CANDIDAT" });
                effectiveUser = upgraded.user;
                toast.success("Votre compte visiteur a ete converti en compte eleve.");
            } catch (err: any) {
                toast.error(err?.message || "Impossible de convertir le compte visiteur.");
                return;
            }
        }
        const enrollment: Enrollment = {
            id: crypto.randomUUID(),
            offerId: offer.id,
            offerName: offer.title || offer.name,
            schoolId: school.id,
            schoolName: school.name,
            price: offer.price,
            hours: offer.hours || 35,
            permitType: offer.type || offer.permitType || "B",
            modules: offer.modules || [],
            status: "PENDING",
            enrolledAt: new Date().toISOString(),
            studentId: effectiveUser.id || "",
            studentName: `${effectiveUser.firstName} ${effectiveUser.lastName}`,
        };
        const updated = [...enrollments, enrollment];
        saveEnrollments(updated);
        setConfirmOfferId(null);
        toast.success(`Inscription envoyée pour "${enrollment.offerName}" ! En attente de validation par l'auto-école.`);
    };

    return (
        <div className="min-h-screen bg-asphalt text-snow">
            {/* Hero Header */}
            <div className="relative h-[40vh] overflow-hidden">
                <img
                    src={school.imageUrl || "/hero_student_dark.png"}
                    alt={school.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/60 to-transparent" />
                <div className="absolute top-6 left-6">
                    <Link
                        href="/search"
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all border border-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Link>
                </div>
                <div className="absolute top-6 right-6">
                    <ThemeToggle />
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5 bg-signal/20 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 text-signal fill-signal" />
                            <span className="text-sm font-black text-white">{school.rating}</span>
                            <span className="text-xs text-white/60">({school.reviewCount} avis)</span>
                        </div>
                        {school.isVerified && (
                            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                                ✓ Vérifié
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-black mb-2">{school.name}</h1>
                    <div className="flex items-center text-white/70 text-sm gap-2">
                        <MapPin className="h-4 w-4 text-signal" />
                        {school.address}, {school.city}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container-wide py-12 space-y-12">
                {/* Description */}
                {school.description && (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
                        <h2 className="text-xl font-black mb-4">À propos</h2>
                        <p className="text-white/70 leading-relaxed">{school.description}</p>
                    </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-3">
                    {school.features.map((feature) => (
                        <span
                            key={feature}
                            className="bg-signal/10 text-signal text-sm font-bold px-4 py-2 rounded-xl border border-signal/20"
                        >
                            {feature}
                        </span>
                    ))}
                </div>

                {/* Offers */}
                {school.offers && school.offers.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-black mb-6">Nos Formules</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {school.offers.map((offer) => {
                                const enrolled = isEnrolled(offer.id);
                                const confirming = confirmOfferId === offer.id;
                                return (
                                    <div
                                        key={offer.id}
                                        className={`bg-white/5 rounded-2xl p-6 border transition-all group ${enrolled ? "border-green-500/20 bg-green-500/[0.02]" : "border-white/5 hover:border-signal/30"}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-black group-hover:text-signal transition-colors">
                                                {offer.title}
                                            </h3>
                                            <span className="bg-signal/10 text-signal text-xs font-bold px-2.5 py-1 rounded-lg">
                                                {offer.type}
                                            </span>
                                        </div>
                                        <p className="text-white/60 text-sm mb-4">{offer.description}</p>
                                        <ul className="space-y-2 mb-6">
                                            {offer.features.map((f) => (
                                                <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                            <div>
                                                <span className="text-2xl font-black text-signal">
                                                    {new Intl.NumberFormat('fr-FR').format(offer.price)}
                                                </span>
                                                <span className="text-xs text-white/40 ml-1">FCFA</span>
                                            </div>
                                            {enrolled ? (
                                                <span className="flex items-center gap-1.5 text-sm font-bold text-green-400 bg-green-500/10 px-4 py-2 rounded-xl">
                                                    <Check className="h-4 w-4" /> Inscrit
                                                </span>
                                            ) : !isAuthenticated ? (
                                                <Link
                                                    href="/login"
                                                    className="bg-signal text-asphalt font-bold py-2 px-5 rounded-xl text-sm hover:bg-white transition-all"
                                                >
                                                    S&apos;inscrire
                                                </Link>
                                            ) : (user?.role !== "CANDIDAT" && user?.role !== "VISITOR") ? (
                                                <Link
                                                    href="/login"
                                                    className="bg-signal text-asphalt font-bold py-2 px-5 rounded-xl text-sm hover:bg-white transition-all"
                                                >
                                                    S&apos;inscrire
                                                </Link>
                                            ) : confirming ? (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setConfirmOfferId(null)}
                                                        className="text-xs font-bold text-mist px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                                                        Annuler
                                                    </button>
                                                    <button onClick={() => handleEnroll(offer)}
                                                        className="text-sm font-bold text-asphalt bg-signal px-5 py-2 rounded-xl hover:bg-signal/80 transition-all shadow-lg shadow-signal/20">
                                                        Confirmer
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmOfferId(offer.id)}
                                                    className="bg-signal text-asphalt font-bold py-2 px-5 rounded-xl text-sm hover:bg-white transition-all"
                                                >
                                                    S&apos;inscrire
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                {school.reviews && school.reviews.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-black mb-6">Avis des élèves</h2>
                        <div className="space-y-4">
                            {school.reviews.map((review) => (
                                <div key={review.id} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-signal/20 flex items-center justify-center text-signal font-bold">
                                                {review.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{review.user}</p>
                                                <p className="text-xs text-white/40">{review.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < review.rating ? 'text-signal fill-signal' : 'text-white/20'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-white/70 text-sm">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
