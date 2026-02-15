"use client";

import { useState } from "react";
import { Star, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { CreateReviewPayload } from "@/lib/api";
import Link from "next/link";

interface ReviewFormProps {
    schoolId: string;
    onSubmit: (payload: CreateReviewPayload, userId: string) => Promise<unknown>;
    isAuthenticated: boolean;
    userId?: string;
}

export function ReviewForm({ schoolId, onSubmit, isAuthenticated, userId }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("[ReviewForm] Submit clicked", { isAuthenticated, userId, rating, schoolId });

        if (!isAuthenticated) {
            toast.error("Vous devez être connecté pour laisser un avis");
            return;
        }

        if (!userId) {
            console.error("[ReviewForm] No userId available");
            toast.error("Erreur: Session expirée. Veuillez vous reconnecter.");
            return;
        }

        if (rating === 0) {
            toast.error("Veuillez sélectionner une note en cliquant sur les étoiles");
            return;
        }

        setIsSubmitting(true);
        console.log("[ReviewForm] Submitting review...", { schoolId, rating, comment: comment.trim(), userId });

        try {
            const payload: CreateReviewPayload = {
                schoolId,
                rating,
                comment: comment.trim() || undefined
            };

            console.log("[ReviewForm] Calling onSubmit with payload:", payload);
            const result = await onSubmit(payload, userId);
            console.log("[ReviewForm] Success! Result:", result);

            toast.success("Merci pour votre avis !");
            setRating(0);
            setComment("");
        } catch (error) {
            console.error("[ReviewForm] Error submitting review:", error);

            let errorMessage = "Erreur lors de l'envoi de l'avis";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            // Check for specific error types from backend
            if (errorMessage.includes("already") || errorMessage.includes("déjà")) {
                toast.error("Vous avez déjà laissé un avis pour cette auto-école");
            } else if (errorMessage.toLowerCase().includes("inscription") ||
                errorMessage.toLowerCase().includes("booking") ||
                errorMessage.toLowerCase().includes("confirmée")) {
                toast.error("Vous devez avoir une inscription confirmée pour laisser un avis");
            } else if (errorMessage.includes("400")) {
                toast.error("Données invalides. Veuillez vérifier votre saisie.");
            } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
                toast.error("Session expirée. Veuillez vous reconnecter.");
            } else if (errorMessage.includes("500")) {
                toast.error("Erreur serveur temporaire. Veuillez réessayer plus tard.");
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-signal/5 border border-signal/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-mist text-center">
                    <Link href="/login" className="text-signal font-semibold hover:underline">
                        Connectez-vous
                    </Link>
                    {" "}pour laisser un avis sur cette auto-école.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-snow mb-4">Votre avis nous intéresse</h3>

            {/* Star Rating */}
            <div className="flex flex-col gap-2 mb-6">
                <p className="text-sm text-mist">Quelle note donnez-vous à cette auto-école ?</p>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => {
                                console.log("[ReviewForm] Star clicked:", star);
                                setRating(star);
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-all hover:scale-125 focus:outline-none"
                            aria-label={`Noter ${star} étoiles sur 5`}
                        >
                            <Star
                                className={`h-8 w-8 transition-all ${star <= (hoverRating || rating)
                                    ? "text-signal fill-signal drop-shadow-[0_0_8px_rgba(255,193,7,0.5)]"
                                    : "text-white/10"
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-3 text-sm font-bold text-signal">
                        {rating > 0 && (
                            rating === 5 ? "Excellent !" :
                                rating === 4 ? "Très bien" :
                                    rating === 3 ? "Bien" :
                                        rating === 2 ? "Passable" : "Décevant"
                        )}
                    </span>
                </div>
            </div>

            {/* Comment */}
            <div className="space-y-2 mb-6">
                <p className="text-sm text-mist">Partagez votre expérience (facultatif)</p>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Qu'avez-vous pensé de la formation, des moniteurs, des locaux ?"
                    className="w-full bg-asphalt/50 border border-white/10 rounded-xl p-4 text-snow text-sm placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all resize-none"
                    rows={4}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 bg-signal hover:bg-signal-dark text-asphalt font-black py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-signal/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Publication en cours...
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Publier mon avis
                    </>
                )}
            </button>

            {rating === 0 && !isSubmitting && (
                <p className="text-[10px] text-center text-mist/40 mt-3 italic">
                    Astuce : Cliquez sur les étoiles pour activer le bouton de publication
                </p>
            )}
        </form>
    );
}
