"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Bell, User, Shield, Eye, Loader2, Check, Upload,
    Lock, Smartphone, Mail, MessageSquare, Activity,
    Sparkles, Megaphone, Download, Trash2, Settings
} from "lucide-react";
import { toast } from "sonner";

/* ─── Toggle Switch ─── */
function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? "bg-signal" : "bg-white/10"
                }`}
        >
            <div
                className={`absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-200 ${enabled
                    ? "right-0.5 bg-asphalt"
                    : "left-0.5 bg-mist"
                    }`}
            />
        </button>
    );
}

/* ─── Notification Row ─── */
function NotificationRow({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
}: {
    icon: any;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border border-white/10 p-4 rounded-xl">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-mist mt-0.5">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-snow">{title}</span>
                    <span className="text-sm text-mist">{description}</span>
                </div>
            </div>
            <ToggleSwitch enabled={enabled} onToggle={onToggle} />
        </div>
    );
}

export default function SettingsPage() {
    const { user, logout, loading: authLoading } = useAuth();

    /* ─── Account State ─── */
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    /* ─── Security State ─── */
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    /* ─── Notifications State ─── */
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(false);
    const [activityNotifs, setActivityNotifs] = useState(true);
    const [featureNotifs, setFeatureNotifs] = useState(true);
    const [marketingNotifs, setMarketingNotifs] = useState(false);
    const [notifFrequency, setNotifFrequency] = useState("daily");
    const [quietStart, setQuietStart] = useState("22:00");
    const [quietEnd, setQuietEnd] = useState("07:00");

    /* ─── Privacy State ─── */
    const [shareUsageData, setShareUsageData] = useState(true);
    const [personalizedContent, setPersonalizedContent] = useState(false);
    const [accountVisibility, setAccountVisibility] = useState("private");
    const [dataRetention, setDataRetention] = useState("1year");

    useEffect(() => {
        if (user) {
            const u = user as any;
            setFirstName(u.firstName || "");
            setLastName(u.lastName || "");
            setEmail(u.email || "");
            setPhone(u.phone || "");
            setUsername(u.username || u.email?.split("@")[0] || "");
        }
    }, [user]);

    /* ─── Handlers ─── */
    const handleSaveProfile = async () => {
        setIsSaving(true);
        setTimeout(() => {
            toast.success("Profil mis à jour avec succès !");
            setIsSaving(false);
        }, 500);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
            return;
        }
        setIsChangingPassword(true);
        setTimeout(() => {
            toast.success("Mot de passe modifié avec succès !");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setIsChangingPassword(false);
        }, 500);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
            toast.success("Photo de profil mise à jour !");
        }
    };

    const inputClass =
        "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow placeholder:text-mist/50 focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all";
    const selectClass =
        "px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-snow focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all appearance-none cursor-pointer";

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                </div>
                <p className="text-mist font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-signal/10 text-signal">
                    <Settings className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-snow">Paramètres</h2>
                    <p className="text-mist">Gérez vos préférences et les informations de votre compte.</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:w-[500px] md:grid-cols-4 bg-white/5 border border-white/10 rounded-xl p-1">
                    <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline">Compte</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden md:inline">Sécurité</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden md:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist gap-2">
                        <Eye className="h-4 w-4" />
                        <span className="hidden md:inline">Confidentialité</span>
                    </TabsTrigger>
                </TabsList>

                {/* ════════════════ ACCOUNT TAB ════════════════ */}
                <TabsContent value="account" className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Profil du Compte</h3>
                        <p className="text-sm text-mist mb-6">Gérez vos informations personnelles et votre photo de profil.</p>

                        {/* Profile Photo */}
                        <div className="mb-8">
                            <label className="text-sm font-medium text-snow mb-3 block">Photo de Profil</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-sm border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-signal/40 transition-colors group"
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover mb-3" />
                                ) : (
                                    <div className="h-24 w-24 rounded-full bg-signal/10 flex items-center justify-center text-signal text-2xl font-black mb-3 border border-signal/20">
                                        {user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "JD"}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-signal group-hover:text-signal-dark transition-colors">
                                    <Upload className="h-4 w-4" />
                                    <span className="text-sm font-medium">Cliquer pour uploader</span>
                                </div>
                                <span className="text-xs text-mist mt-1">PNG, JPG, GIF, WEBP (MAX. 5MB)</span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstname" className="text-sm font-medium text-snow">Prénom</label>
                                    <input id="firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastname" className="text-sm font-medium text-snow">Nom</label>
                                    <input id="lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium text-snow">Nom d&apos;utilisateur</label>
                                <input id="username" value={username} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
                                <p className="text-xs text-mist">Votre nom d&apos;utilisateur unique (ne peut pas être modifié).</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-snow">Email</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                                <p className="text-xs text-signal/70">Email non vérifié.</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-snow">Numéro de téléphone</label>
                                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="Ex: 659096430" />
                                <p className="text-xs text-mist">Téléphone non vérifié (si applicable).</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Sauvegarder les modifications
                            </button>
                        </div>
                    </div>
                </TabsContent>

                {/* ════════════════ SECURITY TAB ════════════════ */}
                <TabsContent value="security" className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Paramètres de Sécurité</h3>
                        <p className="text-sm text-mist mb-6">Gérez votre mot de passe et les fonctionnalités de sécurité de votre compte.</p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="current-password" className="text-sm font-medium text-snow">Mot de passe actuel</label>
                                <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} placeholder="Entrez votre mot de passe actuel" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="new-password" className="text-sm font-medium text-snow">Nouveau mot de passe</label>
                                <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} placeholder="Entrez un nouveau mot de passe" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirm-password" className="text-sm font-medium text-snow">Confirmer le nouveau mot de passe</label>
                                <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Confirmez votre nouveau mot de passe" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                Changer le mot de passe
                            </button>
                        </div>
                    </div>

                    {/* 2FA Section */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-snow">Authentification à deux facteurs (2FA)</h3>
                                <p className="text-sm text-mist mt-1">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                            </div>
                            <ToggleSwitch enabled={twoFactorEnabled} onToggle={() => {
                                setTwoFactorEnabled(!twoFactorEnabled);
                                toast.success(twoFactorEnabled ? "2FA désactivé" : "2FA activé");
                            }} />
                        </div>
                    </div>
                </TabsContent>

                {/* ════════════════ NOTIFICATIONS TAB ════════════════ */}
                <TabsContent value="notifications" className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Préférences de Notifications</h3>
                        <p className="text-sm text-mist mb-6">Choisissez comment vous recevez vos notifications.</p>

                        <div className="space-y-3">
                            <NotificationRow icon={Mail} title="Notifications par Email" description="Recevez les mises à jour importantes par email." enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
                            <NotificationRow icon={Smartphone} title="Notifications Push (App)" description="Recevez les alertes en temps réel dans l&apos;application." enabled={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} />
                            <NotificationRow icon={MessageSquare} title="Notifications SMS" description="Recevez les alertes critiques par SMS." enabled={smsNotifs} onToggle={() => setSmsNotifs(!smsNotifs)} />
                        </div>

                        <div className="border-t border-white/10 my-6" />

                        <div className="space-y-3">
                            <NotificationRow icon={Activity} title="Activité du Compte" description="Alertes de connexion, changements de mot de passe, etc." enabled={activityNotifs} onToggle={() => setActivityNotifs(!activityNotifs)} />
                            <NotificationRow icon={Sparkles} title="Nouvelles Fonctionnalités" description="Restez informé des nouvelles fonctionnalités de la plateforme." enabled={featureNotifs} onToggle={() => setFeatureNotifs(!featureNotifs)} />
                            <NotificationRow icon={Megaphone} title="Marketing & Promotions" description="Recevez des offres et du contenu promotionnel." enabled={marketingNotifs} onToggle={() => setMarketingNotifs(!marketingNotifs)} />
                        </div>
                    </div>

                    {/* Frequency & Quiet Hours */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-snow">Fréquence des Notifications</label>
                                <select value={notifFrequency} onChange={(e) => setNotifFrequency(e.target.value)} className={selectClass}>
                                    <option value="realtime">Temps Réel</option>
                                    <option value="daily">Résumé Quotidien</option>
                                    <option value="weekly">Résumé Hebdomadaire</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-snow">Heures Silencieuses (Notifications en pause)</label>
                                <div className="flex items-center gap-3">
                                    <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className={`${inputClass} w-auto`} />
                                    <span className="text-mist font-medium">à</span>
                                    <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className={`${inputClass} w-auto`} />
                                </div>
                                <p className="text-xs text-mist">Définissez une plage horaire pour mettre en pause les notifications non critiques.</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* ════════════════ PRIVACY TAB ════════════════ */}
                <TabsContent value="privacy" className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Confidentialité & Données</h3>
                        <p className="text-sm text-mist mb-6">Gérez vos paramètres de partage de données et les actions sur votre compte.</p>

                        <div className="space-y-3">
                            <NotificationRow icon={Activity} title="Partager les données d&apos;utilisation" description="Améliorez la plateforme en partageant des analyses anonymisées." enabled={shareUsageData} onToggle={() => setShareUsageData(!shareUsageData)} />
                            <NotificationRow icon={Sparkles} title="Contenu & Offres Personnalisées" description="Permettez-nous de personnaliser le contenu et les offres selon votre activité." enabled={personalizedContent} onToggle={() => setPersonalizedContent(!personalizedContent)} />
                        </div>

                        <div className="border-t border-white/10 my-6" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-snow">Visibilité du Compte</label>
                                <select value={accountVisibility} onChange={(e) => setAccountVisibility(e.target.value)} className={selectClass}>
                                    <option value="private">Privé</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-snow">Politique de Rétention des Données</label>
                                <select value={dataRetention} onChange={(e) => setDataRetention(e.target.value)} className={selectClass}>
                                    <option value="6months">6 Mois</option>
                                    <option value="1year">1 An</option>
                                    <option value="2years">2 Ans</option>
                                    <option value="forever">Indéfini</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 space-y-4">
                        <button className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-snow font-medium hover:border-signal/30 transition-all flex items-center justify-center gap-2">
                            <Download className="h-4 w-4" />
                            Télécharger Mes Données
                        </button>
                        <button
                            onClick={() => {
                                if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
                                    toast.error("Fonctionnalité non disponible en mode démo.");
                                }
                            }}
                            className="w-full px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Supprimer Mon Compte
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
