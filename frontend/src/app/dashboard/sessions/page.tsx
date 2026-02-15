"use client";

import { useState, useMemo } from "react";
import { useAuth, useSessions, useMonitors } from "@/hooks";
import { Session, SessionStatus } from "@/types/partner";
import {
    Loader2,
    Calendar,
    User,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    MapPin,
    FileText,
    Download
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
    'SCHEDULED': { label: 'Planifié', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock },
    'CONFIRMED': { label: 'Confirmé', color: 'text-signal bg-signal/10 border-signal/20', icon: CheckCircle2 },
    'PENDING': { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: Clock },
    'COMPLETED': { label: 'Effectué', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
    'CANCELLED': { label: 'Annulé', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle },
};

export default function SessionsListPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId || "";

    const { sessions, loading, updateStatus, deleteSession } = useSessions(schoolId);
    const { monitors } = useMonitors(schoolId);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [monitorFilter, setMonitorFilter] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL"); // 'ALL', 'THIS_WEEK', 'THIS_MONTH'

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            // Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                (session.studentName || "").toLowerCase().includes(searchLower) ||
                (session.monitorName || "").toLowerCase().includes(searchLower);

            // Status
            const matchesStatus = statusFilter === "ALL" || session.status === statusFilter;

            // Monitor
            const matchesMonitor = monitorFilter === "ALL" || session.monitorId === monitorFilter;

            // Date
            let matchesDate = true;
            const sessionDate = new Date(session.date);
            const today = new Date();

            if (dateFilter === "THIS_WEEK") {
                const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
                matchesDate = sessionDate >= firstDay && sessionDate <= lastDay;
            } else if (dateFilter === "THIS_MONTH") {
                matchesDate = sessionDate.getMonth() === new Date().getMonth() &&
                    sessionDate.getFullYear() === new Date().getFullYear();
            }

            return matchesSearch && matchesStatus && matchesMonitor && matchesDate;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessions, searchTerm, statusFilter, monitorFilter, dateFilter]);

    const handleStatusUpdate = async (id: string, status: SessionStatus) => {
        try {
            await updateStatus(id, status);
            toast.success(`Statut mis à jour`);
        } catch (err) {
            // Toast handled in hook
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
            try {
                await deleteSession(id);
                toast.success("Séance supprimée");
            } catch (err) {
                // Toast handled in hook
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-12 w-12 text-signal animate-spin" />
                <p className="text-mist font-bold uppercase tracking-widest text-xs">Chargement des leçons...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight flex items-center gap-3">
                        <FileText className="h-8 w-8 text-signal" />
                        Historique des Leçons
                    </h1>
                    <p className="text-mist font-bold">Consultez et gérez l'historique de toutes les leçons de conduite.</p>
                </div>
                <Button variant="outline" className="border-white/10 text-mist hover:text-snow hover:bg-white/5">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter (CSV)
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-asphalt/50 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist" />
                    <Input
                        placeholder="Rechercher un élève ou mniteur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-snow"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={monitorFilter}
                        onChange={(e) => setMonitorFilter(e.target.value)}
                        className="bg-asphalt border border-white/10 rounded-lg px-3 py-2 text-sm text-snow outline-none focus:border-signal/50"
                    >
                        <option value="ALL">Tous les moniteurs</option>
                        {monitors.map(m => (
                            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-asphalt border border-white/10 rounded-lg px-3 py-2 text-sm text-snow outline-none focus:border-signal/50"
                    >
                        <option value="ALL">Tous les statuts</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-asphalt border border-white/10 rounded-lg px-3 py-2 text-sm text-snow outline-none focus:border-signal/50"
                    >
                        <option value="ALL">Toutes dates</option>
                        <option value="THIS_WEEK">Cette semaine</option>
                        <option value="THIS_MONTH">Ce mois</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-asphalt/30 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-4 text-left text-[10px] font-black text-mist uppercase tracking-widest pl-6">Date & Heure</th>
                                <th className="p-4 text-left text-[10px] font-black text-mist uppercase tracking-widest">Élève</th>
                                <th className="p-4 text-left text-[10px] font-black text-mist uppercase tracking-widest">Moniteur</th>
                                <th className="p-4 text-left text-[10px] font-black text-mist uppercase tracking-widest">Statut</th>
                                <th className="p-4 text-right text-[10px] font-black text-mist uppercase tracking-widest pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-mist font-bold">
                                        Aucune leçon trouvée pour ces critères.
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map((session) => {
                                    const StatusIcon = STATUS_CONFIG[session.status]?.icon || Clock;
                                    return (
                                        <tr key={session.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-snow text-sm">
                                                        {new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs text-mist flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {session.startTime} - {session.endTime}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-mist">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-snow text-sm">{session.studentName}</div>
                                                        <div className="text-[10px] text-mist uppercase tracking-wider">{session.offerName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-medium text-snow/80 text-sm">
                                                    {session.monitorName || "Non assigné"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[session.status]?.color || 'text-gray-400 border-gray-400/20'}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {STATUS_CONFIG[session.status]?.label || session.status}
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-mist hover:text-snow">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-asphalt border-white/10 text-snow w-48">
                                                        <DropdownMenuLabel className="uppercase text-[10px] tracking-widest text-mist">Actions</DropdownMenuLabel>

                                                        {session.status !== 'COMPLETED' && (
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(session.id, 'COMPLETED')} className="hover:bg-emerald-500/20 hover:text-emerald-500 focus:bg-emerald-500/20 focus:text-emerald-500 cursor-pointer mb-1">
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Valider (Effectué)
                                                            </DropdownMenuItem>
                                                        )}

                                                        {session.status !== 'CANCELLED' && (
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(session.id, 'CANCELLED')} className="hover:bg-red-500/20 hover:text-red-500 focus:bg-red-500/20 focus:text-red-500 cursor-pointer">
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Annuler
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem onClick={() => handleDelete(session.id)} className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

