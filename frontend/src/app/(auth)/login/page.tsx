"use client";

import { useState } from "react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SocialAuth } from "@/components/auth/social-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success("Connexion réussie !");
            router.push("/dashboard");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Échec de la connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthSplitLayout
            mode="login"
            title="Bon retour"
            description="La route n'attend que vous."
        >
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-snow">Email</label>
                    <input
                        id="email"
                        placeholder="nom@exemple.com"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow placeholder:text-mist/50 focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium text-snow">Mot de passe</label>
                        <Link href="/contact" className="text-sm font-medium text-signal hover:underline">
                            Mot de passe oublié ?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow placeholder:text-mist/50 focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-signal hover:bg-signal-dark text-asphalt font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Connexion..." : "Se connecter"}
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
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="font-bold text-signal hover:underline">
                        S&apos;inscrire
                    </Link>
                </div>

                {/* Demo credentials hint */}
                <div className="text-center text-xs text-mist/60 mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p>Test: demo@drissman.cm / password123</p>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
