"use client";

import Link from "next/link";
import { Search, School, ArrowRight, UserPlus, GraduationCap, Star } from "lucide-react";

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
            {/* ═══ Welcome Banner ═══ */}
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-signal/15 via-purple-500/10 to-blue-500/10" />
                <div className="absolute top-6 right-6 w-32 h-32 bg-signal/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-signal/20 border border-signal/30 flex items-center justify-center shadow-lg shadow-signal/10">
                            <Star className="h-6 w-6 text-signal" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-snow tracking-tight">
                        Bienvenue, {user.firstName} !
                    </h2>
                    <p className="text-mist mt-2 max-w-xl font-medium">
                        Explorez les auto-écoles partenaires et trouvez la formation qui vous correspond.
                    </p>
                </div>
            </div>

            {/* ═══ Actions ═══ */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link
                    href="/"
                    className="group relative overflow-hidden rounded-[2rem] p-8 bg-white/[0.07] backdrop-blur-md border border-white/5 hover:border-signal/30 transition-all duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-signal/10 border border-signal/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Search className="h-7 w-7 text-signal" />
                        </div>
                        <h3 className="text-xl font-black text-snow mb-2 group-hover:text-signal transition-colors">Explorer les auto-écoles</h3>
                        <p className="text-mist text-sm font-medium mb-6">
                            Comparez les offres, consultez les avis, et trouvez l&apos;auto-école idéale près de chez vous.
                        </p>
                        <span className="inline-flex items-center gap-2 text-signal text-xs font-black uppercase tracking-widest">
                            Découvrir <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </Link>

                <div className="group relative overflow-hidden rounded-[2rem] p-8 bg-white/[0.07] backdrop-blur-md border border-white/5">
                    <div className="relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                            <GraduationCap className="h-7 w-7 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-black text-snow mb-2">Prêt à commencer ?</h3>
                        <p className="text-mist text-sm font-medium mb-6">
                            Inscrivez-vous à une formation pour accéder à votre espace élève avec planning, cours et suivi de progression.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-mist font-bold">
                            <UserPlus className="h-4 w-4 text-blue-400" />
                            Inscrivez-vous auprès d&apos;une auto-école pour commencer
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ How it works ═══ */}
            <div className="bg-white/[0.04] border border-white/5 rounded-[2rem] p-8">
                <h3 className="text-lg font-black text-snow mb-6">Comment ça marche ?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { step: "1", title: "Explorez", desc: "Parcourez les auto-écoles et comparez les offres de formation.", icon: Search },
                        { step: "2", title: "Inscrivez-vous", desc: "Choisissez une formation et inscrivez-vous en ligne.", icon: School },
                        { step: "3", title: "Progressez", desc: "Suivez vos cours, votre planning et votre progression.", icon: GraduationCap },
                    ].map((item) => (
                        <div key={item.step} className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center">
                                <span className="text-signal font-black text-sm">{item.step}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-snow text-sm">{item.title}</h4>
                                <p className="text-mist text-xs mt-1 font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
