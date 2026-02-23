"use client";

import { useState } from "react";
import { Search, Receipt, Download, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

const mockInvoices = [
    { id: "INV-001", studentName: "Sarah Kamga", offer: "Permis B Classique", amount: 65000, status: "PAID", dueDate: "2025-02-01", paidAt: "2025-01-28" },
    { id: "INV-002", studentName: "Junior Moussa", offer: "Permis Accéléré", amount: 120000, status: "PENDING", dueDate: "2025-03-01", paidAt: null },
    { id: "INV-003", studentName: "Alice Kotto", offer: "Code Illimité", amount: 15000, status: "PENDING", dueDate: "2025-03-15", paidAt: null },
    { id: "INV-004", studentName: "Bruno Nganou", offer: "Permis B Classique", amount: 65000, status: "PAID", dueDate: "2024-12-01", paidAt: "2024-11-29" },
    { id: "INV-005", studentName: "Diane Fouda", offer: "Permis B Classique", amount: 65000, status: "PAID", dueDate: "2024-10-01", paidAt: "2024-09-30" },
    { id: "INV-006", studentName: "Junior Moussa", offer: "Permis Accéléré", amount: 60000, status: "OVERDUE", dueDate: "2025-02-15", paidAt: null },
];

const statusConfig: Record<string, { label: string; class: string }> = {
    PAID: { label: "Payé", class: "bg-green-500/10 text-green-400" },
    PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400" },
    OVERDUE: { label: "En retard", class: "bg-red-500/10 text-red-400" },
    CANCELLED: { label: "Annulé", class: "bg-mist/10 text-mist/60" },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const totalRevenue = mockInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
    const totalPending = mockInvoices.filter(i => i.status === "PENDING").reduce((s, i) => s + i.amount, 0);
    const totalOverdue = mockInvoices.filter(i => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0);

    const filtered = mockInvoices.filter(i =>
        i.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || i.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-snow">Factures & Finances</h1>
                <p className="text-sm text-mist mt-0.5">{mockInvoices.length} factures</p>
            </div>

            {/* Financial KPIs */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                    <DollarSign className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">{formatCurrency(totalRevenue)} F</p>
                    <p className="text-xs text-mist/60">CA Total (encaissé)</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-2xl border border-yellow-500/20 p-5">
                    <Clock className="h-5 w-5 text-yellow-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">{formatCurrency(totalPending)} F</p>
                    <p className="text-xs text-mist/60">En attente de paiement</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl border border-red-500/20 p-5">
                    <TrendingUp className="h-5 w-5 text-red-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">{formatCurrency(totalOverdue)} F</p>
                    <p className="text-xs text-mist/60">Paiements en retard</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par nom ou n° facture..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {/* Table */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">N° Facture</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Élève</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Offre</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Montant</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Statut</th>
                                <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Échéance</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((invoice) => {
                                const st = statusConfig[invoice.status] || statusConfig.PENDING;
                                return (
                                    <tr key={invoice.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono font-bold text-signal">{invoice.id}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-snow">{invoice.studentName}</span>
                                        </td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <span className="text-xs text-mist/60">{invoice.offer}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-snow">{formatCurrency(invoice.amount)} F</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${st.class}`}>{st.label}</span>
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <span className="text-xs text-mist/40">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow opacity-0 group-hover:opacity-100 transition-all" title="Télécharger">
                                                <Download className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
