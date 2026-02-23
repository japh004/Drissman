"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { Save, Building2, Phone, Mail, MapPin, Globe, Upload } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const [schoolName, setSchoolName] = useState("Mon Auto-École");
    const [address, setAddress] = useState("123 Rue de l'Indépendance");
    const [city, setCity] = useState("Yaoundé");
    const [region, setRegion] = useState("Centre");
    const [phone, setPhone] = useState("+237 222 123 456");
    const [email, setEmail] = useState("contact@monautoecole.cm");
    const [website, setWebsite] = useState("www.monautoecole.cm");
    const [description, setDescription] = useState("Votre auto-école de confiance depuis 2010.");

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-black text-snow">Paramètres</h1>
                <p className="text-sm text-mist mt-0.5">Gérez les informations de votre auto-école</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* School identity */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-4">
                    <h2 className="text-sm font-bold text-snow flex items-center gap-2"><Building2 className="h-4 w-4 text-signal" /> Identité de l&apos;école</h2>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-mist uppercase tracking-wider">Nom de l&apos;auto-école</label>
                        <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-mist uppercase tracking-wider">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm resize-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-mist uppercase tracking-wider">Logo / Image</label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-signal/30 transition-colors cursor-pointer">
                            <Upload className="h-6 w-6 text-mist/30 mx-auto mb-2" />
                            <p className="text-xs text-mist/40">Cliquez pour télécharger ou glissez une image</p>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-4">
                    <h2 className="text-sm font-bold text-snow flex items-center gap-2"><Phone className="h-4 w-4 text-signal" /> Contact</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Téléphone</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                        <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">E-mail</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Site web</label>
                        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                </div>

                {/* Location */}
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-4">
                    <h2 className="text-sm font-bold text-snow flex items-center gap-2"><MapPin className="h-4 w-4 text-signal" /> Localisation</h2>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Adresse</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Ville</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                        <div className="space-y-1.5"><label className="text-xs font-bold text-mist uppercase tracking-wider">Région</label>
                            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm" /></div>
                    </div>
                </div>

                {/* Save */}
                <button type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-black px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                </button>
            </form>
        </div>
    );
}
