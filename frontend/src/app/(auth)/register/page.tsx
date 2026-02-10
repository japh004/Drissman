"use client";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SocialAuth } from "@/components/auth/social-auth";
import Link from "next/link";
import { useState, Suspense } from "react";
import { User, Building2, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks";

function RegisterForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { register } = useAuth();
    const defaultPlan = searchParams.get("plan");

    const [role, setRole] = useState<'student' | 'partner'>(defaultPlan ? 'partner' : 'student');
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const backendRole = role === 'partner' ? 'SCHOOL_ADMIN' : 'STUDENT';
            await register(email, password, firstName, lastName, backendRole, schoolName);
            toast.success("Compte créé avec succès !");
            router.push("/dashboard");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Échec de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow placeholder:text-mist/50 focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all";

    return (
        <AuthSplitLayout
            mode="register"
            title={role === 'student' ? "Créez votre compte" : "Rejoignez le réseau"}
            description={role === 'student'
                ? "Débutez votre formation dès aujourd'hui."
                : "Digitalisez votre auto-école."
            }
        >
            <form onSubmit={handleRegister} className="space-y-6">

                {/* Role Selector */}
                <div className="grid grid-cols-2 gap-4 p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'student'
                            ? "bg-signal text-asphalt shadow-md"
                            : "text-mist hover:text-snow"
                            }`}
                    >
                        <User className="h-4 w-4" />
                        Candidat
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('partner')}
                        className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'partner'
                            ? "bg-signal text-asphalt shadow-md"
                            : "text-mist hover:text-snow"
                            }`}
                    >
                        <Building2 className="h-4 w-4" />
                        Auto-École
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-snow">Prénom</label>
                        <input
                            id="name"
                            placeholder="John"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lastname" className="text-sm font-medium text-snow">Nom</label>
                        <input
                            id="lastname"
                            placeholder="Doe"
                            required
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
                        placeholder="john@exemple.com"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-snow">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {role === 'partner' && (
                    <div className="space-y-2">
                        <label htmlFor="school" className="text-sm font-medium text-snow">Nom de l&apos;auto-école</label>
                        <input
                            id="school"
                            placeholder="Auto-École..."
                            required
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-signal hover:bg-signal-dark text-asphalt font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Création..." : (role === 'student' ? "Commencer gratuitement" : "Créer mon compte partenaire")}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-asphalt px-2 text-mist">Ou continuer avec</span>
                    </div>
                </div>

                <SocialAuth />

                <div className="text-center text-sm text-mist">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="font-bold text-signal hover:underline">
                        Se connecter
                    </Link>
                </div>

                <p className="text-xs text-center text-mist/60 mt-4">
                    En vous inscrivant, vous acceptez nos <Link href="/contact" className="underline text-mist hover:text-signal">Conditions d&apos;utilisation</Link> et notre <Link href="/contact" className="underline text-mist hover:text-signal">Politique de confidentialité</Link>.
                </p>
            </form>
        </AuthSplitLayout>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <AuthSplitLayout mode="register" title="Chargement..." description="Veuillez patienter">
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-signal"></div>
                </div>
            </AuthSplitLayout>
        }>
            <RegisterForm />
        </Suspense>
    );
}
