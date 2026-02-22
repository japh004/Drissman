import type { OfferWizardData } from "../offer-wizard";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

interface BasicInfoStepProps {
    data: OfferWizardData;
    updateData: (data: Partial<OfferWizardData>) => void;
    onNext: () => void;
}

export function BasicInfoStep({ data, updateData, onNext }: BasicInfoStepProps) {
    const isFormValid = data.name.trim() !== "" && data.price > 0 && data.hours > 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">Informations de la Formule</h2>
                <p className="text-white/60 text-sm">Définissez les propriétés principales de la nouvelle offre d'apprentissage.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white/80">Nom de la formule *</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        placeholder="Ex: Permis B Accéléré"
                        className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all font-medium"
                        required
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white/80">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => updateData({ description: e.target.value })}
                        placeholder="Décrivez brièvement les avantages et le public cible de cette formule..."
                        rows={3}
                        className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Prix (FCFA) *</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.price || ''}
                            onChange={(e) => updateData({ price: Number(e.target.value) })}
                            placeholder="150000"
                            className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 pr-16 text-white placeholder-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all font-bold"
                            required
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <span className="text-white/40 font-medium text-sm">FCFA</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Heures de conduite incluses *</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.hours || ''}
                            onChange={(e) => updateData({ hours: Number(e.target.value) })}
                            placeholder="20"
                            className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all"
                            required
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <span className="text-white/40 font-medium text-sm">heures</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Type de Permis</label>
                    <select
                        value={data.permitType}
                        onChange={(e) => updateData({ permitType: e.target.value })}
                        className="w-full bg-asphalt border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all appearance-none"
                    >
                        <option value="B">Permis B (Auto)</option>
                        <option value="A">Permis A (Moto)</option>
                        <option value="A1">Permis A1 (Scout)</option>
                        <option value="C">Permis C (Poids Lourd)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Image d'illustration (URL)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <ImageIcon className="h-5 w-5 text-white/40" />
                        </div>
                        <input
                            type="url"
                            value={data.imageUrl || ''}
                            onChange={(e) => updateData({ imageUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-asphalt border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/50 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
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
