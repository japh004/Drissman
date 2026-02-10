"use client";

import { useState } from "react";
import { Gift, Star, TrendingUp, Trophy, Calendar, Users, BookOpen, ArrowRight } from "lucide-react";
import { toast } from "sonner";

/* ─── Mock Data ─── */
const pointsBalance = 1250;

const howToEarn = [
    { icon: Calendar, label: "Compléter une leçon", points: "+50 pts", color: "text-blue-400" },
    { icon: BookOpen, label: "Réussir un examen blanc", points: "+100 pts", color: "text-green-400" },
    { icon: Users, label: "Parrainer un ami", points: "+200 pts", color: "text-purple-400" },
    { icon: Star, label: "Laisser un avis", points: "+25 pts", color: "text-signal" },
];

const pointsHistory = [
    { id: 1, date: "2026-02-08", description: "Leçon de conduite complétée", points: 50, type: "earned" },
    { id: 2, date: "2026-02-06", description: "Examen blanc réussi (Score: 38/40)", points: 100, type: "earned" },
    { id: 3, date: "2026-02-04", description: "Parrainage - Marie D.", points: 200, type: "earned" },
    { id: 4, date: "2026-02-01", description: "Réduction utilisée (-500 pts)", points: -500, type: "spent" },
    { id: 5, date: "2026-01-28", description: "Avis laissé - Auto-École Prestige", points: 25, type: "earned" },
    { id: 6, date: "2026-01-25", description: "Leçon de conduite complétée", points: 50, type: "earned" },
    { id: 7, date: "2026-01-22", description: "Leçon de conduite complétée", points: 50, type: "earned" },
    { id: 8, date: "2026-01-18", description: "Inscription sur la plateforme", points: 100, type: "earned" },
];

const rewards = [
    { name: "Réduction de 10% sur votre prochaine leçon", cost: 500, icon: "🎫" },
    { name: "Leçon gratuite de 30 min", cost: 1500, icon: "🚗" },
    { name: "Accès premium aux examens blancs (1 mois)", cost: 800, icon: "📚" },
];

export default function RewardsPage() {
    const [activeTab, setActiveTab] = useState<"history" | "rewards">("history");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-signal/10 text-signal">
                    <Gift className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-snow">Récompenses</h2>
                    <p className="text-mist">Gagnez des points et échangez-les contre des avantages.</p>
                </div>
            </div>

            {/* Points Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-signal/20 via-signal/10 to-transparent backdrop-blur-sm rounded-2xl border border-signal/20 p-8">
                <div className="absolute top-4 right-4 opacity-10">
                    <Trophy className="h-32 w-32 text-signal" />
                </div>
                <div className="relative">
                    <p className="text-sm text-signal font-bold uppercase tracking-wider mb-1">Solde de Points</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-snow">{pointsBalance.toLocaleString("fr-FR")}</span>
                        <span className="text-lg text-mist font-medium">points</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">+175 pts ce mois</span>
                    </div>
                </div>
            </div>

            {/* How to Earn */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {howToEarn.map((item) => (
                    <div key={item.label} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center hover:border-signal/20 transition-colors">
                        <div className={`mx-auto h-10 w-10 rounded-full bg-white/5 flex items-center justify-center ${item.color} mb-2`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-mist mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-signal">{item.points}</p>
                    </div>
                ))}
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "history" ? "bg-signal text-asphalt" : "text-mist hover:text-snow"}`}
                >
                    Historique
                </button>
                <button
                    onClick={() => setActiveTab("rewards")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "rewards" ? "bg-signal text-asphalt" : "text-mist hover:text-snow"}`}
                >
                    Échanger des points
                </button>
            </div>

            {/* History Tab */}
            {activeTab === "history" && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-mist uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-mist uppercase tracking-wider">Description</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-mist uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsHistory.map((entry) => (
                                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm text-mist whitespace-nowrap">
                                            {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-snow">{entry.description}</td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${entry.type === "earned" ? "text-green-400" : "text-red-400"}`}>
                                            {entry.type === "earned" ? "+" : ""}{entry.points} pts
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Rewards Tab */}
            {activeTab === "rewards" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rewards.map((reward) => (
                        <div key={reward.name} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col justify-between hover:border-signal/20 transition-colors">
                            <div>
                                <span className="text-3xl mb-3 block">{reward.icon}</span>
                                <h4 className="font-bold text-snow mb-2">{reward.name}</h4>
                                <p className="text-signal font-bold">{reward.cost} points</p>
                            </div>
                            <button
                                onClick={() => toast.success(`Traitement de la récompense: ${reward.name}...`)}
                                disabled={pointsBalance < reward.cost}
                                className="mt-4 w-full px-4 py-2.5 rounded-xl bg-signal hover:bg-signal-dark text-asphalt font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                Échanger <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
