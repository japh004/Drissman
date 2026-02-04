"use client";

import { useState, useMemo } from "react";
import { usePartnerBookings, useAuth } from "@/hooks";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Calendar,
    Clock,
    User
} from "lucide-react";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8h à 17h

export default function PlanningPage() {
    const { user } = useAuth();
    const { bookings, loading, error, refetch } = usePartnerBookings();
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    // Get start and end of current week
    const { weekStart, weekEnd, weekDates } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday

        const start = new Date(today);
        start.setDate(diff + (currentWeekOffset * 7));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });

        return { weekStart: start, weekEnd: end, weekDates: dates };
    }, [currentWeekOffset]);

    // Filter bookings for current week
    const weekBookings = useMemo(() => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
        });
    }, [bookings, weekStart, weekEnd]);

    // Get booking for specific day and hour
    const getBookingAt = (dayIndex: number, hour: number) => {
        const targetDate = weekDates[dayIndex];
        return weekBookings.find(booking => {
            // Check day
            const bookingDate = new Date(booking.date);
            const isSameDay = bookingDate.toDateString() === targetDate.toDateString();
            if (!isSameDay) return false;

            // Check hour
            if (booking.time) {
                // time format is "HH:mm"
                const bookingHour = parseInt(booking.time.split(':')[0]);
                return bookingHour === hour;
            }

            return bookingDate.getHours() === hour;
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const formatWeekRange = () => {
        const startStr = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        const endStr = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        return `${startStr} - ${endStr}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-signal/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-signal border-t-transparent animate-spin"></div>
                </div>
                <p className="text-mist font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Chargement du planning...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/5 rounded-3xl border border-red-500/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-snow mb-2">Erreur de chargement</h3>
                <p className="text-mist mb-6">{error}</p>
                <button
                    onClick={refetch}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-snow font-black text-[10px] uppercase tracking-widest transition-all"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-snow uppercase tracking-tight">Planning</h1>
                    <p className="text-mist font-bold">Votre emploi du temps de la semaine.</p>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2">
                    <button
                        onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-mist" />
                    </button>
                    <div className="flex items-center gap-2 px-4">
                        <Calendar className="h-4 w-4 text-signal" />
                        <span className="text-snow font-bold text-sm">{formatWeekRange()}</span>
                    </div>
                    <button
                        onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-mist" />
                    </button>
                    {currentWeekOffset !== 0 && (
                        <button
                            onClick={() => setCurrentWeekOffset(0)}
                            className="px-3 py-1 bg-signal/10 text-signal text-xs font-bold rounded-lg hover:bg-signal/20 transition-colors"
                        >
                            Aujourd&apos;hui
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                    <span className="text-2xl font-black text-signal">{weekBookings.length}</span>
                    <span className="text-mist ml-2 text-sm">cours cette semaine</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                    <span className="text-2xl font-black text-snow">{weekBookings.filter(b => b.status === 'CONFIRMED').length}</span>
                    <span className="text-mist ml-2 text-sm">confirmés</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="w-20 p-4 text-left text-[10px] font-black text-mist uppercase tracking-widest">Heure</th>
                                {DAYS.map((day, index) => (
                                    <th key={day} className="p-4 text-center">
                                        <span className="text-[10px] font-black text-mist uppercase tracking-widest block">{day}</span>
                                        <span className={`text-lg font-black ${weekDates[index].toDateString() === new Date().toDateString()
                                            ? 'text-signal'
                                            : 'text-snow'
                                            }`}>
                                            {weekDates[index].getDate()}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map((hour) => (
                                <tr key={hour} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-4 text-sm font-bold text-mist">
                                        {hour}:00
                                    </td>
                                    {DAYS.map((_, dayIndex) => {
                                        const booking = getBookingAt(dayIndex, hour);
                                        return (
                                            <td key={dayIndex} className="p-2">
                                                {booking ? (
                                                    <div className={`p-3 rounded-xl ${booking.status === 'CONFIRMED'
                                                        ? 'bg-signal/10 border border-signal/20'
                                                        : booking.status === 'PENDING'
                                                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                                                            : 'bg-white/5 border border-white/10'
                                                        }`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <User className="h-3 w-3 text-signal" />
                                                            <span className="text-[10px] font-black text-snow truncate uppercase tracking-tighter">
                                                                {booking.user?.name || 'Élève'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3 text-mist" />
                                                            <span className="text-[10px] text-mist">
                                                                {booking.offer?.name || 'Cours'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-16 rounded-xl border border-dashed border-white/5 hover:border-white/10 transition-colors"></div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-signal/10 border border-signal/20"></div>
                    <span className="text-mist">Confirmé</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500/10 border border-yellow-500/20"></div>
                    <span className="text-mist">En attente</span>
                </div>
            </div>
        </div>
    );
}
