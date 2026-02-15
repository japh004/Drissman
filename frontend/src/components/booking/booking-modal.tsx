"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, Phone, Calendar, Clock } from "lucide-react";
import { School, Offer } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { bookingsService, CreateBookingPayload } from "@/lib/api";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    school: any;
    selectedOffer?: any;
}

type Step = "DETAILS" | "PAYMENT" | "SUCCESS";

export function BookingModal({ isOpen, onClose, school, selectedOffer }: BookingModalProps) {
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState<Step>("DETAILS");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        date: "",
        time: "09:00"
    });
    const [bookingId, setBookingId] = useState<string | null>(null);

    const offerTitle = selectedOffer
        ? (selectedOffer.name || selectedOffer.title)
        : "Formation Permis B (Standard)";

    // Fallback price logic: offer price -> school default price -> 0
    const offerPrice = selectedOffer?.price || school?.price || 0;
    const offerId = selectedOffer?.id;

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleNext = async () => {
        if (!isAuthenticated) {
            toast.error("Veuillez vous connecter pour continuer l'inscription");
            return;
        }

        if (!formData.date) {
            toast.error("Veuillez sélectionner une date");
            return;
        }

        if (!offerId) {
            toast.error("Veuillez sélectionner une formule de formation avant de réserver.");
            return;
        }

        setIsLoading(true);

        try {
            // Create booking via API
            const bookingPayload: CreateBookingPayload = {
                schoolId: school.id,
                offerId: offerId,
                date: formData.date,
                time: formData.time
            };

            const booking = await bookingsService.create(bookingPayload);
            setBookingId(booking.id);
            setStep("PAYMENT");
        } catch (error) {
            toast.error("Échec de la création de l'inscription. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async (method: string) => {
        setIsLoading(true);

        try {
            console.log(`Payment simulation started with method: ${method} for booking: ${bookingId}`);
            // Simulation du délai de traitement du paiement
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Le statut reste PENDING - l'auto-école doit confirmer
            // La facture a été créée côté backend lors de la création du booking

            setStep("SUCCESS");
            toast.success("Paiement enregistré ! En attente de confirmation de l'auto-école.");
        } catch (error) {
            toast.error("Une erreur est survenue lors de l'enregistrement du paiement.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Reset state when closing
        setStep("DETAILS");
        setFormData({ name: "", phone: "", email: "", date: "", time: "09:00" });
        setBookingId(null);
        onClose();
    };

    // Prefill user data if authenticated
    const prefillUserData = () => {
        if (user && !formData.name) {
            setFormData(prev => ({
                ...prev,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email
            }));
        }
    };

    // Call prefill on open
    if (isOpen && user && !formData.name) {
        prefillUserData();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={step === "SUCCESS" ? "Félicitations !" : "Finaliser votre inscription"}
        >

            {/* STEP 1: DETAILS */}
            {step === "DETAILS" && (
                <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-4">
                        <p className="text-sm text-primary font-semibold">Récapitulatif</p>
                        <div className="flex justify-between items-center mt-1">
                            <span className="font-bold text-gray-900">{offerTitle}</span>
                            <span className="font-bold text-gray-900">{offerPrice.toLocaleString()} FCFA</span>
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                            <p className="text-sm text-amber-800">
                                💡 <strong>Conseil:</strong> Connectez-vous pour suivre votre inscription
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Jean Dupont"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">Numéro de téléphone (Mobile Money)</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    className="pl-9"
                                    placeholder="6XX XX XX XX"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Email (Optionnel)</Label>
                            <Input
                                id="email"
                                placeholder="jean@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="date">Date souhaitée</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="date"
                                        type="date"
                                        className="pl-9"
                                        min={getMinDate()}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="time">Heure préférée</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select
                                        id="time"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    >
                                        <option value="08:00">08:00</option>
                                        <option value="09:00">09:00</option>
                                        <option value="10:00">10:00</option>
                                        <option value="11:00">11:00</option>
                                        <option value="14:00">14:00</option>
                                        <option value="15:00">15:00</option>
                                        <option value="16:00">16:00</option>
                                        <option value="17:00">17:00</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 mb-4 flex items-center justify-between">
                            <p className="text-xs text-red-400 font-bold">
                                Connexion requise pour réserver
                            </p>
                            <Link href="/login" className="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-black uppercase">
                                Login
                            </Link>
                        </div>
                    )}

                    <Button
                        onClick={handleNext}
                        className="w-full mt-2 bg-signal hover:bg-signal-dark text-asphalt font-black rounded-xl py-6 shadow-lg shadow-signal/20 transition-all"
                        disabled={!formData.name || !formData.phone || !formData.date || isLoading || !isAuthenticated}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isAuthenticated ? "Continuer vers le paiement" : "Veuillez vous connecter"}
                    </Button>
                </div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === "PAYMENT" && (
                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Montant à régler</p>
                        <p className="text-4xl font-extrabold text-primary mb-2">{offerPrice.toLocaleString()} FCFA</p>
                        <p className="text-xs text-gray-400">Transaction sécurisée SSL</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handlePayment("MOMO")}
                            disabled={isLoading}
                            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50"
                        >
                            <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold mb-2 group-hover:scale-110 transition-transform">
                                MTN
                            </div>
                            <span className="font-semibold text-sm">Mobile Money</span>
                        </button>

                        <button
                            onClick={() => handlePayment("OM")}
                            disabled={isLoading}
                            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group disabled:opacity-50"
                        >
                            <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center text-orange-500 font-bold mb-2 group-hover:scale-110 transition-transform">
                                OM
                            </div>
                            <span className="font-semibold text-sm">Orange Money</span>
                        </button>
                    </div>

                    {isLoading && (
                        <div className="text-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-sm text-gray-500 mt-2">Traitement en cours...</p>
                        </div>
                    )}

                    <Button variant="ghost" onClick={() => setStep("DETAILS")} className="w-full" disabled={isLoading}>
                        Retour
                    </Button>
                </div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === "SUCCESS" && (
                <div className="text-center py-6">
                    <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                    <p className="text-gray-600 mb-4 max-w-xs mx-auto">
                        Votre paiement a été enregistré. <strong>{school.name}</strong> doit confirmer votre inscription.
                    </p>
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
                        <p className="text-yellow-800 font-medium text-sm">
                            ⏳ Statut: <span className="font-bold">En attente de confirmation</span>
                        </p>
                    </div>
                    {formData.date && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-6">
                            <p className="text-gray-700 font-medium">
                                📅 Date souhaitée: {new Date(formData.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })} à {formData.time}
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mb-4">Vous recevrez un SMS une fois la confirmation reçue.</p>
                    <Button onClick={handleClose} className="w-full" size="lg">
                        Terminer
                    </Button>
                </div>
            )}

        </Modal>
    );
}
