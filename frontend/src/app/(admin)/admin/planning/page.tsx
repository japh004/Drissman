"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks";
import { Plus, Search, Calendar, Clock, Users, MapPin, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type SlotStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface SessionSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    monitorName: string;
    moduleName: string;
    moduleCategory: "CODE" | "CONDUITE" | "EXAMEN_BLANC";
    maxStudents: number;
    enrolledCount: number;
    location: string;
    status: SlotStatus;
    notes: string;
}

const statusConfig: Record<SlotStatus, { label: string; class: string }> = {
    SCHEDULED: { label: "Programmée", class: "bg-blue-500/10 text-blue-400" },
    CONFIRMED: { label: "Confirmée", class: "bg-green-500/10 text-green-400" },
    IN_PROGRESS: { label: "En cours", class: "bg-signal/10 text-signal" },
    COMPLETED: { label: "Terminée", class: "bg-mist/10 text-mist/60" },
    CANCELLED: { label: "Annulée", class: "bg-red-500/10 text-red-400" },
};

const catIcons: Record<string, string> = { CODE: "📖", CONDUITE: "🚗", EXAMEN_BLANC: "📝" };

function getWeekDates(offset: number) {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
}

function formatDate(d: Date) { return d.toISOString().split("T")[0]; }
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const emptyForm: {
    date: string; startTime: string; endTime: string;
    monitorName: string; moduleName: string; moduleCategory: "CODE" | "CONDUITE" | "EXAMEN_BLANC";
    maxStudents: number; location: string; notes: string;
} = {
    date: "", startTime: "09:00", endTime: "10:00",
    monitorName: "", moduleName: "", moduleCategory: "CODE",
    maxStudents: 1, location: "", notes: "",
};

