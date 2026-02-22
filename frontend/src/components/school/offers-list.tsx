import { Offer } from "@/lib/api";
import { Check, Clock, Car, BookOpen, Users } from "lucide-react";

interface OffersListProps {
    offers?: Offer[];
    schoolImageUrl?: string;
    onSelectOffer?: (offer: Offer) => void;
}

// Images thématiques pour les offres (Unsplash)
const offerImages: Record<string, string> = {
    permis: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
    code: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
    conduite: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop",
    accelere: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
    default: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop"
};

function getOfferImage(offer: Offer, schoolImageUrl?: string): string {
    if (schoolImageUrl) return schoolImageUrl;

    const permitType = offer.permitType?.toUpperCase();
    const name = offer.name.toLowerCase();

    if (name.includes("code")) return offerImages.code;

    // Logic based on permit type
    if (permitType === 'C' || permitType === 'D') return "https://images.unsplash.com/photo-1591768793355-74d0cadbc663?q=80&w=800&auto=format&fit=crop"; // Truck/Bus
    if (permitType === 'A' || permitType === 'A1') return "https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=800&auto=format&fit=crop"; // Moto

    if (name.includes("accéléré") || name.includes("accelere") || name.includes("intensif")) return offerImages.accelere;
    if (name.includes("conduite") || name.includes("accompagnée")) return offerImages.conduite;
    return offerImages.permis;
}

function getOfferIcon(offer: Offer) {
    const permitType = offer.permitType?.toUpperCase();
    const name = offer.name.toLowerCase();

    if (name.includes("code")) return <BookOpen className="h-5 w-5" />;

    if (permitType === 'A' || permitType === 'A1') {
        return <div className="font-bold text-xs">MOTO</div>;
    }

    if (permitType === 'C' || permitType === 'D') {
        return <div className="font-bold text-xs">PRO</div>;
    }

    if (name.includes("accompagnée") || name.includes("duo")) return <Users className="h-5 w-5" />;
    return <Car className="h-5 w-5" />;
}

export function OffersList({ offers, schoolImageUrl, onSelectOffer }: OffersListProps) {
    if (!offers || offers.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-snow mb-6">Nos Formules</h2>
            <div className="grid gap-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-signal/30 transition-all duration-300 group">
                        {/* Image Header */}
                        <div className="relative h-40 overflow-hidden">
                            <img
                                src={getOfferImage(offer, schoolImageUrl)}
                                alt={offer.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/50 to-transparent" />

                            {/* Badge icon */}
                            <div className="absolute top-4 left-4 bg-signal/90 text-asphalt p-2 rounded-xl">
                                {getOfferIcon(offer)}
                            </div>

                            {/* Permit Type Badge */}
                            {offer.permitType && (
                                <div className="absolute top-4 right-4 bg-snow/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                                    <span className="text-[10px] font-black text-snow uppercase tracking-widest">Permis {offer.permitType}</span>
                                </div>
                            )}

                            {/* Price badge */}
                            <div className="absolute bottom-4 right-4 bg-asphalt/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-signal/30">
                                <span className="text-xl font-bold text-signal">{offer.price.toLocaleString()}</span>
                                <span className="text-sm text-mist ml-1">FCFA</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-xl text-snow">{offer.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4 text-signal" />
                                        <span className="text-sm text-mist">
                                            {offer.hours} heures de conduite
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {offer.description && (
                                <p className="text-mist text-sm mb-4 line-clamp-2">{offer.description}</p>
                            )}

                            {/* Features (if provided by API in future) */}
                            {(offer as any).features?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                    {(offer as any).features?.map((feat: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-mist">
                                            <Check className="h-4 w-4 text-signal" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => onSelectOffer?.(offer)}
                                className="w-full py-3 rounded-xl bg-signal/10 border border-signal/30 text-signal font-bold hover:bg-signal hover:text-asphalt hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                            >
                                Choisir cette formule
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

