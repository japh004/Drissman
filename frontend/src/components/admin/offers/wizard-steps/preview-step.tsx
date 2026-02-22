import type { OfferWizardData } from "../offer-wizard";
import { ArrowLeft, Check, Loader2, Star, Clock, Car } from "lucide-react";
import { useAuth } from "@/hooks";
import { useModules } from "@/hooks/useModules";

interface PreviewStepProps {
    data: OfferWizardData;
    onBack: () => void;
    onSubmit: () => Promise<void>;
    isSubmitting: boolean;
}

export function PreviewStep({ data, onBack, onSubmit, isSubmitting }: PreviewStepProps) {
    const { user } = useAuth();
    const { modules } = useModules(user?.schoolId);

    // Get full module objects for the summary
    const selectedModules = modules.filter(m => data.selectedModuleIds.includes(m.id));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Résumé de l'Offre</h2>
                <p className="text-white/60 text-sm">Vérifiez les détails de votre nouvelle formule avant sa mise en ligne.</p>
            </div>

            <div className="bg-asphalt border border-white/10 rounded-2xl overflow-hidden">
                {/* Header Preview */}
                <div className="relative h-48 bg-asphalt">
                    {data.imageUrl ? (
                        <img
                            src={data.imageUrl}
                            alt={data.name}
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <Star className="h-12 w-12 text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/50 to-transparent" />

                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                        <span className="text-xs font-black text-white uppercase tracking-widest">
                            Permis {data.permitType}
                        </span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-3xl font-black text-white mb-2">{data.name}</h3>
                        <p className="text-signal font-bold text-xl">{data.price.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-white/70 mb-6 pb-6 border-b border-white/5">
                        {data.description || "Aucune description fournie pour cette formation."}
                    </p>

                    <div className="flex items-center gap-6 mb-8 text-sm">
                        <div className="flex items-center gap-2 text-white/60">
                            <Clock className="h-5 w-5 text-signal" />
                            <span className="font-medium">{data.hours}h de formation</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                            <Car className="h-5 w-5 text-signal" />
                            <span className="font-medium">Véhicule fourni</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Programme ({selectedModules.length} Modules)</h4>
                        <div className="grid gap-3">
                            {selectedModules.length > 0 ? (
                                selectedModules.map((m, idx) => (
                                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                            <div className="h-6 w-6 rounded-full bg-signal/20 text-signal flex items-center justify-center text-xs font-bold shrink-0">
                                                {idx + 1}
                                            </div>
                                            <span className="text-white font-medium">{m.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="px-2 py-1 rounded bg-white/10 font-medium text-white/60 capitalize">
                                                {m.category}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-signal/10 text-signal font-medium">
                                                {m.requiredHours}h
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/40 text-sm italic">Aucun module n'a été rattaché à cette offre.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-white/5 text-white/80 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Retour
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-signal text-asphalt px-8 py-3 rounded-xl font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-signal/20"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Création...
                        </>
                    ) : (
                        <>
                            <Check className="h-5 w-5" />
                            Confirmer & Créer
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
