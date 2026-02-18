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
    GraduationCap,
    ArrowLeft,
    Target,
    Activity
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    DRAFT: { label: "Brouillon", color: "text-mist", bgColor: "bg-white/5 border-white/10", icon: Edit2 },
    PUBLISHED: { label: "Recrutement", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", icon: Rocket },
    IN_PROGRESS: { label: "En Cours", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: Play },
    COMPLETED: { label: "Terminé", color: "text-signal", bgColor: "bg-signal/10 border-signal/20", icon: CheckCircle2 },
    CANCELLED: { label: "Annulé", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

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
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const [selectedOfferModules, setSelectedOfferModules] = useState<any[]>([]);
    const [loadingModules, setLoadingModules] = useState(false);

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
                console.error("Failed to fetch modules:", err);
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
                toast.success("Session mise à jour");
            } else {
                await trainingPeriodService.create(payload);
                toast.success("Nouvelle session créée");
            }
            setIsModalOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err.message || "Erreur d'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusAction = useCallback(async (id: string, action: string) => {
        setActionId(id);
        try {
            if (action === "publish") await trainingPeriodService.publish(id);
            else if (action === "start") await trainingPeriodService.start(id);
            else if (action === "complete") await trainingPeriodService.complete(id);
            else if (action === "cancel") {
                if (!confirm("Annuler définitivement cette session ?")) return;
                await trainingPeriodService.cancel(id);
            }
            toast.success("Statut mis à jour");
            refetch();
        } catch (err: any) {
            toast.error(err.message || "Action échouée");
        } finally {
            setActionId(null);
        }
    }, [refetch]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 text-signal animate-spin" />
            <p className="text-[10px] font-black text-mist uppercase tracking-widest animate-pulse">Chargement des sessions...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Gestion des <span className="text-signal">Sessions</span></h1>
                    <p className="text-mist font-medium">Pilotez vos cohortes, suivez les inscriptions et gérez le cycle de vie de vos formations.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-8 py-4 bg-signal text-asphalt font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-signal/80 transition-all shadow-lg shadow-signal/10 shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle Session
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-3 px-4">
                {["ALL", "DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => {
                    const isActive = filterStatus === status;
                    const config = status === "ALL" ? { label: "Toutes", color: "text-mist" } : STATUS_CONFIG[status];
                    const count = status === "ALL" ? periods.length : periods.filter(p => p.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isActive
                                ? "bg-signal/10 border-signal/30 text-signal shadow-[0_0_15px_rgba(255,193,7,0.1)]"
                                : "bg-white/[0.03] border-white/5 text-mist hover:text-snow hover:border-white/10"
                                }`}
                        >
                            {config.label} <span className="ml-1 opacity-40">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* Grid Content */}
            <div className="px-4">
                {filteredPeriods.length === 0 ? (
                    <div className="bg-white/[0.02] border border-dashed border-white/5 rounded-[3.5rem] p-24 text-center">
                        <Activity className="h-16 w-16 text-mist/10 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-snow mb-2 italic tracking-tight uppercase">Aucune session trouvée</h3>
                        <p className="text-mist text-xs max-w-sm mx-auto mb-10 font-bold uppercase tracking-widest opacity-60">Initialisez une nouvelle cohorte pour commencer le recrutement.</p>
                        <button onClick={handleOpenCreate} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-snow font-black text-[10px] uppercase tracking-widest hover:bg-signal hover:text-asphalt transition-all">
                            Créer ma première session
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPeriods.map((period) => {
                            const config = STATUS_CONFIG[period.status] || STATUS_CONFIG.DRAFT;
                            const Icon = config.icon;
                            const enrollmentRate = Math.min(((period.enrolledCount || 0) / (period.maxStudents || 30)) * 100, 100);
                            const isActioning = actionId === period.id;

                            return (
                                <div
                                    key={period.id}
                                    className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-signal/20 transition-all duration-500 flex flex-col h-full overflow-hidden"
                                >
                                    {/* Decorative Badge Overlay */}
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className={`h-10 w-10 rounded-xl ${config.bgColor} border flex items-center justify-center ${config.color} group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 block ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <h3 className="text-2xl font-black text-snow leading-tight group-hover:text-signal transition-colors uppercase tracking-tight">
                                                {period.name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-mist uppercase tracking-widest mt-1 flex items-center gap-2">
                                                <GraduationCap className="h-3 w-3 text-signal" /> {period.offerName}
                                            </p>
                                        </div>

                                        {/* Date Range Glass Card */}
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-mist uppercase tracking-tighter">Début</p>
                                                <p className="text-[11px] font-black text-snow tabular-nums">
                                                    {new Date(period.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-white/10" />
                                            <div className="space-y-1 text-right">
                                                <p className="text-[8px] font-black text-mist uppercase tracking-tighter">Fin estimée</p>
                                                <p className="text-[11px] font-black text-snow tabular-nums">
                                                    {new Date(period.endDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Enrollment Progress */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
                                                <span className="text-mist flex items-center gap-2">
                                                    <Users className="h-3.5 w-3.5 text-signal" /> {period.enrolledCount || 0} / {period.maxStudents || 30}
                                                </span>
                                                <span className="text-snow italic">{Math.round(enrollmentRate)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-signal shadow-[0_0_10px_rgba(255,193,7,0.3)] transition-all duration-1000"
                                                    style={{ width: `${enrollmentRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                                        <div className="flex gap-2">
                                            {period.status === "DRAFT" && (
                                                <button onClick={() => handleStatusAction(period.id, "publish")} disabled={isActioning} className="h-10 flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                    {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />} Publier
                                                </button>
                                            )}
                                            {period.status === "PUBLISHED" && (
                                                <button onClick={() => handleStatusAction(period.id, "start")} disabled={isActioning} className="h-10 flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
                                                    {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />} Démarrer
                                                </button>
                                            )}
                                            {period.status === "IN_PROGRESS" && (
                                                <button onClick={() => handleStatusAction(period.id, "complete")} disabled={isActioning} className="h-10 flex-1 bg-signal/10 border border-signal/20 rounded-xl text-signal text-[9px] font-black uppercase tracking-widest hover:bg-signal/20 transition-all flex items-center justify-center gap-2">
                                                    {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />} Terminer
                                                </button>
                                            )}

                                            {period.status !== "CANCELLED" && period.status !== "COMPLETED" && (
                                                <button onClick={() => handleOpenEdit(period)} className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl text-mist hover:text-snow flex items-center justify-center transition-all">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => router.push(`/dashboard/training-periods/${period.id}/planning`)}
                                            className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl text-snow text-[10px] font-black uppercase tracking-widest hover:bg-signal hover:text-asphalt transition-all flex items-center justify-center gap-3 group/link"
                                        >
                                            <BookOpen className="h-4 w-4 group-hover/link:animate-bounce" />
                                            Piloter le Planning
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Creation Wizard */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="">
                <div className="p-4 space-y-10">
                    <div className="flex items-center gap-3">
                        {[1, 2].map(step => (
                            <div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${currentStep >= step ? "bg-signal shadow-[0_0_15px_rgba(255,193,7,0.4)]" : "bg-white/5"}`} />
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="min-h-[450px] flex flex-col justify-between">
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            {currentStep === 1 ? (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-snow tracking-tight uppercase">Base de Données</h2>
                                        <p className="text-mist font-medium">Sélectionnez la formation de référence pour cette nouvelle cohorte.</p>
                                    </div>

                                    <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {offers.map(offer => (
                                            <label
                                                key={offer.id}
                                                className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer group ${formData.offerId === offer.id ? "bg-signal/10 border-signal/30" : "bg-white/[0.03] border-white/5 hover:border-white/10"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    name="offerId"
                                                    checked={formData.offerId === offer.id}
                                                    onChange={() => setFormData({ ...formData, offerId: offer.id, name: `Promotion ${offer.name} - ${new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}` })}
                                                />
                                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.offerId === offer.id ? "border-signal bg-signal/20" : "border-white/10 group-hover:border-signal/40"}`}>
                                                    {formData.offerId === offer.id && <div className="h-2.5 w-2.5 rounded-full bg-signal" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-snow text-sm group-hover:text-signal transition-colors uppercase leading-none">{offer.name}</h4>
                                                    <div className="flex items-center gap-3 mt-2 text-[9px] font-black text-mist uppercase tracking-widest">
                                                        <span>Permis {offer.permitType}</span>
                                                        <span className="h-1 w-1 rounded-full bg-white/20" />
                                                        <span>{offer.hours}H</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {formData.offerId && (
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 animate-in zoom-in-95 duration-500">
                                            <p className="text-[9px] font-black text-signal uppercase tracking-[0.2em] mb-4">Structure du Programme</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedOfferModules.map((m, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] text-snow font-bold">
                                                        <Target className="h-3 w-3 text-signal" /> {m.moduleName}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-snow tracking-tight uppercase">Calendrier & Capacité</h2>
                                        <p className="text-mist font-medium">Définissez les paramètres temporels et les limites de recrutement.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Titre de la Promotion</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Ouverture</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Clôture</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Capacité Maximale</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.maxStudents}
                                                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                                    className="h-14 bg-white/10 border-white/5 rounded-2xl px-6 font-black text-signal text-xl text-center"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Deadline Inscription</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.enrollmentDeadline}
                                                    onChange={(e) => setFormData({ ...formData, enrollmentDeadline: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Nav */}
                        <div className="flex gap-4 pt-10 mt-auto border-t border-white/5">
                            {currentStep > 1 ? (
                                <button type="button" onClick={() => setCurrentStep(1)} className="h-14 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Retour
                                </button>
                            ) : (
                                <button type="button" onClick={() => setIsModalOpen(false)} className="h-14 flex-1 rounded-2xl border border-white/10 text-mist text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                                    Annuler
                                </button>
                            )}

                            {currentStep === 1 ? (
                                <button
                                    type="button"
                                    onClick={() => formData.offerId ? setCurrentStep(2) : toast.error("Choix obligatoire")}
                                    className="h-14 flex-[2] rounded-2xl bg-snow text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal transition-all flex items-center justify-center gap-2 shadow-lg shadow-signal/10"
                                >
                                    Paramétrage Temporel <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-14 flex-[2] rounded-2xl bg-signal text-asphalt font-black uppercase tracking-widest text-[10px] hover:bg-signal/80 transition-all flex items-center justify-center gap-2 shadow-xl shadow-signal/20"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                    {editingId ? "Actualiser" : "Lancer la Cohorte"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
