"use client";

import { useStudentPortal } from "@/hooks";
import {
    BookOpen,
    CheckCircle2,
    Circle,
    Clock,
    ArrowLeft,
    ScrollText,
    Target
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default function CurriculumPage() {
    const { data, loading } = useStudentPortal();

    if (loading) return null;

    const curriculum = data?.curriculum || [];
    const summary = data?.summary;

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-mist uppercase tracking-widest hover:text-signal transition-colors mb-4">
                        <ArrowLeft className="h-3 w-3" />
                        Tableau de bord
                    </Link>
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Mon Parcours <span className="text-signal">Académique</span></h1>
                    <p className="text-mist font-medium">Suivez votre progression à travers les modules de votre formation.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-black text-signal">{summary?.overallProgress}%</div>
                        <div className="text-[8px] font-black text-mist uppercase tracking-tight">Progression</div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-center">
                        <div className="text-2xl font-black text-snow">{summary?.totalHoursConsumed}H</div>
                        <div className="text-[8px] font-black text-mist uppercase tracking-tight">Validées</div>
                    </div>
                </div>
            </div>

            {/* Curriculum Journey */}
            <div className="relative space-y-4 px-4">
                {/* Vertical Line */}
                <div className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-signal/50 via-white/5 to-transparent hidden md:block" />

                {curriculum.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <ScrollText className="h-12 w-12 text-mist/20 mx-auto mb-4" />
                        <p className="text-mist font-bold italic">Aucun module assigné à votre profil.</p>
                    </div>
                ) : (
                    curriculum.map((module, index) => {
                        const isCompleted = module.consumedHours >= module.totalHours;
                        const inProgress = module.consumedHours > 0 && !isCompleted;

                        return (
                            <div key={module.id} className="relative flex flex-col md:flex-row gap-6 group">
                                {/* Timeline Marker */}
                                <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-2xl bg-asphalt border-4 border-asphalt z-10 items-center justify-center transition-all group-hover:scale-110">
                                    <div className={`h-full w-full rounded-xl flex items-center justify-center border ${isCompleted ? 'bg-signal/20 border-signal/40 text-signal' :
                                            inProgress ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                'bg-white/5 border-white/10 text-mist'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-black text-lg">{index + 1}</span>}
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 bg-white/[0.03] border rounded-[2rem] p-8 transition-all duration-500 group-hover:bg-white/[0.05] ${isCompleted ? 'border-signal/20' : 'border-white/5'
                                    }`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-mist uppercase tracking-widest leading-none">
                                                    {module.category || 'Formation'}
                                                </span>
                                                {isCompleted && (
                                                    <span className="text-[9px] font-black text-signal uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Validé
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-snow tracking-tight">{module.name}</h3>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-xl font-black text-snow">{module.consumedHours}<span className="text-mist text-sm font-bold ml-1">/ {module.totalHours}H</span></div>
                                            <div className="text-[9px] font-black text-mist uppercase tracking-widest mt-1">Quota horaire</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-signal' : 'bg-blue-400'}`}
                                                style={{ width: `${(module.consumedHours / module.totalHours) * 100}%` }}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-mist">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{module.totalHours} heures requises</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-mist">
                                                <Target className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Module {index + 1} du programme</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Support Message */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-signal/10 via-transparent to-transparent border border-signal/10 text-center mx-4">
                <h4 className="text-lg font-black text-snow mb-2 tracking-tight">Une question sur votre programme ?</h4>
                <p className="text-mist text-sm max-w-md mx-auto mb-6 font-medium">Votre auto-école est à votre disposition pour vous aider dans votre apprentissage.</p>
                <button className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-snow font-black uppercase text-[10px] tracking-widest hover:bg-signal hover:text-asphalt transition-all">
                    Contacter mon moniteur
                </button>
            </div>
        </div>
    );
}
