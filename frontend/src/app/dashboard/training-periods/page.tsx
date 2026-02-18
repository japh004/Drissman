"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTrainingPeriods, useAuth, useOffers } from "@/hooks";
import { trainingPeriodService, type TrainingPeriod, type CreateTrainingPeriodPayload } from "@/lib/api/training-periods";
import { offerModuleService } from "@/lib/api";
import {
    Plus,
    Loader2,
    Edit2,
    AlertCircle,
    X,
    Check,
    Calendar,
    Users,
    Rocket,
    CheckCircle2,
    XCircle,
    Play,
    ChevronRight,
    Clock,
    BookOpen,
    ArrowRight,
    GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

interface PeriodFormData {
    offerId: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    maxStudents: string;
    enrollmentDeadline: string;
    scheduleDescription: string;
}

const initialFormData: PeriodFormData = {
    offerId: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxStudents: "30",
    enrollmentDeadline: "",
    scheduleDescription: "",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    DRAFT: { label: "Brouillon", color: "text-gray-400", bgColor: "bg-gray-500/10 border-gray-500/20", icon: Edit2 },
    PUBLISHED: { label: "Publié", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", icon: Rocket },
    IN_PROGRESS: { label: "En cours", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: Play },
    COMPLETED: { label: "Terminé", color: "text-signal", bgColor: "bg-signal/10 border-signal/20", icon: CheckCircle2 },
    CANCELLED: { label: "Annulé", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

type FilterStatus = "ALL" | TrainingPeriod["status"];

export default function TrainingPeriodsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const schoolId = user?.schoolId;
    const { periods, loading, error, refetch } = useTrainingPeriods(schoolId);
    const { offers } = useOffers(schoolId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<PeriodFormData>(initialFormData);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");

    const [selectedOfferModules, setSelectedOfferModules] = useState<any[]>([]);
    const [loadingModules, setLoadingModules] = useState(false);

    // Fetch modules when offer changes
    useEffect(() => {
        const fetchLinkedModules = async () => {
            if (!formData.offerId) {
                setSelectedOfferModules([]);
                return;
            }
            setLoadingModules(true);
            try {
                const mods = await offerModuleService.getModulesForOffer(formData.offerId);
                setSelectedOfferModules(mods);
            } catch (err) {
                console.error("Failed to fetch modules for preview:", err);
            } finally {
                setLoadingModules(false);
            }
        };
        fetchLinkedModules();
    }, [formData.offerId]);

    const filteredPeriods = filterStatus === "ALL"
        ? periods
        : periods.filter(p => p.status === filterStatus);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (period: TrainingPeriod) => {
        setEditingId(period.id);
        setFormData({
            offerId: period.offerId,
            name: period.name,
            description: period.description || "",
            startDate: period.startDate?.split("T")[0] || "",
            endDate: period.endDate?.split("T")[0] || "",
            maxStudents: period.maxStudents?.toString() || "30",
            enrollmentDeadline: period.enrollmentDeadline?.split("T")[0] || "",
            scheduleDescription: period.scheduleDescription || "",
        });
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.offerId || !formData.startDate || !formData.endDate) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload: CreateTrainingPeriodPayload = {
                offerId: formData.offerId,
                name: formData.name,
                description: formData.description || undefined,
                startDate: formData.startDate,
                endDate: formData.endDate,
                maxStudents: parseInt(formData.maxStudents) || 30,
                enrollmentDeadline: formData.enrollmentDeadline || undefined,
                scheduleDescription: formData.scheduleDescription || undefined,
            };
            if (editingId) {
                await trainingPeriodService.update(editingId, payload);
                toast.success("Période mise à jour !");
            } else {
                await trainingPeriodService.create(payload);
                toast.success("Période créée !");
            }
            setIsModalOpen(false);
            setFormData(initialFormData);
            refetch();
        } catch (err) {
            console.error("Failed to save period:", err);
            toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusAction = useCallback(async (id: string, action: "publish" | "start" | "complete" | "cancel") => {
        setActionId(id);
        try {
            switch (action) {
                case "publish":
                    await trainingPeriodService.publish(id);
                    toast.success("Période publiée — visible par les élèves");
                    break;
                case "start":
                    await trainingPeriodService.start(id);
                    toast.success("Formation démarrée !");
                    break;
                case "complete":
                    await trainingPeriodService.complete(id);
                    toast.success("Formation terminée");
                    break;
                case "cancel":
                    if (!confirm("Êtes-vous sûr de vouloir annuler cette période ?")) return;
                    await trainingPeriodService.cancel(id);
                    toast.success("Période annulée");
                    break;
            }
            refetch();
        } catch (err) {
            console.error(`Failed to ${action}:`, err);
            toast.error(err instanceof Error ? err.message : "Erreur");
        } finally {
            setActionId(null);
        }
    }, [refetch]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                </div>
                <p className="text-mist font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement des périodes...</p>
            </div>
        );
    }

    if (!schoolId && !loading) {
        return (
            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                <AlertCircle className="h-12 w-12 text-signal mx-auto mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Compte non associé</h3>
                <p className="text-mist mb-6">Votre compte n&apos;est pas encore lié à une auto-école.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/5 rounded-3xl border border-red-500/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Erreur de chargement</h3>
                <p className="text-mist mb-6">{error}</p>
                <button
                    onClick={refetch}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-snow font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight">Périodes</h1>
                    <p className="text-mist font-bold">Gérez vos sessions de formation et les inscriptions.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(255,193,7,0.2)] transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle période
                </button>
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {(["ALL", "DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as FilterStatus[]).map((status) => {
                    const isActive = filterStatus === status;
                    const config = status === "ALL" ? null : STATUS_CONFIG[status];
                    const count = status === "ALL" ? periods.length : periods.filter(p => p.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isActive
                                ? "bg-signal/20 border-signal/40 text-signal"
                                : "bg-white/5 border-white/10 text-mist hover:bg-white/10"
                                }`}
                        >
                            {status === "ALL" ? "Toutes" : config?.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Periods Grid */}
            {filteredPeriods.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center border-dashed">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <GraduationCap className="h-8 w-8 text-mist" />
                    </div>
                    <h3 className="text-xl font-black text-snow mb-2">
                        {filterStatus === "ALL" ? "Aucune période de formation" : "Aucune période avec ce statut"}
                    </h3>
                    <p className="text-mist mb-8 max-w-sm mx-auto font-medium">
                        {filterStatus === "ALL"
                            ? "Créez votre première cohorte pour organiser l'inscription de vos élèves."
                            : "Aucune période ne correspond à ce filtre."}
                    </p>
                    {filterStatus === "ALL" && (
                        <button
                            onClick={handleOpenCreate}
                            className="px-8 py-3 rounded-xl bg-snow text-asphalt text-xs font-black uppercase tracking-widest hover:bg-signal transition-all"
                        >
                            Créer une période
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPeriods.map((period) => {
                        const statusConfig = STATUS_CONFIG[period.status] || STATUS_CONFIG.DRAFT;
                        const StatusIcon = statusConfig.icon;
                        const spotsUsed = period.enrolledCount || 0;
                        const maxSpots = period.maxStudents || 30;
                        const spotsPercent = Math.min((spotsUsed / maxSpots) * 100, 100);
                        const isActioning = actionId === period.id;

                        return (
                            <div
                                key={period.id}
                                className="bg-white/[0.07] backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-signal/30 transition-all duration-500 group flex flex-col"
                            >
                                {/* Status Badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusConfig.bgColor} ${statusConfig.color}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {statusConfig.label}
                                    </div>
                                    {period.status === "DRAFT" && (
                                        <button
                                            onClick={() => handleOpenEdit(period)}
                                            className="p-2 text-mist hover:text-signal hover:bg-white/5 rounded-xl transition-all"
                                            title="Modifier"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Period Info */}
                                <div className="flex-1">
                                    <h3 className="font-black text-snow text-lg group-hover:text-signal transition-colors leading-tight">{period.name}</h3>
                                    {period.offerName && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_rgba(255,193,7,0.5)]" />
                                            <span className="text-[10px] font-black text-mist uppercase tracking-widest">{period.offerName}</span>
                                        </div>
                                    )}
                                    {period.description && (
                                        <p className="text-sm text-mist mt-3 font-medium leading-relaxed line-clamp-2 italic">&quot;{period.description}&quot;</p>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="mt-4 flex items-center gap-3 text-xs text-mist">
                                    <Calendar className="h-3.5 w-3.5 text-signal/60" />
                                    <span className="font-bold">
                                        {new Date(period.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                        {" → "}
                                        {new Date(period.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>

                                {/* Capacity Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-mist flex items-center gap-1.5">
                                            <Users className="h-3 w-3" />
                                            {spotsUsed} / {maxSpots} inscrits
                                        </span>
                                        <span className={spotsPercent >= 90 ? "text-red-400" : spotsPercent >= 70 ? "text-orange-400" : "text-emerald-400"}>
                                            {period.remainingSpots ?? maxSpots - spotsUsed} restant{(period.remainingSpots ?? maxSpots - spotsUsed) > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${spotsPercent >= 90 ? "bg-red-400" : spotsPercent >= 70 ? "bg-orange-400" : "bg-emerald-400"
                                                }`}
                                            style={{ width: `${spotsPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                    {period.status === "DRAFT" && (
                                        <button
                                            onClick={() => handleStatusAction(period.id, "publish")}
                                            disabled={isActioning}
                                            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-emerald-500/20"
                                        >
                                            {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
                                            Publier
                                        </button>
                                    )}
                                    {period.status === "PUBLISHED" && (
                                        <>
                                            <button
                                                onClick={() => handleStatusAction(period.id, "start")}
                                                disabled={isActioning}
                                                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-blue-500/20"
                                            >
                                                {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                                Démarrer
                                            </button>
                                            <button
                                                onClick={() => handleStatusAction(period.id, "cancel")}
                                                disabled={isActioning}
                                                className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-red-500/20"
                                            >
                                                <XCircle className="h-3 w-3" />
                                            </button>
                                        </>
                                    )}
                                    {period.status === "IN_PROGRESS" && (
                                        <>
                                            <button
                                                onClick={() => handleStatusAction(period.id, "complete")}
                                                disabled={isActioning}
                                                className="flex-1 py-2.5 px-3 rounded-xl bg-signal/10 hover:bg-signal/20 text-signal text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-signal/20"
                                            >
                                                {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                                Terminer
                                            </button>
                                            <button
                                                onClick={() => handleStatusAction(period.id, "cancel")}
                                                disabled={isActioning}
                                                className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-red-500/20"
                                            >
                                                <XCircle className="h-3 w-3" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Planning Link */}
                                <button
                                    onClick={() => router.push(`/dashboard/training-periods/${period.id}/planning`)}
                                    className="mt-3 w-full py-2.5 px-3 rounded-xl bg-signal/10 hover:bg-signal/20 text-signal text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-signal/20"
                                >
                                    <BookOpen className="h-3 w-3" />
                                    Voir le planning
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Modifier la session" : "Nouvelle session stratégique"}
            >
                <div className="p-1">
                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-8 px-2">
                        {[1, 2].map(step => (
                            <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${currentStep >= step ? "bg-signal shadow-[0_0_10px_rgba(255,193,7,0.3)]" : "bg-white/5"}`} />
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-snow uppercase tracking-tight">Choix de la Formation</h3>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest">Sélectionnez le socle de cette session</p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Offre de référence *</Label>
                                    <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {offers.map(offer => (
                                            <label
                                                key={offer.id}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${formData.offerId === offer.id ? "bg-signal/10 border-signal/30" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="offerId"
                                                    className="hidden"
                                                    value={offer.id}
                                                    checked={formData.offerId === offer.id}
                                                    onChange={() => setFormData({ ...formData, offerId: offer.id, name: `Promotion ${offer.name} - ${new Date().getFullYear()}` })}
                                                />
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.offerId === offer.id ? "border-signal" : "border-white/20 group-hover:border-signal/50"}`}>
                                                    {formData.offerId === offer.id && <div className="h-2 w-2 rounded-full bg-signal" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-snow">{offer.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] text-mist font-bold uppercase tracking-widest">{offer.hours}H</span>
                                                        <div className="h-1 w-1 rounded-full bg-white/10" />
                                                        <span className="text-[9px] text-signal font-black">{offer.price.toLocaleString()} CFA</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {formData.offerId && (
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-signal/70">Contenu du Programme</h4>
                                            {loadingModules && <Loader2 className="h-3 w-3 animate-spin text-mist" />}
                                        </div>
                                        <div className="space-y-2">
                                            {selectedOfferModules.length > 0 ? (
                                                selectedOfferModules.map((m, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <Check className="h-3 w-3 text-emerald-400" />
                                                        <span className="text-[11px] text-snow font-medium">{m.moduleName}</span>
                                                        <span className="text-[9px] text-mist ml-auto">{m.moduleRequiredHours}h</span>
                                                    </div>
                                                ))
                                            ) : !loadingModules && (
                                                <p className="text-[10px] text-mist italic">Aucun module défini pour cette offre.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => formData.offerId ? setCurrentStep(2) : toast.error("Sélectionnez une offre")}
                                    className="w-full py-4 rounded-2xl bg-snow text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal transition-all flex items-center justify-center gap-2"
                                >
                                    Configurer les Dates
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-snow uppercase tracking-tight">Détails de la Session</h3>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest">Définissez le calendrier et la capacité</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Nom de la promotion *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Promotion Alpha 2026"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-signal/20"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Date d'Ouverture</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Date de Clôture</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="maxStudents" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Capacité Max</Label>
                                        <Input
                                            id="maxStudents"
                                            type="number"
                                            value={formData.maxStudents}
                                            onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 font-black text-signal"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="enrollmentDeadline" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Limite Inscription</Label>
                                        <Input
                                            id="enrollmentDeadline"
                                            type="date"
                                            value={formData.enrollmentDeadline}
                                            onChange={(e) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                                            className="bg-white/5 border-white/10 rounded-2xl h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="scheduleDescription" className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Indications horaires (Lundi-Vendredi...)</Label>
                                    <textarea
                                        id="scheduleDescription"
                                        placeholder="Ex: Sessions de code le matin, conduite l'après-midi..."
                                        value={formData.scheduleDescription}
                                        onChange={(e) => setFormData({ ...formData, scheduleDescription: e.target.value })}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-snow focus:ring-2 focus:ring-signal/20 outline-none h-24 resize-none"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="h-12 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 flex-[2] rounded-2xl bg-signal text-asphalt text-[10px] font-black uppercase tracking-widest shadow-lg shadow-signal/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        {editingId ? "Sauvegarder les modifications" : "Lancer la Promotion"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </Modal>
        </div>
    );
}
