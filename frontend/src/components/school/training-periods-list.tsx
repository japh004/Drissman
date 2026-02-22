"use client";

import { Calendar, Clock, Users, GraduationCap } from "lucide-react";
import type { TrainingPeriod } from "@/lib/api/training-periods";

interface TrainingPeriodsListProps {
    periods: TrainingPeriod[];
    schoolImageUrl?: string;
    onSelectPeriod?: (period: TrainingPeriod) => void;
}

export function TrainingPeriodsList({ periods, onSelectPeriod }: TrainingPeriodsListProps) {
    if (!periods || periods.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-signal/10 text-signal border border-signal/20">
                    <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-snow">Prochaines Sessions</h2>
                    <p className="text-sm text-mist">Inscrivez-vous à une cohorte de formation</p>
                </div>
            </div>
            <div className="grid gap-4">
                {periods.map((period) => {
                    const spotsUsed = period.enrolledCount || 0;
                    const maxSpots = period.maxStudents || 30;
                    const remaining = period.remainingSpots ?? Math.max(0, maxSpots - spotsUsed);
                    const spotsPercent = Math.min((spotsUsed / maxSpots) * 100, 100);
                    const isFull = remaining <= 0;
                    const deadlinePassed = period.enrollmentDeadline
                        ? new Date(period.enrollmentDeadline) < new Date()
                        : false;
                    const canEnroll = !isFull && !deadlinePassed;

                    return (
                        <div
                            key={period.id}
                            className={`bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 group ${canEnroll
                                    ? "border-white/10 hover:border-signal/30"
                                    : "border-white/5 opacity-70"
                                }`}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-snow group-hover:text-signal transition-colors">{period.name}</h3>
                                        {period.offerName && (
                                            <span className="text-xs text-signal/80 font-bold uppercase tracking-wider">{period.offerName}</span>
                                        )}
                                    </div>
                                    {period.offerPrice != null && (
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-signal">{period.offerPrice.toLocaleString()}</span>
                                            <span className="text-sm text-mist ml-1">FCFA</span>
                                        </div>
                                    )}
                                </div>

                                {period.description && (
                                    <p className="text-sm text-mist mb-4 line-clamp-2">{period.description}</p>
                                )}

                                {/* Info Row */}
                                <div className="flex flex-wrap gap-4 mb-4 text-sm text-mist">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-signal/60" />
                                        <span className="font-medium">
                                            {new Date(period.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                            {" → "}
                                            {new Date(period.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                    {period.enrollmentDeadline && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className={`h-4 w-4 ${deadlinePassed ? "text-red-400" : "text-orange-400/60"}`} />
                                            <span className={`font-medium ${deadlinePassed ? "text-red-400 line-through" : ""}`}>
                                                Limite: {new Date(period.enrollmentDeadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Capacity & CTA */}
                                <div className="flex items-center gap-4">
                                    {/* Capacity Bar */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                            <span className="text-mist flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {spotsUsed}/{maxSpots}
                                            </span>
                                            <span className={
                                                isFull ? "text-red-400" :
                                                    spotsPercent >= 80 ? "text-orange-400" :
                                                        "text-emerald-400"
                                            }>
                                                {isFull ? "Complet" : `${remaining} place${remaining > 1 ? "s" : ""}`}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${isFull ? "bg-red-400" :
                                                        spotsPercent >= 80 ? "bg-orange-400" :
                                                            "bg-emerald-400"
                                                    }`}
                                                style={{ width: `${spotsPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => canEnroll && onSelectPeriod?.(period)}
                                        disabled={!canEnroll}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${canEnroll
                                                ? "bg-signal/10 border border-signal/30 text-signal hover:bg-signal hover:text-asphalt hover:scale-[1.02] active:scale-[0.98]"
                                                : "bg-white/5 border border-white/5 text-mist/50 cursor-not-allowed"
                                            }`}
                                    >
                                        {isFull ? "Complet" : deadlinePassed ? "Fermé" : "S'inscrire"}
                                    </button>
                                </div>

                                {/* Schedule hint */}
                                {period.scheduleDescription && (
                                    <div className="mt-3 pt-3 border-t border-white/5 text-xs text-mist/60 italic">
                                        📅 {period.scheduleDescription}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
