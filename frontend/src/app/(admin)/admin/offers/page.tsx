"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Plus, Search, BookOpen, MoreVertical,
    Edit2, Trash2, Eye, Filter, Car, Code2, FileCheck
} from "lucide-react";

// Mock data — will connect to API
const mockOffers = [
    {
        id: "1", name: "Permis B Classique", description: "Formation complète pour le permis B.",
        price: 65000, hours: 35, permitType: "B", status: "ACTIVE",
        modulesCount: 3, enrollmentsCount: 18,
        imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "2", name: "Code Illimité", description: "Accès illimité au code en salle et en ligne.",
        price: 15000, hours: 20, permitType: "B", status: "ACTIVE",
        modulesCount: 1, enrollmentsCount: 24,
        imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ed532?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "3", name: "Permis Accéléré", description: "Votre permis en 3 semaines chrono.",
        price: 120000, hours: 40, permitType: "B", status: "ACTIVE",
        modulesCount: 3, enrollmentsCount: 5,
        imageUrl: "https://images.unsplash.com/photo-1621905252472-943af1f0dc0c?q=80&w=400&auto=format&fit=crop",
    },
    {
        id: "4", name: "Permis Moto A", description: "Formation complète permis moto.",
        price: 45000, hours: 20, permitType: "A", status: "DRAFT",
        modulesCount: 2, enrollmentsCount: 0,
        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f015886d3?q=80&w=400&auto=format&fit=crop",
    },
];

function formatPrice(amount: number) {
    return new Intl.NumberFormat("fr-FR").format(amount);
}

export default function OffersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const filteredOffers = mockOffers.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE": return <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Actif</span>;
            case "DRAFT": return <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Brouillon</span>;
            case "ARCHIVED": return <span className="bg-mist/10 text-mist/60 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">Archivé</span>;
            default: return null;
        }
    };

    const permitIcon = (type: string) => {
        switch (type) {
            case "A": return "🏍️";
            case "B": return "🚗";
            case "C": return "🚛";
            default: return "🚗";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-snow">Offres & Formules</h1>
                    <p className="text-sm text-mist mt-0.5">{mockOffers.length} formules au total</p>
                </div>
                <Link
                    href="/admin/offers/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-signal to-amber-400 text-asphalt font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-signal/20"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle offre
                </Link>
            </div>

            {/* Search / Filter bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher une offre..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-snow placeholder:text-mist/40 focus:outline-none focus:border-signal/50 focus:ring-2 focus:ring-signal/20 transition-all text-sm"
                    />
                </div>
                <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-mist hover:text-snow hover:border-white/20 transition-all">
                    <Filter className="h-4 w-4" />
                </button>
            </div>

            {/* Offers Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOffers.map((offer) => (
                    <div
                        key={offer.id}
                        className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden group hover:border-white/10 transition-all"
                    >
                        {/* Image */}
                        <div className="relative h-36 overflow-hidden">
                            <img
                                src={offer.imageUrl}
                                alt={offer.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-asphalt/80 to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-2">
                                {statusBadge(offer.status)}
                                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                    {permitIcon(offer.permitType)} Permis {offer.permitType}
                                </span>
                            </div>
                            {/* Action menu */}
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === offer.id ? null : offer.id)}
                                    className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/70 hover:text-white transition-colors"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                                {activeMenu === offer.id && (
                                    <div className="absolute right-0 mt-1 bg-asphalt/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl py-1 w-36 z-10">
                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist hover:bg-white/5 hover:text-snow transition-colors">
                                            <Eye className="h-3.5 w-3.5" /> Aperçu
                                        </button>
                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mist hover:bg-white/5 hover:text-snow transition-colors">
                                            <Edit2 className="h-3.5 w-3.5" /> Modifier
                                        </button>
                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="text-sm font-bold text-snow mb-1 truncate">{offer.name}</h3>
                            <p className="text-xs text-mist/60 line-clamp-2 mb-3">{offer.description}</p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-lg font-black text-signal">{formatPrice(offer.price)}</span>
                                    <span className="text-[10px] text-mist/40 ml-1">FCFA</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-mist/50">
                                    <span>{offer.hours}h</span>
                                    <span>·</span>
                                    <span>{offer.modulesCount} modules</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-mist/40">{offer.enrollmentsCount} inscrit{offer.enrollmentsCount > 1 ? "s" : ""}</span>
                                <div className="h-1.5 flex-1 mx-3 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-signal/60 rounded-full"
                                        style={{ width: `${Math.min((offer.enrollmentsCount / 30) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