export default function PlanningPage() {
    const [slots, setSlots] = useLocalStorage<SessionSlot[]>("planning_slots", []);
    const [weekOffset, setWeekOffset] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const weekDates = getWeekDates(weekOffset);
    const today = formatDate(new Date());

    const handleCreate = () => {
        if (!form.date) { toast.error("Sélectionnez un jour"); return; }
        if (!form.monitorName.trim()) { toast.error("Le moniteur est obligatoire"); return; }
        if (!form.moduleName.trim()) { toast.error("Le module est obligatoire"); return; }
        if (form.startTime >= form.endTime) { toast.error("L'heure de fin doit être après l'heure de début"); return; }

        // Conflict check
        const conflict = slots.find(s =>
            s.date === form.date &&
            s.monitorName === form.monitorName.trim() &&
            s.status !== "CANCELLED" &&
            ((form.startTime >= s.startTime && form.startTime < s.endTime) ||
                (form.endTime > s.startTime && form.endTime <= s.endTime))
        );
        if (conflict) { toast.error(`Conflit : ${form.monitorName} a déjà une séance de ${conflict.startTime} à ${conflict.endTime}`); return; }

        const newSlot: SessionSlot = {
            id: crypto.randomUUID(),
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            monitorName: form.monitorName.trim(),
            moduleName: form.moduleName.trim(),
            moduleCategory: form.moduleCategory,
            maxStudents: form.maxStudents,
            enrolledCount: 0,
            location: form.location.trim(),
            status: "SCHEDULED",
            notes: "",
        };
        setSlots(prev => [...prev, newSlot]);
        setShowModal(false);
        setForm(emptyForm);
        toast.success("Séance programmée");
    };

    const handleCancel = (id: string) => {
        setSlots(prev => prev.map(s => s.id === id ? { ...s, status: "CANCELLED" as SlotStatus } : s));
        toast.success("Séance annulée");
    };

    const openCreateForDay = (date: string) => {
        setForm({ ...emptyForm, date });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Planning</h1>
                    <p className="text-sm text-mist mt-0.5">Planifiez les séances : moniteur, module, élèves, créneau horaire</p>
                </div>
                <button onClick={() => { setForm(emptyForm); setShowModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                    <Plus className="h-4 w-4" /> Nouvelle séance
                </button>
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
                <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl hover:bg-white/5 text-mist hover:text-snow transition-all">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-black text-snow">
                        {weekDates[0].getDate()} - {weekDates[6].getDate()} {monthNames[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}
                    </p>
                    {weekOffset !== 0 && (
                        <button onClick={() => setWeekOffset(0)} className="text-[10px] text-signal font-bold hover:text-signal/80 transition-colors">
                            Aujourd&apos;hui
                        </button>
                    )}
                </div>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-xl hover:bg-white/5 text-mist hover:text-snow transition-all">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((day, i) => {
                    const dateStr = formatDate(day);
                    const isToday = dateStr === today;
                    const daySlots = slots.filter(s => s.date === dateStr && s.status !== "CANCELLED");

                    return (
                        <div key={dateStr}
                            className={`rounded-2xl border p-3 min-h-[160px] transition-all cursor-pointer hover:border-white/10 ${isToday ? "bg-signal/[0.03] border-signal/20" : "bg-white/[0.02] border-white/[0.06]"
                                } ${selectedDay === dateStr ? "ring-2 ring-signal/30" : ""}`}
                            onClick={() => setSelectedDay(selectedDay === dateStr ? null : dateStr)}>

                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-signal" : "text-mist/40"}`}>
                                    {dayNames[i]}
                                </span>
                                <span className={`text-sm font-black ${isToday ? "text-signal bg-signal/10 px-2 py-0.5 rounded-lg" : "text-snow/60"}`}>
                                    {day.getDate()}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {daySlots.length === 0 ? (
                                    <button onClick={(e) => { e.stopPropagation(); openCreateForDay(dateStr); }}
                                        className="w-full py-2 rounded-lg border border-dashed border-white/[0.06] text-mist/20 hover:text-signal hover:border-signal/20 transition-all text-[10px]">
                                        + Ajouter
                                    </button>
                                ) : (
                                    daySlots.map(slot => {
                                        const st = statusConfig[slot.status];
                                        return (
                                            <div key={slot.id}
                                                className={`rounded-lg p-2 text-[10px] border-l-2 transition-all hover:opacity-80 ${slot.moduleCategory === "CODE" ? "bg-blue-500/5 border-l-blue-400" :
                                                    slot.moduleCategory === "CONDUITE" ? "bg-signal/5 border-l-signal" :
                                                        "bg-purple-500/5 border-l-purple-400"
                                                    }`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-snow">{slot.startTime}-{slot.endTime}</span>
                                                    <span>{catIcons[slot.moduleCategory]}</span>
                                                </div>
                                                <p className="text-mist/60 truncate">{slot.moduleName}</p>
                                                <p className="text-mist/40 truncate">{slot.monitorName}</p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Day detail panel */}
            {selectedDay && (
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-black text-snow">
                            {new Date(selectedDay + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </h2>
                        <button onClick={() => openCreateForDay(selectedDay)}
                            className="flex items-center gap-1 text-xs text-signal font-bold hover:text-signal/80 transition-colors">
                            <Plus className="h-3 w-3" /> Ajouter une séance
                        </button>
                    </div>

                    {slots.filter(s => s.date === selectedDay).length === 0 ? (
                        <p className="text-sm text-mist/40 text-center py-6">Aucune séance ce jour</p>
                    ) : (
                        <div className="space-y-3">
                            {slots.filter(s => s.date === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => {
                                const st = statusConfig[slot.status];
                                return (
                                    <div key={slot.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                        <div className="text-center shrink-0">
                                            <p className="text-sm font-black text-snow">{slot.startTime}</p>
                                            <p className="text-[10px] text-mist/40">{slot.endTime}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span>{catIcons[slot.moduleCategory]}</span>
                                                <h3 className="text-sm font-bold text-snow truncate">{slot.moduleName}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.class}`}>{st.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-mist/50">
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{slot.monitorName}</span>
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{slot.enrolledCount}/{slot.maxStudents}</span>
                                                {slot.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{slot.location}</span>}
                                            </div>
                                        </div>
                                        {slot.status === "SCHEDULED" && (
                                            <button onClick={() => handleCancel(slot.id)}
                                                className="text-[10px] text-red-400/60 hover:text-red-400 font-bold transition-colors shrink-0">
                                                Annuler
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-asphalt border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5"
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-snow">Programmer une séance</h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Date *</label>
                                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Heure début *</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Heure fin *</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Module enseigné *</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={form.moduleName} onChange={e => setForm(p => ({ ...p, moduleName: e.target.value }))}
                                        placeholder="Ex : Code de la route"
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                    <select value={form.moduleCategory} onChange={e => setForm(p => ({ ...p, moduleCategory: e.target.value as "CODE" | "CONDUITE" | "EXAMEN_BLANC" }))}
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm">
                                        <option value="CODE" className="bg-asphalt">📖 Code</option>
                                        <option value="CONDUITE" className="bg-asphalt">🚗 Conduite</option>
                                        <option value="EXAMEN_BLANC" className="bg-asphalt">📝 Examen Blanc</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-mist uppercase tracking-wider">Moniteur *</label>
                                <input type="text" value={form.monitorName} onChange={e => setForm(p => ({ ...p, monitorName: e.target.value }))}
                                    placeholder="Nom du moniteur"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Capacité max</label>
                                    <input type="number" value={form.maxStudents} onChange={e => setForm(p => ({ ...p, maxStudents: parseInt(e.target.value) || 1 }))}
                                        min={1} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                    <p className="text-[10px] text-mist/30">1 pour conduite, N pour code en salle</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-mist uppercase tracking-wider">Lieu</label>
                                    <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                        placeholder="Salle A, Véhicule #1..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-snow placeholder:text-mist/30 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-mist hover:text-snow text-sm font-bold transition-all">Annuler</button>
                            <button onClick={handleCreate}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-signal to-amber-400 text-asphalt text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-signal/20">
                                Programmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
