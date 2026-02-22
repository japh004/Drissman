"use client";

import { useOffers, useAuth } from "@/hooks";
import { Plus, Loader2, BookOpen, Layers, Car, MoreVertical, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminOffersPage() {
    const { user } = useAuth();
    const { offers, loading, error, deleteOffer } = useOffers(user?.schoolId);

    // Stats
    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.price > 0).length; // Just a placeholder logic for active
    const totalBPermits = offers.filter(o => o.permitType === 'B').length;

    const statCards = [
        { label: "Total Formules", value: totalOffers, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Formules Actives", value: activeOffers, icon: Layers, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Permis B", value: totalBPermits, icon: Car, color: "text-purple-400", bg: "bg-purple-400/10" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Offres & Formations</h1>
                    <p className="text-white/60">
                        Gérez les formules d'apprentissage proposées par votre auto-école.
                    </p>
                </div>

                <Link
                    href="/admin/offers/new"
                    className="flex items-center gap-2 bg-signal text-asphalt px-5 py-2.5 rounded-xl font-bold hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Créer une Offre
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-1 md:col-span-3 flex justify-center py-6">
                        <Loader2 className="h-6 w-6 text-signal animate-spin" />
                    </div>
                ) : (
                    statCards.map((stat, i) => (
                        <div key={i} className="bg-asphalt-light border border-white/5 rounded-2xl p-6 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm font-medium mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Offers Grid */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6">Toutes les Offres</h2>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 text-signal animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-center">
                        <p>{error}</p>
                    </div>
                ) : offers.length === 0 ? (
                    <div className="bg-asphalt-light border border-white/5 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="p-4 bg-white/5 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-white/40" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Aucune offre trouvée</h3>
                        <p className="text-white/60 mb-6 max-w-md mx-auto">
                            Vous n'avez pas encore créé de formule d'apprentissage. Créez votre première offre pour permettre à vos candidats de s'inscrire.
                        </p>
                        <Link
                            href="/admin/offers/new"
                            className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Créer une Offre
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <div key={offer.id} className="bg-asphalt-light border border-white/5 rounded-2xl overflow-hidden hover:border-signal/30 transition-all duration-300 group flex flex-col">
                                <div className="relative h-48 overflow-hidden bg-asphalt">
                                    {offer.imageUrl ? (
                                        <img
                                            src={offer.imageUrl}
                                            alt={offer.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                            <BookOpen className="h-12 w-12 text-white/20" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent" />

                                    <div className="absolute top-4 right-4 bg-asphalt/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                            Permis {offer.permitType || 'B'}
                                        </span>
                                    </div>

                                    {/* Action Menu (simplifié pour démo) */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <button
                                            className="p-2 bg-asphalt/80 backdrop-blur-md rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors border border-white/10"
                                            title="Modifier"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="p-2 bg-rose-500/80 backdrop-blur-md rounded-lg text-white/90 hover:bg-rose-500 transition-colors border border-rose-500/20"
                                            title="Supprimer"
                                            onClick={() => {
                                                if (window.confirm("Voulez-vous vraiment supprimer cette offre ?")) {
                                                    deleteOffer(offer.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="absolute bottom-4 left-6 right-6">
                                        <h3 className="font-bold text-xl text-white mb-1 line-clamp-1">{offer.name}</h3>
                                        <p className="text-signal font-bold">{offer.price.toLocaleString('fr-FR')} FCFA</p>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-white/60 text-sm line-clamp-3 mb-4 flex-1">
                                        {offer.description || "Aucune description fournie pour cette offre d'apprentissage."}
                                    </p>
                                    <div className="flex items-center gap-2 pt-4 border-t border-white/5 text-white/40 text-sm">
                                        <Car className="h-4 w-4" />
                                        <span>{offer.hours}h de formation</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
