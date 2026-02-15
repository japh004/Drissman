"use client";

import { useState } from "react";
import { useAuth, useModules } from "@/hooks";
import { Module, CreateModulePayload } from "@/types/module";
import {
    BookOpen,
    Car,
    FileCheck,
    Plus,
    GripVertical,
    Loader2,
    Edit3,
    Trash2,
    Clock,
    Hash,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const CATEGORY_CONFIG = {
    CODE: { label: "Code", icon: BookOpen, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    CONDUITE: { label: "Conduite", icon: Car, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
    EXAMEN_BLANC: { label: "Examen Blanc", icon: FileCheck, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
};

export default function CurriculumPage() {
    const { user } = useAuth();
    const schoolId = user?.schoolId || "";
    const { modules, loading, createModule, updateModule, deleteModule } = useModules(schoolId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>("CODE");

    const [formState, setFormState] = useState<CreateModulePayload>({
        name: "",
        category: "CODE",
        description: "",
        orderIndex: 0,
        requiredHours: 1,
    });

    const openCreateModal = (category: string = "CODE") => {
        const categoryModules = modules.filter(m => m.category === category);
        setFormState({
            name: "",
            category,
            description: "",
            orderIndex: categoryModules.length,
            requiredHours: 1,
        });
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const openEditModal = (mod: Module) => {
        setFormState({
            name: mod.name,
            category: mod.category,
            description: mod.description || "",
            orderIndex: mod.orderIndex,
            requiredHours: mod.requiredHours,
        });
        setEditingModule(mod);
        setIsModalOpen(true);
    };

    const handleDelete = async (mod: Module) => {
        const confirmed = window.confirm(`Supprimer le module "${mod.name}" ?`);
        if (!confirmed) return;
        await deleteModule(mod.id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingModule) {
                await updateModule(editingModule.id, formState);
            } else {
                await createModule(formState);
            }
            setIsModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoryGroups = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
        key,
        config,
        modules: modules.filter(m => m.category === key).sort((a, b) => a.orderIndex - b.orderIndex),
        totalHours: modules.filter(m => m.category === key).reduce((sum, m) => sum + m.requiredHours, 0),
    }));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-12 w-12 text-signal animate-spin" />
                <p className="text-mist font-bold uppercase tracking-widest text-xs">Chargement du programme...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-signal" />
                        Programme de Formation
                    </h1>
                    <p className="text-mist font-bold">Structurez votre cursus de formation par modules thématiques.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryGroups.map(({ key, config, modules: catModules, totalHours }) => {
                    const Icon = config.icon;
                    return (
                        <div key={key} className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-5`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-xl ${config.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${config.color}`} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-black uppercase tracking-wider ${config.color}`}>{config.label}</h3>
                                    <p className="text-mist text-[10px] font-bold">{catModules.length} modules · {totalHours}h</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Module Lists by Category */}
            <div className="space-y-4">
                {categoryGroups.map(({ key, config, modules: catModules, totalHours }) => {
                    const Icon = config.icon;
                    const isExpanded = expandedCategory === key;

                    return (
                        <div key={key} className="bg-asphalt/30 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden">
                            {/* Category Header */}
                            <button
                                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${config.bgColor} border ${config.borderColor}`}>
                                        <Icon className={`h-6 w-6 ${config.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-black text-snow uppercase tracking-tight">{config.label}</h2>
                                        <p className="text-mist font-bold text-xs">{catModules.length} modules · {totalHours}h de formation</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); openCreateModal(key); }}
                                        variant="ghost"
                                        className={`${config.color} hover:${config.bgColor} font-bold text-xs uppercase`}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Ajouter
                                    </Button>
                                    {isExpanded ? <ChevronUp className="h-5 w-5 text-mist" /> : <ChevronDown className="h-5 w-5 text-mist" />}
                                </div>
                            </button>

                            {/* Module List */}
                            {isExpanded && (
                                <div className="border-t border-white/5 divide-y divide-white/[0.03]">
                                    {catModules.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-mist font-bold text-sm">Aucun module créé</p>
                                            <p className="text-mist/50 text-xs mt-1">Cliquez sur &quot;Ajouter&quot; pour commencer</p>
                                        </div>
                                    ) : (
                                        catModules.map((mod, index) => (
                                            <div key={mod.id} className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors group">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="text-mist/30 font-black text-sm w-6 text-center">{index + 1}</span>
                                                    <GripVertical className="h-4 w-4 text-mist/20 group-hover:text-mist/50 transition-colors cursor-grab" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-base font-black text-snow tracking-tight truncate">{mod.name}</h4>
                                                        {mod.description && (
                                                            <p className="text-xs text-mist/60 mt-0.5 truncate">{mod.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-mist text-xs">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="font-bold">{mod.requiredHours}h</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => openEditModal(mod)}
                                                            className="p-2 h-auto text-mist hover:text-signal"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleDelete(mod)}
                                                            className="p-2 h-auto text-mist hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Module Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingModule ? "Modifier le module" : "Nouveau module"}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist">Catégorie</Label>
                        <div className="flex gap-2">
                            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                                const CatIcon = cfg.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFormState({ ...formState, category: key })}
                                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-black uppercase ${formState.category === key
                                            ? `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`
                                            : 'bg-white/5 border-white/10 text-mist hover:bg-white/10'
                                            }`}
                                    >
                                        <CatIcon className="h-4 w-4" />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist">Nom du module *</Label>
                        <Input
                            placeholder="Ex: Signalisation routière"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className="bg-white/5 border-white/10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist">Description</Label>
                        <textarea
                            placeholder="Contenu du module, objectifs pédagogiques..."
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-snow outline-none focus:border-signal/50 min-h-[80px] resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist">Heures requises</Label>
                            <Input
                                type="number"
                                value={formState.requiredHours}
                                onChange={(e) => setFormState({ ...formState, requiredHours: parseInt(e.target.value) || 1 })}
                                className="bg-white/5 border-white/10"
                                min={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-mist">Ordre</Label>
                            <Input
                                type="number"
                                value={formState.orderIndex}
                                onChange={(e) => setFormState({ ...formState, orderIndex: parseInt(e.target.value) || 0 })}
                                className="bg-white/5 border-white/10"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">Annuler</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-signal text-asphalt font-black uppercase tracking-widest text-xs py-6">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingModule ? "Enregistrer" : "Créer le module"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
