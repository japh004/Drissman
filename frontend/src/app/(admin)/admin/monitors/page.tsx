"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Phone, Mail, ShieldCheck, UserX } from "lucide-react";
import { toast } from "sonner";

interface Monitor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialties: string;
    status: string;
    sessionsThisWeek: number;
}

const statusConfig: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400" },
    INACTIVE: { label: "Inactif", class: "bg-mist/10 text-mist/60" },
    ON_LEAVE: { label: "En congé", class: "bg-yellow-500/10 text-yellow-400" },
};

export default function MonitorsPage() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formFirstName, setFormFirstName] = useState("");
    const [formLastName, setFormLastName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formSpecialties, setFormSpecialties] = useState("");

    const filtered = monitors.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => { setFormFirstName(""); setFormLastName(""); setFormEmail(""); setFormPhone(""); setFormSpecialties(""); };

    const handleCreate = () => {
        if (!formFirstName.trim() || !formLastName.trim()) { toast.error("Le nom et prénom sont obligatoires"); return; }
        if (!formEmail.trim()) { toast.error("L'email est obligatoire"); return; }

        const newMonitor: Monitor = {
            id: crypto.randomUUID(),
            firstName: formFirstName.trim(),
            lastName: formLastName.trim(),
            email: formEmail.trim(),
            phone: formPhone.trim(),
            specialties: formSpecialties.trim(),
            status: "ACTIVE",
            sessionsThisWeek: 0,
        };

        setMonitors(prev => [newMonitor, ...prev]);
        resetForm();
        setShowModal(false);
        toast.success(`Moniteur ${newMonitor.firstName} ${newMonitor.lastName} ajouté`);
    };

    const handleDelete = (id: string) => {
        setMonitors(prev => prev.filter(m => m.id !== id));
        toast.success("Moniteur supprimé");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Moniteurs</h1>
                    <p className="text-sm text-mist mt-0.5">{monitors.length} moniteur{monitors.length > 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                    <Plus className="h-4 w-4" /> Ajouter un moniteur
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <UserX className="h-16 w-16 text-mist/15 mb-4" />
                    <h3 className="text-lg font-bold text-snow/60 mb-1">Aucun moniteur</h3>
                    <p className="text-sm text-mist/40 max-w-sm">Ajoutez vos moniteurs pour pouvoir planifier des séances de conduite et de code.</p>
                    <button onClick={() => { resetForm(); setShowModal(true); }}
                        className="mt-4 flex items-center gap-2 bg-signal/10 text-signal font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-signal/20 transition-all">
                        <Plus className="h-4 w-4" /> Ajouter un moniteur
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((mon) => {
                        const st = statusConfig[mon.status] || statusConfig.ACTIVE;
                        return (
                            <div key={mon.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 hover:border-white/10 transition-all group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-signal/10 flex items-center justify-center text-signal font-black text-lg shrink-0">
                                        {mon.firstName[0]}{mon.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-snow">{mon.firstName} {mon.lastName}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-mist hover:text-snow transition-all"><Edit2 className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => handleDelete(mon.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-mist hover:text-red-400 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs text-mist/60">
                                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{mon.email}</div>
                                    {mon.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{mon.phone}</div>}
                                    {mon.specialties && <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" />{mon.specialties}</div>}
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                                    <span className="text-mist/40">{mon.sessionsThisWeek} séances cette semaine</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow mb-5">Nouveau moniteur</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Prénom *</label>
                                    <input type="text" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} placeholder="Jean-Paul"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Nom *</label>
                                    <input type="text" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} placeholder="Mbarga"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            </div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">E-mail *</label>
                                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="moniteur@ecole.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Téléphone</label>
                                <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+237 6XX XXX XXX"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Spécialités</label>
                                <input type="text" value={formSpecialties} onChange={(e) => setFormSpecialties(e.target.value)} placeholder="Permis B, Code..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-mist text-sm font-bold hover:bg-white/10 transition-all">Annuler</button>
                                <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">Créer le moniteur</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
