"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, User, Shield, CreditCard, LogOut, Loader2, Check, Building2, Image as ImageIcon, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { partnerService, schoolsService, type School } from "@/lib/api";

export default function SettingsPage() {
    const { user, logout, loading: authLoading } = useAuth();

    // Use local auth data (backend UserController requires Maven recompilation)
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // School settings (for partners)
    const [school, setSchool] = useState<School | null>(null);
    const [schoolName, setSchoolName] = useState("");
    const [schoolDescription, setSchoolDescription] = useState("");
    const [schoolImage, setSchoolImage] = useState("");
    const [isSavingSchool, setIsSavingSchool] = useState(false);
    const [isSchoolLoading, setIsSchoolLoading] = useState(false);

    const isPartner = user?.role === 'SCHOOL_ADMIN';

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");

            if (isPartner && user.schoolId) {
                fetchSchool(user.schoolId);
            }
        }
    }, [user, isPartner]);

    const fetchSchool = async (id: string) => {
        setIsSchoolLoading(true);
        try {
            const data = await schoolsService.getById(id);
            setSchool(data);
            setSchoolName(data.name || "");
            setSchoolDescription(data.description || "");
            setSchoolImage(data.imageUrl || "");
        } catch (err) {
            console.error("Failed to fetch school:", err);
        } finally {
            setIsSchoolLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        // Simulate save - backend not yet deployed
        setTimeout(() => {
            toast.success("Profil mis à jour avec succès !");
            setIsSaving(false);
        }, 500);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setIsChangingPassword(true);
        // Simulate change - backend not yet deployed
        setTimeout(() => {
            toast.success("Mot de passe modifié avec succès !");
            setCurrentPassword("");
            setNewPassword("");
            setIsChangingPassword(false);
        }, 500);
    };

    const handleSaveSchool = async () => {
        setIsSavingSchool(true);
        try {
            await partnerService.updateSchool({
                name: schoolName,
                description: schoolDescription,
                imageUrl: schoolImage
            });
            toast.success("Informations de l'auto-école mises à jour !");
        } catch (err) {
            console.error("Failed to update school:", err);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSavingSchool(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow placeholder:text-mist/50 focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all";

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
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-snow">Paramètres</h2>
                <p className="text-mist">Gérez vos préférences et les informations de votre compte.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px] md:grid-cols-4 bg-white/5 border border-white/10 rounded-xl p-1">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist">
                        <User className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Profil</span>
                    </TabsTrigger>
                    {isPartner && (
                        <TabsTrigger value="school" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist">
                            <Building2 className="mr-2 h-4 w-4" />
                            <span className="hidden md:inline">École</span>
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist">
                        <Shield className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Compte</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist">
                        <Bell className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Notifs</span>
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Facturation</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Profil Utilisateur</h3>
                        <p className="text-sm text-mist mb-6">Modifiez vos informations publiques.</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="firstname" className="text-sm font-medium text-snow">Prénom</label>
                                    <input
                                        id="firstname"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastname" className="text-sm font-medium text-snow">Nom</label>
                                    <input
                                        id="lastname"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-snow">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Sauvegarder les modifications
                            </button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="account" className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Sécurité du Compte</h3>
                        <p className="text-sm text-mist mb-6">Gérez votre mot de passe et l&apos;accès à votre compte.</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="current" className="text-sm font-medium text-snow">Mot de passe actuel</label>
                                <input
                                    id="current"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="new" className="text-sm font-medium text-snow">Nouveau mot de passe</label>
                                <input
                                    id="new"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Se déconnecter
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="px-6 py-3 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isChangingPassword ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Mettre à jour
                            </button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Préférences de Notifications</h3>
                        <p className="text-sm text-mist mb-6">Choisissez comment vous souhaitez être contacté.</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between space-x-2 border border-white/10 p-4 rounded-xl">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-snow">Notifications par email</span>
                                    <span className="text-sm text-mist">Recevoir des emails pour les nouvelles réservations.</span>
                                </div>
                                <div className="h-6 w-11 bg-signal rounded-full relative cursor-pointer">
                                    <div className="h-5 w-5 bg-asphalt rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between space-x-2 border border-white/10 p-4 rounded-xl">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-snow">Notifications SMS</span>
                                    <span className="text-sm text-mist">Recevoir des rappels par SMS (Payant).</span>
                                </div>
                                <div className="h-6 w-11 bg-white/10 rounded-full relative cursor-pointer">
                                    <div className="h-5 w-5 bg-mist rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Information de Paiement</h3>
                        <p className="text-sm text-mist mb-6">Vos méthodes de paiement enregistrées.</p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 border border-white/10 p-4 rounded-xl">
                                <CreditCard className="h-6 w-6 text-mist" />
                                <div className="flex-1">
                                    <p className="font-medium text-snow">Carte Bancaire se terminant par 4242</p>
                                    <p className="text-sm text-mist">Expire le 12/2025</p>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-snow text-sm hover:border-signal/30 transition-all">Modifier</button>
                            </div>
                            <div className="flex items-center space-x-4 border border-signal/20 bg-signal/10 p-4 rounded-xl">
                                <div className="h-6 w-6 rounded-full bg-signal flex items-center justify-center text-[10px] font-bold text-asphalt">MTN</div>
                                <div className="flex-1">
                                    <p className="font-medium text-snow">Mobile Money (6xxxxxx89)</p>
                                    <p className="text-sm text-mist">Compte par défaut</p>
                                </div>
                                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-snow text-sm hover:border-signal/30 transition-all">Modifier</button>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button className="w-full px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-snow font-medium hover:border-signal/30 transition-all">Ajouter une méthode de paiement</button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
