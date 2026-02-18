"use client";

import { useStudentPortal } from "@/hooks";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    MapPin,
    ArrowLeft,
    ChevronRight,
    Search,
    BookOpen
} from "lucide-react";
import Link from "next/link";

export default function SchedulePage() {
    const { data, loading } = useStudentPortal();

    if (loading) return null;

    const schedule = data?.upcomingSchedule || [];

    // Group lessons by date
    const groupedSchedule = schedule.reduce((acc, lesson) => {
        const date = lesson.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(lesson);
        return acc;
    }, {} as Record<string, typeof schedule>);

    const sortedDates = Object.keys(groupedSchedule).sort();

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-mist uppercase tracking-widest hover:text-signal transition-colors mb-4">
                        <ArrowLeft className="h-3 w-3" />
                        Tableau de bord
                    </Link>
                    <h1 className="text-4xl font-black text-snow tracking-tight uppercase">Emploi du <span className="text-blue-400">Temps</span></h1>
                    <p className="text-mist font-medium">Retrouvez tous les cours prévus pour votre session actuelle.</p>
                </div>

                {data?.session && (
                    <div className="px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1 text-right">Session active</div>
                        <div className="text-sm font-black text-snow">{data.session.name}</div>
                    </div>
                )}
            </div>

            {/* Schedule List */}
            <div className="space-y-12 px-4">
                {sortedDates.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <CalendarIcon className="h-16 w-16 text-mist/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-snow mb-2">Aucun cours planifié</h3>
                        <p className="text-mist text-sm max-w-xs mx-auto">Votre emploi du temps sera disponible dès que votre auto-école aura planifié les prochaines séances.</p>
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date} className="relative">
                            {/* Date Sticky Header */}
                            <div className="sticky top-0 z-20 bg-asphalt/80 backdrop-blur-md py-4 mb-6 flex items-center gap-4 border-b border-white/5">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex flex-col items-center justify-center border border-blue-500/30">
                                    <span className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1">
                                        {new Date(date).toLocaleDateString("fr-FR", { weekday: "short" })}
                                    </span>
                                    <span className="text-lg font-black text-snow leading-none">
                                        {new Date(date).getDate()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-snow capitalize">
                                        {new Date(date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                                    </h3>
                                    <p className="text-[10px] text-mist font-bold uppercase tracking-widest">{groupedSchedule[date].length} cours prévu(s)</p>
                                </div>
                            </div>

                            {/* Lessons Card Stack */}
                            <div className="grid gap-4">
                                {groupedSchedule[date].map((lesson) => (
                                    <div key={lesson.id} className="group relative overflow-hidden bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-300">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/30">
                                                Confirmé
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                            {/* Time Range */}
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center gap-2 text-xl font-black text-snow tracking-tighter">
                                                    <Clock className="h-4 w-4 text-blue-400" />
                                                    {lesson.startTime.slice(0, 5)} - {lesson.endTime.slice(0, 5)}
                                                </div>
                                                <p className="text-[9px] text-mist font-black uppercase tracking-widest mt-1">Heure locale</p>
                                            </div>

                                            <div className="h-10 w-px bg-white/10 hidden md:block" />

                                            {/* Lesson Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="h-3 w-3 text-mist" />
                                                    <span className="text-[10px] font-black text-mist uppercase tracking-widest">{lesson.moduleName || 'Cours théorique'}</span>
                                                </div>
                                                <h4 className="text-2xl font-black text-snow tracking-tight group-hover:text-blue-400 transition-colors uppercase truncate">
                                                    {lesson.topic}
                                                </h4>

                                                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5 items-center">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-mist/60 group-hover:text-mist transition-colors">
                                                        <User className="h-3.5 w-3.5 text-blue-400/50" />
                                                        <span>{lesson.monitorName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-mist/60 group-hover:text-mist transition-colors">
                                                        <MapPin className="h-3.5 w-3.5 text-blue-400/50" />
                                                        <span>Salle Académique</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="hidden md:flex flex-shrink-0 h-12 w-12 rounded-full bg-white/5 items-center justify-center group-hover:bg-blue-500 group-hover:text-asphalt transition-all">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Info */}
            <div className="px-4">
                <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center gap-8">
                    <div className="h-16 w-16 rounded-[2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
                        <Search className="h-8 w-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-snow mb-1 tracking-tight">Conseil de Formation</h4>
                        <p className="text-mist text-sm font-medium leading-relaxed">Pensez à arriver 10 minutes avant le début de chaque séance pour préparer votre matériel et valider votre présence.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
