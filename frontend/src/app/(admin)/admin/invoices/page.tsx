"use client";

import { useState } from "react";
import { Search, Receipt, DollarSign, Clock, TrendingUp } from "lucide-react";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-snow">Factures & Finances</h1>
                <p className="text-sm text-mist mt-0.5">0 facture</p>
            </div>

            {/* Financial KPIs — zeroed */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                    <DollarSign className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">0 F</p>
                    <p className="text-xs text-mist/60">CA Total (encaissé)</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-2xl border border-yellow-500/20 p-5">
                    <Clock className="h-5 w-5 text-yellow-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">0 F</p>
                    <p className="text-xs text-mist/60">En attente de paiement</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl border border-red-500/20 p-5">
                    <TrendingUp className="h-5 w-5 text-red-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">0 F</p>
                    <p className="text-xs text-mist/60">Paiements en retard</p>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par nom ou n° facture..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Receipt className="h-16 w-16 text-mist/15 mb-4" />
                <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune facture</h3>
                <p className="text-sm text-mist/40 max-w-sm">Les factures seront générées automatiquement lorsque des élèves s&apos;inscriront à vos formations.</p>
            </div>
        </div>
    );
}
