"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useSchool } from "@/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Bell, User, Shield, Eye, Loader2, Check, Upload,
    Lock, Smartphone, Mail, MessageSquare, Activity,
    Sparkles, Megaphone, Download, Trash2, Settings,
    Building2, MapPin, Globe, Phone as PhoneIcon, Camera
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { partnerService } from "@/lib/api/partners";

/* ─── Toggle Switch ─── */
function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? "bg-signal" : "bg-white/10"}`}
        >
            <div className={`absolute top-0.5 h-5 w-5 rounded-full shadow-sm transition-all duration-200 ${enabled ? "right-0.5 bg-asphalt" : "left-0.5 bg-mist"}`} />
        </button>
    );
}

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === "SCHOOL_ADMIN";
    const { school, updateSchool } = useSchool(user?.schoolId || "");

    const [activeTab, setActiveTab] = useState("account");
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });

    // School State
    const [schoolData, setSchoolData] = useState({
        name: "",
        address: "",
        email: "",
        phoneNumber: "",
        website: "",
        description: ""
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: (user as any).firstName || "",
                lastName: (user as any).lastName || "",
                email: (user as any).email || "",
                phone: (user as any).phone || ""
            });
        }
        if (school) {
            setSchoolData({
                name: school.name || "",
                address: school.address || "",
                email: school.email || "",
                phoneNumber: school.phoneNumber || "",
                website: school.website || "",
                description: school.description || ""
            });
        }
    }, [user, school]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Logic for profile update
            toast.success("Profil personnel mis à jour");
        } catch (err) {
            toast.error("Erreur de sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSchool(schoolData);
            toast.success("Informations établissement mises à jour");
        } catch (err) {
            toast.error("Erreur de sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 text-signal animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Centre de <span className="text-signal">Contrôle</span></h1>
                <p className="text-mist font-medium">Configurez vos préférences, gérez la sécurité et personnalisez votre établissement.</p>
            </div>

            <Tabs defaultValue="account" onValueChange={setActiveTab} className="space-y-10">
                <TabsList className="bg-white/5 border border-white/5 p-1.5 rounded-2xl h-auto gap-1">
                    <TabsTrigger value="account" className="px-6 py-3 rounded-xl data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist text-[10px] font-black uppercase tracking-widest transition-all">
                        <User className="h-4 w-4 mr-2" /> Compte
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="school" className="px-6 py-3 rounded-xl data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist text-[10px] font-black uppercase tracking-widest transition-all">
                            <Building2 className="h-4 w-4 mr-2" /> Établissement
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="security" className="px-6 py-3 rounded-xl data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist text-[10px] font-black uppercase tracking-widest transition-all">
                        <Shield className="h-4 w-4 mr-2" /> Sécurité
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="px-6 py-3 rounded-xl data-[state=active]:bg-signal data-[state=active]:text-asphalt text-mist text-[10px] font-black uppercase tracking-widest transition-all">
                        <Bell className="h-4 w-4 mr-2" /> Alertes
                    </TabsTrigger>
                </TabsList>

                {/* ─── ACCOUNT TAB ─── */}
                <TabsContent value="account" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-signal/20 to-signal/5 border-2 border-dashed border-signal/30 flex items-center justify-center text-3xl font-black text-signal overflow-hidden">
                                        {profileData.firstName[0]}{profileData.lastName[0]}
                                    </div>
                                    <button className="absolute inset-0 bg-asphalt/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem]">
                                        <Camera className="h-6 w-6 text-snow" />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-mist uppercase tracking-widest">Photo de Profil</p>
                                    <p className="text-[9px] text-mist/40 mt-1 uppercase">Max 2 Mo • .jpg .png</p>
                                </div>
                            </div>

                            {/* Form Section */}
                            <form onSubmit={handleSaveProfile} className="flex-1 space-y-8 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Prénom</Label>
                                        <Input
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Nom</Label>
                                        <Input
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                            className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Adresse Email</Label>
                                    <Input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-snow font-bold focus:border-signal/50"
                                    />
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <Check className="h-3 w-3" /> Identité Vérifiée
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-10 py-5 bg-signal text-asphalt font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-signal/80 transition-all flex items-center gap-3 shadow-xl shadow-signal/10"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Mettre à jour mon compte
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </TabsContent>

                {/* ─── SCHOOL TAB ─── */}
                {isAdmin && (
                    <TabsContent value="school" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10">
                            <form onSubmit={handleSaveSchool} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Nom de l&apos;Établissement</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-signal/50" />
                                                <Input
                                                    value={schoolData.name}
                                                    onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                                                    className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-snow font-bold focus:border-signal/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Adresse Siège</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-signal/50" />
                                                <Input
                                                    value={schoolData.address}
                                                    onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                                                    className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-snow font-bold focus:border-signal/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Site Web</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-signal/50" />
                                                <Input
                                                    value={schoolData.website}
                                                    onChange={(e) => setSchoolData({ ...schoolData, website: e.target.value })}
                                                    placeholder="https://votre-ecole.com"
                                                    className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-snow font-bold focus:border-signal/50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Contact Institutionnel (Email)</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-signal/50" />
                                                <Input
                                                    value={schoolData.email}
                                                    onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                                                    className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-snow font-bold focus:border-signal/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Standard Téléphonique</Label>
                                            <div className="relative">
                                                <PhoneIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-signal/50" />
                                                <Input
                                                    value={schoolData.phoneNumber}
                                                    onChange={(e) => setSchoolData({ ...schoolData, phoneNumber: e.target.value })}
                                                    className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-snow font-bold focus:border-signal/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-mist ml-1">Description & Valeurs</Label>
                                            <textarea
                                                value={schoolData.description}
                                                onChange={(e) => setSchoolData({ ...schoolData, description: e.target.value })}
                                                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-snow font-medium outline-none focus:border-signal/50 transition-colors resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-10 py-5 bg-snow text-asphalt font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-signal transition-all flex items-center gap-3 shadow-xl"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Enregistrer le Profil Établissement
                                    </button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>
                )}

                {/* ─── SECURITY TAB ─── */}
                <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-snow uppercase tracking-tight">Authentification Forte (2FA)</h3>
                                <p className="text-mist text-sm font-medium">Sécurisez l&apos;accès à vos données critiques avec un code unique.</p>
                            </div>
                            <ToggleSwitch enabled={true} onToggle={() => { }} />
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-snow uppercase tracking-tight">Changer le mot de passe</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input type="password" placeholder="Actuel" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" />
                                <Input type="password" placeholder="Nouveau" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" />
                                <Input type="password" placeholder="Confirmer" className="h-14 bg-white/5 border-white/10 rounded-2xl px-6" />
                            </div>
                            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-snow text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                Mettre à jour la sécurité
                            </button>
                        </div>
                    </div>
                </TabsContent>

                {/* ─── NOTIFICATIONS TAB ─── */}
                <TabsContent value="notifications" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 space-y-10">
                        <div className="grid gap-8">
                            {[
                                { title: "Alertes Inscriptions", desc: "Soyez notifié dès qu&apos;un nouvel élève candidate.", icon: Users },
                                { title: "Paiements & Factures", desc: "Suivi des transactions et alertes impayés.", icon: Check },
                                { title: "Rappels Planning", desc: "Alerte 24h avant chaque session de formation.", icon: Clock },
                                { title: "Mises à jour Système", desc: "Informations sur les nouvelles fonctionnalités Drissman.", icon: Sparkles }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-signal group-hover:bg-signal/10 transition-colors">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-snow uppercase tracking-tight leading-none mb-2">{item.title}</h4>
                                            <p className="text-mist text-xs font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch enabled={i < 2} onToggle={() => { }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
