"use client";

import { useState } from "react";
import { Plus, Search, Layers, Edit2, Trash2, GripVertical, BookOpen, Clock } from "lucide-react";
import { toast } from "sonner";

interface Module {
    id: string;
    name: string;
    category: string;
    description: string;
    requiredHours: number;
    orderIndex: number;
    offersCount: number;
}

const categoryConfig: Record<string, { label: string; color: string; icon: string }> = {
    CODE: { label: "Code", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "📖" },
    CONDUITE: { label: "Conduite", color: "bg-signal/10 text-signal border-signal/20", icon: "🚗" },
    EXAMEN_BLANC: { label: "Examen Blanc", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: "📝" },
};

export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("CODE");
    const [formDescription, setFormDescription] = useState("");
    const [formHours, setFormHours] = useState(10);

    const filteredModules = modules.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreate = () => {
        setEditingModule(null);
        setFormName(""); setFormCategory("CODE"); setFormDescription(""); setFormHours(10);
        setShowModal(true);
    };

    const openEdit = (mod: Module) => {
        setEditingModule(mod);
        setFormName(mod.name); setFormCategory(mod.category); setFormDescription(mod.description); setFormHours(mod.requiredHours);
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (!formName.trim()) { toast.error("Le nom du module est obligatoire"); return; }

        if (editingModule) {
            setModules(prev => prev.map(m => m.id === editingModule.id ? { ...m, name: formName.trim(), category: formCategory, description: formDescription.trim(), requiredHours: formHours } : m));
            toast.success("Module modifié");
        } else {
            const newModule: Module = {
                id: crypto.randomUUID(),
                name: formName.trim(),
                category: formCategory,
                description: formDescription.trim(),
                requiredHours: formHours,
                orderIndex: modules.length + 1,
                offersCount: 0,
            };
            setModules(prev => [...prev, newModule]);
            toast.success(`Module "${newModule.name}" créé avec succès`);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        setModules(prev => prev.filter(m => m.id !== id));
        toast.success("Module supprimé");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Modules</h1>
                    <p className="text-sm text-mist mt-0.5">{modules.length} module{modules.length > 1 ? "s" : ""} configuré{modules.length > 1 ? "s" : ""}</p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                    <Plus className="h-4 w-4" /> Nouveau module
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un module..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Layers className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucun module</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Créez des modules pour structurer vos formations (Code, Conduite, Examen Blanc).</p>
                    <button onClick={openCreate}
                        className="mt-4 flex items-center gap-2 bg-signal/10 text-signal font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-signal/20 transition-all">
                        <Plus className="h-4 w-4" /> Créer un module
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredModules.map((mod) => {
                        const cat = categoryConfig[mod.category] || categoryConfig.CODE;
                        return (
                            <div key={mod.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4 hover:border-white/10 transition-all group">
                                <GripVertical className="h-4 w-4 text-mist/20 cursor-grab shrink-0 hidden sm:block" />
                                <div className={`p-2.5 rounded-xl border text-sm ${cat.color} shrink-0`}>{cat.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-bold text-snow truncate">{mod.name}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cat.color}`}>{cat.label}</span>
                                    </div>
                                    <p className="text-xs text-mist/50 truncate">{mod.description}</p>
                                </div>
                                <div className="hidden lg:flex items-center gap-6 shrink-0">
                                    <div className="text-center"><p className="text-sm font-bold text-snow">{mod.requiredHours}h</p><p className="text-[10px] text-mist/40">Requis</p></div>
                                    <div className="text-center"><p className="text-sm font-bold text-snow">{mod.offersCount}</p><p className="text-[10px] text-mist/40">Offres</p></div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(mod)} className="p-2 rounded-lg hover:bg-white/5 text-mist hover:text-snow transition-all" title="Modifier"><Edit2 className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => handleDelete(mod.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-mist hover:text-red-400 transition-all" title="Supprimer"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow mb-5">
                            {editingModule ? "Modifier le module" : "Nouveau module"}
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Nom *</label>
                                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Code de la route"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Catégorie</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(categoryConfig).map(([key, conf]) => (
                                        <button key={key} type="button" onClick={() => setFormCategory(key)}
                                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${formCategory === key ? `${conf.color} border-current` : "bg-white/5 border-white/10 text-mist hover:border-white/20"}`}>
                                            <span className="text-lg block mb-1">{conf.icon}</span>
                                            {conf.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Description</label>
                                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Description du module..." rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Heures requises</label>
                                <input type="number" value={formHours} onChange={(e) => setFormHours(Number(e.target.value))} min={1} max={100}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-mist text-sm font-bold hover:bg-white/10 transition-all">Annuler</button>
                                <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                                    {editingModule ? "Enregistrer" : "Créer le module"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
