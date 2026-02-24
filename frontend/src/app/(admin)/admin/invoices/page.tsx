"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks";
import { Search, Receipt, DollarSign, Clock, TrendingUp, Download } from "lucide-react";
import { enrollmentService, type InvoiceDto } from "@/lib/enrollment-service";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; class: string }> = {
    PAID: { label: "Paye", class: "bg-green-500/10 text-green-400" },
    PENDING: { label: "En attente", class: "bg-yellow-500/10 text-yellow-400" },
    OVERDUE: { label: "En retard", class: "bg-red-500/10 text-red-400" },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function InvoicesPage() {
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            setLoading(true);
            try {
                const remote = await enrollmentService.getAdminInvoices(token);
                setInvoices(remote || []);
            } catch (error) {
                console.error(error);
                toast.error("Impossible de charger les factures");
            } finally {
                setLoading(false);
            }
        };

        void load();
        const intervalId = window.setInterval(() => void load(), 15000);
        return () => window.clearInterval(intervalId);
    }, [token]);

    const totalRevenue = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + (i.amount || 0), 0);
    const totalPending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + (i.amount || 0), 0);
    const totalOverdue = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + (i.amount || 0), 0);

    const filtered = useMemo(
        () =>
            invoices.filter((i) =>
                i.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        [invoices, searchQuery],
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-snow">Factures & Finances</h1>
                <p className="text-sm text-mist mt-0.5">{invoices.length} facture{invoices.length > 1 ? "s" : ""}</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl border border-green-500/20 p-5">
                    <DollarSign className="h-5 w-5 text-green-400 opacity-60 mb-2" />
                    <p className="text-2xl font-black text-snow">{formatCurrency(totalRevenue)} F</p>
                    <p className="text-xs text-mist/60">CA Total (encaisse)</p>
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

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par nom ou no facture..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {loading ? (
                <p className="text-sm text-mist/60">Chargement...</p>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Receipt className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucune facture</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Les factures sont synchronisees depuis les inscriptions reelles.</p>
                </div>
            ) : (
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">No Facture</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Eleve</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Offre</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Montant</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3">Statut</th>
                                    <th className="text-left text-[10px] font-bold text-mist/40 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Echeance</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((invoice) => {
                                    const st = statusConfig[invoice.status] || statusConfig.PENDING;
                                    return (
                                        <tr key={invoice.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-mono font-bold text-signal">{invoice.invoiceNumber}</span>
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
                                                <button className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow opacity-0 group-hover:opacity-100 transition-all" title="Telecharger">
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
            )}
        </div>
    );
}
