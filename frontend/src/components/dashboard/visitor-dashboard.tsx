"use client";

import Link from "next/link";
import { Search, School, Star, ArrowRight, Eye, UserPlus, Building2 } from "lucide-react";

interface VisitorDashboardProps {
    user: {
        firstName: string;
        lastName: string;
        role: string;
    };
}

export function VisitorDashboard({ user }: VisitorDashboardProps) {
    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-signal/20 via-signal/5 to-transparent border border-signal/20 p-8">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-signal/5 rounded-full blur-3xl" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center">
                            <Eye className="h-6 w-6 text-signal" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-snow">
                                Bienvenue, {user.firstName} ! 👋
                            </h1>
                            <p className="text-mist text-sm">Espace Visiteur — Explorez Drissman</p>
                        </div>
                    </div>
                    <p className="text-mist max-w-2xl">
                        En tant que visiteur, vous pouvez découvrir nos auto-écoles partenaires,
                        comparer les offres et lire les avis. Inscrivez-vous en tant que
                        candidat ou créez votre propre auto-école !
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/"
                    className="group relative overflow-hidden rounded-xl bg-asphalt border border-white/5 p-6 hover:border-signal/30 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Search className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-snow mb-2">Rechercher</h3>
                        <p className="text-sm text-mist mb-4">
                            Trouvez l&apos;auto-école idéale près de chez vous.
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:gap-2 transition-all">
                            Explorer <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </Link>

                <Link
                    href="/#schools"
                    className="group relative overflow-hidden rounded-xl bg-asphalt border border-white/5 p-6 hover:border-signal/30 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                            <School className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-snow mb-2">Auto-Écoles</h3>
                        <p className="text-sm text-mist mb-4">
                            Consultez la liste de nos partenaires certifiés.
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 group-hover:gap-2 transition-all">
                            Voir tout <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </Link>

                <Link
                    href="/#testimonials"
                    className="group relative overflow-hidden rounded-xl bg-asphalt border border-white/5 p-6 hover:border-signal/30 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                            <Star className="h-6 w-6 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-snow mb-2">Avis & Témoignages</h3>
                        <p className="text-sm text-mist mb-4">
                            Lisez les retours de nos candidats satisfaits.
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 group-hover:gap-2 transition-all">
                            Lire les avis <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </Link>
            </div>

            {/* Dual Conversion CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CTA: Devenir Candidat */}
                <div className="rounded-2xl bg-gradient-to-r from-signal/10 via-signal/5 to-transparent border border-signal/20 p-8">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center flex-shrink-0">
                            <UserPlus className="h-7 w-7 text-signal" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-snow mb-1">
                                Vous êtes candidat ?
                            </h2>
                            <p className="text-mist text-sm mb-6">
                                Achetez un pack de formation pour réserver des leçons de conduite,
                                suivre votre progression et obtenir votre permis.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-signal hover:bg-signal/90 text-asphalt font-bold rounded-xl shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all text-sm whitespace-nowrap"
                            >
                                <UserPlus className="h-4 w-4" />
                                Acheter une formation
                            </Link>
                        </div>
                    </div>
                </div>

                {/* CTA: Créer son Auto-École */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-8">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-7 w-7 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-snow mb-1">
                                Vous êtes une auto-école ?
                            </h2>
                            <p className="text-mist text-sm mb-6">
                                Créez votre auto-école sur Drissman pour digitaliser votre activité,
                                gérer vos offres et votre personnel.
                            </p>
                            <Link
                                href="/register?plan=partner"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-500/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-sm whitespace-nowrap"
                            >
                                <Building2 className="h-4 w-4" />
                                Créer mon auto-école
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
