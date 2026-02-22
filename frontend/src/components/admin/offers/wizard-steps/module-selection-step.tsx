import type { OfferWizardData } from "../offer-wizard";
import { useAuth } from "@/hooks";
import { useModules } from "@/hooks/useModules";
import { ArrowLeft, ArrowRight, Loader2, Link as LinkIcon, CheckCircle2, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface ModuleSelectionStepProps {
    data: OfferWizardData;
    updateData: (data: Partial<OfferWizardData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function ModuleSelectionStep({ data, updateData, onNext, onBack }: ModuleSelectionStepProps) {
    const { user } = useAuth();
    const { modules, loading } = useModules(user?.schoolId);

    const [searchQuery, setSearchQuery] = useState("");

    const toggleModule = (moduleId: string) => {
        const isSelected = data.selectedModuleIds.includes(moduleId);
        const newSelection = isSelected
            ? data.selectedModuleIds.filter(id => id !== moduleId)
            : [...data.selectedModuleIds, moduleId];

        updateData({ selectedModuleIds: newSelection });
    };

    const isFormValid = data.selectedModuleIds.length > 0;

    const filteredModules = useMemo(() => {
        return modules.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [modules, searchQuery]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Curriculum & Modules</h2>
                <p className="text-white/60 text-sm">Sélectionnez les modules d'apprentissage qui seront inclus dans cette formule.</p>
            </div>

            <div className="bg-asphalt border border-white/10 rounded-2xl p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Rechercher un module (Code, Conduite, Théorie...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-asphalt-light border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all font-medium"
                    />
                </div>

                <div className="space-y-3 pb-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 text-signal animate-spin mb-4" />
                            <p className="text-white/60">Chargement des modules...</p>
                        </div>
                    ) : filteredModules.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-white/40">Aucun module trouvé. Veuillez créer des modules depuis l'onglet Curriculums.</p>
                        </div>
                    ) : (
                        filteredModules.map((moduleItem) => {
                            const isSelected = data.selectedModuleIds.includes(moduleItem.id);

                            return (
                                <div
                                    key={moduleItem.id}
                                    onClick={() => toggleModule(moduleItem.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-start gap-4
                                        ${isSelected
                                            ? 'bg-signal/10 border-signal/50 ring-1 ring-signal'
                                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                    `}
                                >
                                    <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors
                                        ${isSelected ? 'bg-signal border-signal text-asphalt' : 'border-white/30 text-transparent'}
                                    `}>
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`font-bold ${isSelected ? 'text-signal' : 'text-white'}`}>
                                                {moduleItem.name}
                                            </h4>
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 uppercase tracking-wider font-bold">
                                                {moduleItem.category}
                                            </span>
                                        </div>
                                        {moduleItem.description && (
                                            <p className="text-sm text-white/60 line-clamp-2">{moduleItem.description}</p>
                                        )}
                                        <div className="mt-3 flex items-center gap-4 text-xs font-medium">
                                            <span className="text-white/40 flex items-center gap-1">
                                                <LinkIcon className="h-3 w-3" />
                                                {moduleItem.requiredHours}h minimum
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-signal/5 rounded-xl p-4 border border-signal/20 flex items-start gap-3">
                <div className="p-2 bg-signal/10 rounded-lg text-signal mt-0.5">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-signal mb-1">Sélection requise</h4>
                    <p className="text-xs text-white/70">
                        Votre offre doit inclure au moins un (1) module pour être valide. Vous pourrez ajuster la pondération et les tarifs dynamiques plus tard.
                    </p>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 bg-white/5 text-white/80 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Retour
                </button>
                <button
                    onClick={onNext}
                    disabled={!isFormValid}
                    className="flex items-center gap-2 bg-signal text-asphalt px-6 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continuer
                    <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
