"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks";
import { Plus, Search, Edit2, Trash2, Phone, Mail, ShieldCheck, UserX, Eye, EyeOff, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Monitor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialties: string;
    status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
    sessionsThisWeek: number;
}

const statusConfig: Record<string, { label: string; class: string }> = {
    ACTIVE: { label: "Actif", class: "bg-green-500/10 text-green-400" },
    INACTIVE: { label: "Inactif", class: "bg-mist/10 text-mist/60" },
    ON_LEAVE: { label: "En congé", class: "bg-yellow-500/10 text-yellow-400" },
};

export default function MonitorsPage() {
    const [monitors, setMonitors] = useLocalStorage<Monitor[]>("monitors", []);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showCreated, setShowCreated] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState({ email: "", password: "" });

    // Form state
    const [formFirstName, setFormFirstName] = useState("");
    const [formLastName, setFormLastName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formSpecialties, setFormSpecialties] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const filtered = monitors.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormFirstName(""); setFormLastName(""); setFormEmail("");
        setFormPhone(""); setFormSpecialties(""); setFormPassword("");
        setShowPassword(false);
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        let pwd = "";
        for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
        setFormPassword(pwd);
        setShowPassword(true);
    };

    const handleCreate = () => {
        if (!formFirstName.trim() || !formLastName.trim()) { toast.error("Le nom et prénom sont obligatoires"); return; }
        if (!formEmail.trim()) { toast.error("L'email est obligatoire"); return; }
        if (!formPassword.trim() || formPassword.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }

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
        setCreatedCredentials({ email: formEmail.trim(), password: formPassword });
        setShowModal(false);
        setShowCreated(true);
        resetForm();
        toast.success(`Moniteur ${newMonitor.firstName} ${newMonitor.lastName} créé`);
    };

    const handleDelete = (id: string) => {
        setMonitors(prev => prev.filter(m => m.id !== id));
        toast.success("Moniteur supprimé");
    };

    const handleStatusChange = (id: string, newStatus: Monitor["status"]) => {
        setMonitors(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        toast.success(`Statut mis à jour`);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copié dans le presse-papiers");
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
                    <p className="text-sm text-mist/40 max-w-sm">Ajoutez vos moniteurs pour planifier des séances. Vous définissez leur email et mot de passe de connexion.</p>
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
                                        <select value={mon.status} onChange={e => handleStatusChange(mon.id, e.target.value as Monitor["status"])}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border-0 cursor-pointer ${st.class} bg-transparent`}>
                                            <option value="ACTIVE" className="bg-asphalt text-snow">Actif</option>
                                            <option value="INACTIVE" className="bg-asphalt text-snow">Inactif</option>
                                            <option value="ON_LEAVE" className="bg-asphalt text-snow">En congé</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

            {/* Create Modal with Password */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow mb-5">Nouveau moniteur</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Prénom *</label>
                                    <input type="text" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} placeholder="Jean-Paul"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                                <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Nom *</label>
                                    <input type="text" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} placeholder="Mbarga"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            </div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">E-mail (login) *</label>
                                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="moniteur@ecole.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>

                            {/* Password field */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Mot de passe *</label>
                                    <button type="button" onClick={generatePassword}
                                        className="text-[10px] text-signal hover:text-signal/80 font-bold transition-colors">
                                        Générer automatiquement
                                    </button>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={formPassword}
                                        onChange={(e) => setFormPassword(e.target.value)} placeholder="Min. 6 caractères"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-mist/40 hover:text-mist transition-colors">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-mist/30">Ce mot de passe permettra au moniteur de se connecter à son espace.</p>
                            </div>

                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Téléphone</label>
                                <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+237 6XX XXX XXX"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Spécialités</label>
                                <input type="text" value={formSpecialties} onChange={(e) => setFormSpecialties(e.target.value)} placeholder="Permis B, Code, Conduite..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-mist text-sm font-bold hover:bg-white/10 transition-all">Annuler</button>
                                <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">Créer le moniteur</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credentials Confirmation Modal */}
            {showCreated && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreated(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-snow">Moniteur créé !</h2>
                                <p className="text-xs text-mist/50">Communiquez ces identifiants au moniteur</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-5">
                            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                                <p className="text-[10px] text-mist/40 uppercase tracking-wider mb-1">Email de connexion</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-snow font-mono">{createdCredentials.email}</p>
                                    <button onClick={() => copyToClipboard(createdCredentials.email)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow transition-all">
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                                <p className="text-[10px] text-mist/40 uppercase tracking-wider mb-1">Mot de passe</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-snow font-mono">{createdCredentials.password}</p>
                                    <button onClick={() => copyToClipboard(createdCredentials.password)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-mist/40 hover:text-snow transition-all">
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-yellow-400/60 bg-yellow-500/5 rounded-lg p-3 mb-4">
                            ⚠️ Ce mot de passe ne sera plus affiché. Prenez-en note maintenant.
                        </p>

                        <button onClick={() => setShowCreated(false)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                            Compris, fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
