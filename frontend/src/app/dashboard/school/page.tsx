"use client";

import { useState, useEffect } from "react";
import { useSchools, useAuth } from "@/hooks";
import { partnerService } from "@/lib/api";
import { toast } from "sonner";
import {
    Image as ImageIcon,
    Upload,
    Save,
    Building2,
    FileText,
    Loader2,
    Shield,
    Camera
} from "lucide-react";

export default function SchoolProfilePage() {
    const { user } = useAuth();
    const { schools, loading: schoolsLoading } = useSchools();
    const [saving, setSaving] = useState(false);

    const [schoolInfo, setSchoolInfo] = useState({
        name: "",
        description: "",
        imageUrl: ""
    });

    useEffect(() => {
        if (schools.length > 0) {
            const mySchool = schools[0]; // Assuming one school per admin for now
            setSchoolInfo({
                name: mySchool.name,
                description: mySchool.description || "",
                imageUrl: mySchool.imageUrl || ""
            });
        }
    }, [schools]);

    const handleSaveSchoolInfo = async () => {
        setSaving(true);
        try {
            await partnerService.updateSchool(schoolInfo);
            toast.success("Informations de l'auto-école mises à jour");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    if (schoolsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-signal animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-snow mb-2 flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-signal" />
                    Mon Auto-école
                </h1>
                <p className="text-mist">Gérez l'identité visuelle et les informations de votre établissement.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Image Section - Most Proactive/Visible */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-asphalt/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-snow flex items-center gap-2">
                                <Camera className="h-5 w-5 text-signal" />
                                Image de présentation
                            </h2>
                            <span className="text-xs font-bold text-mist uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                Public
                            </span>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-white/10 group-hover:border-signal/30 transition-all duration-500 bg-black/20">
                            {schoolInfo.imageUrl ? (
                                <img
                                    src={schoolInfo.imageUrl}
                                    alt="Aperçu"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-mist p-6 text-center">
                                    <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                                    <p className="font-medium">Aucune image configurée</p>
                                    <p className="text-sm opacity-60">Cette image sera affichée sur votre page publique et vos offres.</p>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                                <label className="cursor-pointer px-6 py-3 bg-signal text-asphalt rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,193,7,0.4)]">
                                    <Upload className="h-4 w-4" />
                                    {schoolInfo.imageUrl ? "Changer l'image" : "Ajouter une image"}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Simplified: In a real app we'd upload to S3/R2 here
                                                setSchoolInfo(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
                                                toast.info("Aperçu mis à jour (sauvegardez pour confirmer)");
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="h-10 w-10 rounded-full bg-signal/10 flex items-center justify-center shrink-0 border border-signal/20">
                                <Shield className="h-5 w-5 text-signal" />
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-snow">Conseil Premium</p>
                                <p className="text-mist/70">Utilisez une photo de haute qualité de votre établissement ou de votre véhicule principal pour renforcer la confiance des élèves.</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-asphalt/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
                        <h2 className="text-xl font-bold text-snow mb-6 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-signal" />
                            Informations Générales
                        </h2>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-mist ml-1">Nom de l'établissement</label>
                                <input
                                    type="text"
                                    value={schoolInfo.name}
                                    onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-signal/50 focus:bg-white/10 outline-none transition-all text-snow"
                                    placeholder="Ex: Auto-école du Centre"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-mist ml-1">Description</label>
                                <textarea
                                    value={schoolInfo.description}
                                    onChange={(e) => setSchoolInfo({ ...schoolInfo, description: e.target.value })}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-signal/50 focus:bg-white/10 outline-none transition-all text-snow h-32 resize-none"
                                    placeholder="Décrivez votre auto-école, votre pédagogie, vos véhicules..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-signal to-amber-500 rounded-3xl p-8 text-asphalt shadow-[0_20px_40px_rgba(255,193,7,0.2)] flex flex-col justify-between min-h-[240px]">
                        <div>
                            <h3 className="text-2xl font-black mb-2 leading-tight">Prêt à briller ?</h3>
                            <p className="font-medium opacity-80">Mettez à jour votre profil pour attirer plus d'élèves dès aujourd'hui.</p>
                        </div>
                        <button
                            onClick={handleSaveSchoolInfo}
                            disabled={saving}
                            className="w-full py-4 bg-asphalt text-signal rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-6 w-6" />
                                    Sauvegarder
                                </>
                            )}
                        </button>
                    </div>

                    {/* Stats Card (Placeholder logic) */}
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
                        <h4 className="text-sm font-bold text-mist uppercase tracking-widest mb-4">Visibilité</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-mist/70">Profil complété</span>
                                <span className="text-snow font-bold">85%</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-signal w-[85%] rounded-full shadow-[0_0_10px_rgba(255,193,7,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
