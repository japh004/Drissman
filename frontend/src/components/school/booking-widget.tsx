"use client";

import { Check, ShieldCheck } from "lucide-react";
import { DrivingSchool } from "@/lib/data";

interface BookingWidgetProps {
    school: DrivingSchool;
    onBookClick?: () => void;
}

export function BookingWidget({ school, onBookClick }: BookingWidgetProps) {
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sticky top-24">
            <div className="mb-6">
                <p className="text-mist text-sm font-medium">Prix de départ</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-signal">{school.price.toLocaleString()}</span>
                    <span className="text-mist font-medium">FCFA</span>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <button
                    onClick={onBookClick}
                    className="w-full bg-signal hover:bg-signal-dark text-asphalt font-bold py-3 rounded-xl text-lg shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Réserver maintenant
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <span className="font-semibold text-snow block">Paiement Sécurisé</span>
                        <span className="text-mist">Votre argent est bloqué jusqu&apos;à la confirmation de l&apos;auto-école.</span>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-signal shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <span className="font-semibold text-snow block">Annulation Gratuite</span>
                        <span className="text-mist">Jusqu&apos;à 48h avant le début.</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-mist/60">Paiements acceptés</p>
                <div className="flex justify-center gap-2 mt-2 opacity-70 hover:opacity-100 transition-all">
                    <span className="font-bold text-yellow-400 text-xs border border-yellow-400/30 px-2 py-1 rounded">MTN MOMO</span>
                    <span className="font-bold text-orange-400 text-xs border border-orange-400/30 px-2 py-1 rounded">Orange Money</span>
                </div>
            </div>
        </div>
    );
}
