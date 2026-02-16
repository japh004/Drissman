"use client";

import { useState, useMemo } from "react";
import { useAuth, useInvoices } from "@/hooks";
import { EmptyState } from "@/components/ui/empty-state";
import {
    FileText,
    Loader2,
    Download,
    CheckCircle,
    Clock,
    AlertCircle,
    CreditCard,
    RefreshCw,
    Search,
    ArrowUpRight,
    TrendingUp,
    Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "@/lib/api";
import { TabNavigation } from "@/components/dashboard/tab-navigation";

const STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
    PENDING: {
        label: "En attente",
        icon: Clock,
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    },
    PAID: {
        label: "Payée",
        icon: CheckCircle,
        className: "bg-green-500/10 text-green-500 border-green-500/20"
    },
    FAILED: {
        label: "Échouée",
        icon: AlertCircle,
        className: "bg-red-500/10 text-red-500 border-red-500/20"
    },
    REFUNDED: {
        label: "Remboursée",
        icon: RefreshCw,
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    OVERDUE: {
        label: "En retard",
        icon: AlertCircle,
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    }
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    MTN_MOMO: "MTN Mobile Money",
    ORANGE_MONEY: "Orange Money",
    CARD: "Carte bancaire",
    CASH: "Espèces"
};

export default function InvoicesPage() {
    const { user } = useAuth();
    const isSchoolAdmin = user?.role === "SCHOOL_ADMIN";

    const { invoices, loading, error, refetch, payInvoice, totalPending, totalPaid } = useInvoices(
        isSchoolAdmin && user?.schoolId
            ? { schoolId: user.schoolId }
            : { userId: user?.id }
    );
    const [payingId, setPayingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const handlePayInvoice = async (invoiceId: string, method: Invoice['paymentMethod']) => {
        setPayingId(invoiceId);
        try {
            const reference = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await payInvoice(invoiceId, method, reference);
            toast.success("Paiement effectué avec succès !");
        } catch (err) {
            console.error("Payment failed:", err);
            toast.error("Erreur lors du paiement. Veuillez réessayer.");
        } finally {
            setPayingId(null);
        }
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture #${invoice.id.slice(0, 8)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ffc107; padding-bottom: 20px; }
        .header h1 { color: #ffc107; margin: 0; }
        .header p { color: #666; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-info div { width: 45%; }
        .invoice-info h3 { margin-bottom: 10px; color: #333; }
        .invoice-info p { margin: 5px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.9em; }
        .status-paid { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DRISSMAN</h1>
        <p>Facture d'inscription</p>
    </div>
    
    <div class="invoice-info">
        <div>
            <h3>Facture</h3>
            <p><strong>N°:</strong> ${invoice.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Statut:</strong> <span class="status ${invoice.status === 'PAID' ? 'status-paid' : 'status-pending'}">${STATUS_CONFIG[invoice.status]?.label || invoice.status}</span></p>
        </div>
        <div>
            <h3>Auto-école</h3>
            <p><strong>${invoice.booking?.schoolName || 'N/A'}</strong></p>
            <p>Formation: ${invoice.booking?.offerName || 'N/A'}</p>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${invoice.booking?.offerName || 'Formation'}</td>
                <td>${invoice.amount.toLocaleString()} FCFA</td>
            </tr>
        </tbody>
    </table>
    
    <div class="total">
        Total: ${invoice.amount.toLocaleString()} FCFA
    </div>
    
    ${invoice.paidAt ? `
    <p style="margin-top: 30px; color: #28a745;">
        <strong>Payée le:</strong> ${new Date(invoice.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        ${invoice.paymentMethod ? ` via ${PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod}` : ''}
    </p>
    ` : ''}
    
    <div class="footer">
        <p>Merci pour votre confiance !</p>
        <p>DRISSMAN - Votre plateforme d'inscription aux auto-écoles</p>
    </div>
</body>
</html>
        `;

        const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const printWindow = window.open(url, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }

        toast.success("Facture prête pour impression");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Stats
    const paidCount = invoices.filter(i => i.status === 'PAID').length;
    const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
    const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

    // Filtered invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = searchTerm === "" ||
                invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.booking?.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.booking?.offerName || "").toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="relative h-16 w-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-4 border-signal/20 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-mist font-bold uppercase tracking-[0.2em] text-[10px]">Chargement des factures...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-8">
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-snow mb-2">Erreur de chargement</h3>
                    <p className="text-mist mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-snow font-medium transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="space-y-8">
                {isSchoolAdmin && (
                    <TabNavigation tabs={[
                        { label: "Inscriptions", href: "/dashboard/bookings" },
                        { label: "Factures", href: "/dashboard/invoices" },
                    ]} />
                )}
                <EmptyState
                    title="Aucune facture"
                    description={isSchoolAdmin
                        ? "Les factures des inscriptions confirmées apparaîtront ici."
                        : "Vos factures apparaîtront ici après votre première inscription."}
                    actionLabel={isSchoolAdmin ? undefined : "Rechercher une auto-école"}
                    actionHref={isSchoolAdmin ? undefined : "/search"}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {isSchoolAdmin && (
                <TabNavigation tabs={[
                    { label: "Inscriptions", href: "/dashboard/bookings" },
                    { label: "Factures", href: "/dashboard/invoices", count: invoices.length },
                ]} />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-snow">
                        {isSchoolAdmin ? "Factures des élèves" : "Mes Factures"}
                    </h1>
                    <p className="text-mist mt-1">
                        {isSchoolAdmin
                            ? "Consultez les factures de vos élèves inscrits."
                            : "Gérez vos paiements et consultez l'historique de vos transactions."}
                    </p>
                </div>
                {invoices.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-mist font-medium">
                        <TrendingUp className="h-3.5 w-3.5 text-signal" />
                        <span className="text-signal font-bold">{totalAmount.toLocaleString()} FCFA</span> total généré
                    </div>
                )}
            </div>

            {/* ═══ KPI Cards — visually rich ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total invoices — with mini bar */}
                <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 hover:border-signal/20 transition-all group">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-signal/5 rounded-full blur-2xl group-hover:bg-signal/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Total factures</span>
                            <div className="p-2 rounded-xl bg-signal/10 text-signal group-hover:scale-110 transition-transform duration-300">
                                <FileText className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-snow tracking-tight">{invoices.length}</p>
                        {/* Visual breakdown bar */}
                        <div className="flex gap-[2px] h-2 mt-3 rounded-full overflow-hidden">
                            <div className="bg-green-500/60 rounded-l-full transition-all duration-700" style={{ width: `${invoices.length > 0 ? (paidCount / invoices.length) * 100 : 0}%` }} />
                            <div className="bg-yellow-500/60 rounded-r-full transition-all duration-700" style={{ width: `${invoices.length > 0 ? (pendingCount / invoices.length) * 100 : 0}%` }} />
                        </div>
                        <div className="flex gap-3 mt-2 text-[9px] text-mist">
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {paidCount} payées</span>
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> {pendingCount} en attente</span>
                        </div>
                    </div>
                </div>

                {/* Pending Amount */}
                <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 hover:border-yellow-500/20 transition-all group">
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">En attente</span>
                            <div className="relative">
                                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="h-4 w-4" />
                                </div>
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-500 rounded-full animate-pulse" />
                                )}
                            </div>
                        </div>
                        <p className="text-2xl font-black text-yellow-500 tracking-tight">{totalPending.toLocaleString()}<span className="text-sm font-semibold text-mist ml-1">FCFA</span></p>
                        <p className="text-[10px] text-mist mt-1">À encaisser</p>
                    </div>
                </div>

                {/* Paid Amount */}
                <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 hover:border-green-500/20 transition-all group">
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors duration-500" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Payé</span>
                            <div className="p-2 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-green-500 tracking-tight">{totalPaid.toLocaleString()}<span className="text-sm font-semibold text-mist ml-1">FCFA</span></p>
                        <p className="text-[10px] text-mist mt-1">Revenus encaissés</p>
                    </div>
                </div>

                {/* Collection Rate */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent rounded-2xl border border-purple-500/20 p-6 group hover:border-purple-500/40 transition-all">
                    <div className="absolute top-3 right-3 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">Taux encaissement</span>
                            <Wallet className="h-4 w-4 text-purple-400 group-hover:scale-125 transition-transform" />
                        </div>
                        <p className="text-3xl font-black text-purple-400 tracking-tight">
                            {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}%
                        </p>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-3">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-signal rounded-full transition-all duration-1000"
                                style={{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoice Table */}
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 border-b border-white/[0.06]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist" />
                        <input
                            type="text"
                            placeholder="Rechercher par ID, auto-école, offre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-snow text-sm placeholder:text-mist/60 focus:outline-none focus:border-signal/30 focus:ring-1 focus:ring-signal/20 transition-all"
                        />
                    </div>
                    {/* Pill filter buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {[
                            { value: "ALL", label: "Toutes", count: invoices.length },
                            { value: "PENDING", label: "En attente", count: pendingCount },
                            { value: "PAID", label: "Payées", count: paidCount },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${statusFilter === f.value
                                        ? 'bg-signal/10 border-signal/30 text-signal'
                                        : 'bg-white/[0.03] border-white/[0.06] text-mist hover:border-white/[0.12]'
                                    }`}
                            >
                                {f.label} <span className="ml-1 opacity-60">{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/[0.03] text-mist text-xs font-semibold uppercase tracking-wider border-b border-white/[0.06]">
                            <tr>
                                <th className="px-5 py-4">Formation</th>
                                <th className="px-5 py-4">Montant</th>
                                <th className="px-5 py-4">Statut</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-mist">
                                        Aucun résultat pour cette recherche.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => {
                                    const statusConfig = STATUS_CONFIG[invoice.status];
                                    const StatusIcon = statusConfig?.icon || AlertCircle;
                                    const isPaying = payingId === invoice.id;

                                    return (
                                        <tr key={invoice.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-signal/20 to-signal/5 border border-signal/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                        <FileText className="h-4 w-4 text-signal" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-snow">{invoice.booking?.schoolName || "Auto-école"}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] text-mist">{invoice.booking?.offerName || "Formation"}</span>
                                                            <span className="font-mono text-[9px] text-mist/40">#{invoice.id.slice(0, 8)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-bold text-signal text-base">{invoice.amount.toLocaleString()}</span>
                                                <span className="text-[10px] text-mist ml-1">FCFA</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig?.className || 'bg-white/10 text-mist border-white/10'}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusConfig?.label || invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-xs text-mist">
                                                    {formatDate(invoice.createdAt)}
                                                </div>
                                                {invoice.paidAt && (
                                                    <div className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                                                        <CheckCircle className="h-2.5 w-2.5" />
                                                        Payée {formatDate(invoice.paidAt)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDownloadInvoice(invoice)}
                                                        className="p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-signal hover:text-signal-dark transition-all border border-white/[0.06]"
                                                        title="Télécharger la facture"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>

                                                    {!isSchoolAdmin && invoice.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handlePayInvoice(invoice.id, 'MTN_MOMO')}
                                                            disabled={isPaying}
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-signal hover:bg-signal-dark text-asphalt font-bold rounded-xl transition-all disabled:opacity-50 text-xs"
                                                        >
                                                            {isPaying ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <CreditCard className="h-3.5 w-3.5" />
                                                            )}
                                                            Payer
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-mist">
                    <span>{filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} affichée{filteredInvoices.length > 1 ? 's' : ''}</span>
                    {searchTerm || statusFilter !== "ALL" ? (
                        <button
                            onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                            className="text-signal hover:underline"
                        >
                            Réinitialiser les filtres
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
