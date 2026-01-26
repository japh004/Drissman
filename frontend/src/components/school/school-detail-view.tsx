"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { School, Offer } from "@/lib/api";
import { BookingWidget } from "./booking-widget";
import { BookingModal } from "@/components/booking/booking-modal";
import { OffersList } from "./offers-list";
import { SchoolGallery } from "./school-gallery";
import { ReviewForm } from "./review-form";
import { MapPin, Star, Check, Menu, X, ArrowLeft, Shield } from "lucide-react";
import { useReviews } from "@/hooks";
import { useAuth } from "@/hooks";

export function SchoolDetailView({ school }: { school: any }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | undefined>(undefined);

    const { user, isAuthenticated } = useAuth();
    const { reviews, loading: reviewsLoading, createReview, averageRating, reviewCount } = useReviews(school.id);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleBookClick = (offer?: Offer) => {
        setSelectedOffer(offer);
        setIsBookingOpen(true);
    };

    // Display rating: use API data if available, otherwise fallback to school prop
    const displayRating = averageRating > 0 ? averageRating.toFixed(1) : school.rating;
    const displayReviewCount = reviewCount > 0 ? reviewCount : school.reviewCount;

    return (
        <div className="min-h-screen bg-asphalt text-snow">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-asphalt/90 backdrop-blur-xl shadow-2xl border-b border-white/5" : "bg-transparent"}`}>
                <nav className="container-wide flex justify-between items-center py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/search" className="flex items-center gap-2 text-mist hover:text-signal transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden md:inline">Retour</span>
                        </Link>
                        <Link href="/" className="flex items-center gap-2 group z-50">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-signal/30 to-signal/10 backdrop-blur-sm border border-signal/30 flex items-center justify-center group-hover:border-signal/60 group-hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all duration-300">
                                <span className="text-signal font-black text-base">D</span>
                            </div>
                            <span className="text-xl font-black tracking-tight">
                                <span className="text-signal">DRISS</span><span className="text-snow">MAN</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/search" className="relative text-sm text-mist hover:text-signal transition-colors duration-300 group">
                            Auto-écoles
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-signal group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link href="/code" className="relative text-sm text-mist hover:text-signal transition-colors duration-300 group">
                            Code
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-signal group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link href="/partners" className="relative text-sm text-mist hover:text-signal transition-colors duration-300 group">
                            Partenaires
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-signal group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {isAuthenticated ? (
                            <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-snow hover:border-signal/30 transition-all">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="px-4 py-2 rounded-xl bg-signal text-asphalt text-xs font-bold hover:shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all">
                                Connexion
                            </Link>
                        )}
                    </div>

                    <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 z-50 text-snow hover:text-signal transition-colors">
                        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                <div className={`fixed inset-0 bg-asphalt/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 md:hidden transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <Link href="/search" onClick={() => setMenuOpen(false)} className="text-3xl font-bold text-snow hover:text-signal transition-colors">Auto-écoles</Link>
                    <Link href="/code" onClick={() => setMenuOpen(false)} className="text-3xl font-bold text-snow hover:text-signal transition-colors">Code</Link>
                    <Link href="/partners" onClick={() => setMenuOpen(false)} className="text-3xl font-bold text-snow hover:text-signal transition-colors">Partenaires</Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24">
                <div className="container-wide">
                    {/* Gallery */}
                    <SchoolGallery images={school.galleryImages} />

                    {/* School Info Header */}
                    <div className="mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            {school.isVerified && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-signal/10 text-signal text-xs font-bold border border-signal/20">
                                    <Shield className="h-3 w-3" /> Vérifié
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-mist text-xs font-medium border border-white/10">
                                <MapPin className="h-3 w-3" /> {school.city}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-snow mb-2">{school.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-mist">
                            <div className="flex items-center gap-1">
                                <Star className="h-5 w-5 text-signal fill-signal" />
                                <span className="font-bold text-snow">{displayRating}</span>
                                <span className="text-mist">({displayReviewCount} avis)</span>
                            </div>
                            <span className="text-mist/50">•</span>
                            <span>{school.address}</span>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid lg:grid-cols-3 gap-8 pb-16">
                        {/* Left: Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Description */}
                            {school.description && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h2 className="text-xl font-bold text-snow mb-4">À propos</h2>
                                    <p className="text-mist leading-relaxed">{school.description}</p>
                                </div>
                            )}

                            {/* Features */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h2 className="text-xl font-bold text-snow mb-4">Services proposés</h2>
                                <div className="flex flex-wrap gap-3">
                                    {school.features?.map((feature: string, i: number) => (
                                        <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-signal/10 text-signal text-sm font-medium border border-signal/20">
                                            <Check className="h-4 w-4" />
                                            {feature}
                                        </span>
                                    ))}
                                    {!school.features || school.features.length === 0 && (
                                        <p className="text-sm text-mist/60 italic">Aucun service spécifique répertorié</p>
                                    )}
                                </div>
                            </div>

                            {/* Offers */}
                            {school.offers && school.offers.length > 0 && (
                                <OffersList offers={school.offers} onSelectOffer={handleBookClick} />
                            )}

                            {/* Reviews Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h2 className="text-xl font-bold text-snow mb-6">Avis clients</h2>

                                {/* Review Form */}
                                <ReviewForm
                                    schoolId={school.id}
                                    onSubmit={createReview}
                                    isAuthenticated={isAuthenticated}
                                    userId={user?.id}
                                />

                                {/* Reviews List */}
                                {reviewsLoading ? (
                                    <div className="text-center py-8">
                                        <div className="h-8 w-8 border-2 border-signal border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-mist mt-2">Chargement des avis...</p>
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <div className="space-y-4 mt-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-snow">{review.userName || "Utilisateur"}</span>
                                                        {review.verified && (
                                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Vérifié</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-signal fill-signal' : 'text-white/20'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-mist text-sm mb-2">{review.comment}</p>
                                                )}
                                                <span className="text-xs text-mist/60">
                                                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 mt-6 bg-white/5 rounded-xl">
                                        <p className="text-mist">Aucun avis pour le moment.</p>
                                        <p className="text-sm text-mist/60 mt-1">Soyez le premier à donner votre avis !</p>
                                    </div>
                                )}

                                {!reviewsLoading && reviews.length === 0 && school.reviews && school.reviews.length > 0 && (
                                    <div className="space-y-4 mt-6">
                                        {school.reviews.map((review: any) => (
                                            <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-snow">{review.user}</span>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-signal fill-signal' : 'text-white/20'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-mist text-sm mb-2">{review.comment}</p>
                                                <span className="text-xs text-mist/60">{review.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Sticky Sidebar */}
                        <div className="lg:col-span-1">
                            <BookingWidget school={school} onBookClick={() => handleBookClick(undefined)} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                school={school}
                selectedOffer={selectedOffer}
            />
        </div>
    );
}
