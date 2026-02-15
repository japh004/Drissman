"use client";

import { useState } from "react";
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
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "@/lib/api";
import { TabNavigation } from "@/components/dashboard/tab-navigation";

const STATUS_CONFIG = {
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

    // Use schoolId for school admins, userId for students
    const { invoices, loading, error, refetch, payInvoice, totalPending, totalPaid } = useInvoices(
        isSchoolAdmin && user?.schoolId
            ? { schoolId: user.schoolId }
            : { userId: user?.id }
    );
    const [payingId, setPayingId] = useState<string | null>(null);

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
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-signal animate-spin mx-auto mb-4" />
                    <p className="text-mist">Chargement des factures...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-snow mb-2">Erreur de chargement</h3>
                    <p className="text-mist mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-snow font-medium transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="h-full p-8">
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
        <div className="p-6 lg:p-8 space-y-8">
            {isSchoolAdmin && (
                <TabNavigation tabs={[
                    { label: "Inscriptions", href: "/dashboard/bookings" },
                    { label: "Factures", href: "/dashboard/invoices" },
                ]} />
            )}
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-snow mb-2">
                    {isSchoolAdmin ? "Factures des élèves" : "Mes Factures"}
                </h1>
                <p className="text-mist">
                    {isSchoolAdmin
                        ? "Consultez les factures de vos élèves inscrits."
                        : "Gérez vos paiements et consultez l'historique de vos transactions."}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-signal/10">
                            <FileText className="h-5 w-5 text-signal" />
                        </div>
                        <span className="text-sm text-mist">Total factures</span>
                    </div>
                    <p className="text-2xl font-bold text-snow">{invoices.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                        <span className="text-sm text-mist">En attente</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-500">{totalPending.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="text-sm text-mist">Payé</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500">{totalPaid.toLocaleString()} FCFA</p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                {invoices.map((invoice) => {
                    const statusConfig = STATUS_CONFIG[invoice.status];
                    const StatusIcon = statusConfig.icon;
                    const isPaying = payingId === invoice.id;

                    return (
                        <div
                            key={invoice.id}
                            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Invoice Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-mist/60">#{invoice.id.slice(0, 8)}</span>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-snow mb-1">
                                        {invoice.booking?.schoolName || "Auto-école"}
                                    </h3>
                                    <p className="text-sm text-mist">
                                        {invoice.booking?.offerName || "Formation"} • Créée le {formatDate(invoice.createdAt)}
                                    </p>
                                    {invoice.paidAt && (
                                        <p className="text-xs text-green-400 mt-1">
                                            Payée le {formatDate(invoice.paidAt)} via {PAYMENT_METHOD_LABELS[invoice.paymentMethod!] || invoice.paymentMethod}
                                        </p>
                                    )}
                                </div>

                                {/* Amount & Actions (Download on the RIGHT) */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-signal">{invoice.amount.toLocaleString()} FCFA</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Download icon at the RIGHT */}
                                        <button
                                            onClick={() => handleDownloadInvoice(invoice)}
                                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-signal hover:text-signal-dark transition-all border border-white/5 shrink-0"
                                            title="Télécharger la facture"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>

                                        {!isSchoolAdmin && invoice.status === 'PENDING' && (
                                            <button
                                                onClick={() => handlePayInvoice(invoice.id, 'MTN_MOMO')}
                                                disabled={isPaying}
                                                className="flex items-center gap-2 px-4 py-2 bg-signal hover:bg-signal-dark text-asphalt font-bold rounded-lg transition-all disabled:opacity-50"
                                            >
                                                {isPaying ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CreditCard className="h-4 w-4" />
                                                )}
                                                Payer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
