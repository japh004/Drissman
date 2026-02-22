"use client";

import { OfferWizard } from "@/components/admin/offers/offer-wizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewOfferPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/offers"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors border border-white/5"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Créer une Nouvelle Formule</h1>
                    <p className="text-white/60 text-sm">
                        Suivez ce guide en 3 étapes pour configurer une offre d'apprentissage complète.
                    </p>
                </div>
            </div>

            <main className="bg-asphalt-light border border-white/5 rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                <OfferWizard />
            </main>
        </div>
    );
}
