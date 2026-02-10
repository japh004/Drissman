"use client";

import { useState } from "react";
import {
    HelpCircle, ChevronDown, MessageSquare, Mail, TicketCheck,
    BookOpen, Search
} from "lucide-react";
import { toast } from "sonner";

/* ─── FAQ Data ─── */
const faqCategories = [
    {
        title: "Gestion du Compte",
        items: [
            {
                question: "Comment changer mon mot de passe ?",
                answer: "Rendez-vous dans Paramètres > Sécurité et remplissez le formulaire de changement de mot de passe. Vous devrez entrer votre mot de passe actuel puis le nouveau.",
            },
            {
                question: "Comment mettre à jour mes informations de profil ?",
                answer: "Allez dans Paramètres > Compte pour modifier votre prénom, nom, email et numéro de téléphone. N'oubliez pas de sauvegarder vos modifications.",
            },
            {
                question: "Comment changer le thème ou la langue ?",
                answer: "Le thème peut être changé via le bouton de basculement dans la barre supérieure du tableau de bord. Le support multilingue sera disponible prochainement.",
            },
        ],
    },
    {
        title: "Pour les Auto-Écoles",
        items: [
            {
                question: "Comment créer mon auto-école ?",
                answer: "Après votre inscription en tant que partenaire, rendez-vous dans 'Mon Auto-école' depuis le menu latéral pour compléter les informations de votre établissement (nom, adresse, offres, disponibilités).",
            },
            {
                question: "Comment gérer mes offres de formation ?",
                answer: "Dans la section 'Offres' du tableau de bord, vous pouvez créer, modifier et supprimer vos offres de formation. Chaque offre peut spécifier un nom, prix, nombre d'heures et type de permis.",
            },
            {
                question: "Comment gérer mes disponibilités ?",
                answer: "La section 'Disponibilités' vous permet de définir vos créneaux horaires par jour de la semaine. Les élèves ne pourront réserver que dans les créneaux que vous avez définis.",
            },
            {
                question: "Comment ajouter un moniteur à mon école ?",
                answer: "La gestion des moniteurs sera disponible dans une prochaine mise à jour. Pour l'instant, toutes les réservations sont associées directement à l'auto-école.",
            },
        ],
    },
    {
        title: "Pour les Élèves",
        items: [
            {
                question: "Comment réserver un cours de conduite ?",
                answer: "Utilisez le bouton 'Trouver une auto-école' depuis votre tableau de bord, parcourez les écoles disponibles, sélectionnez une offre et choisissez un créneau qui vous convient.",
            },
            {
                question: "Comment suivre ma progression ?",
                answer: "Votre tableau de bord affiche votre progression pour le code de la route et la conduite, avec le pourcentage d'avancement et les prochaines échéances.",
            },
            {
                question: "Comment annuler une réservation ?",
                answer: "Rendez-vous dans 'Mes Réservations', sélectionnez la réservation à annuler et cliquez sur 'Annuler'. Attention, une annulation tardive peut entraîner des frais.",
            },
        ],
    },
];

/* ─── FAQ Item Component ─── */
function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
                <span className="font-medium text-snow pr-4">{question}</span>
                <ChevronDown className={`h-5 w-5 text-mist flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
                <p className="px-4 pb-4 text-sm text-mist leading-relaxed">{answer}</p>
            </div>
        </div>
    );
}

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = faqCategories
        .map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (item) =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((cat) => cat.items.length > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-signal/10 text-signal">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-snow">Aide & Support</h2>
                    <p className="text-mist">Trouvez des réponses à vos questions ou contactez notre équipe.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-mist" />
                <input
                    type="text"
                    placeholder="Rechercher dans la FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow placeholder:text-mist/50 focus:border-signal/50 focus:ring-1 focus:ring-signal/50 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FAQ Section (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <div key={category.title}>
                                <h3 className="text-lg font-bold text-snow mb-3">{category.title}</h3>
                                <div className="space-y-2">
                                    {category.items.map((item) => (
                                        <FaqItem key={item.question} question={item.question} answer={item.answer} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                            <HelpCircle className="h-12 w-12 text-mist mx-auto mb-4" />
                            <p className="text-snow font-medium mb-1">Aucun résultat trouvé</p>
                            <p className="text-sm text-mist">Essayez avec d&apos;autres mots-clés ou contactez notre support.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar (Right 1/3) */}
                <div className="space-y-6">
                    {/* Contact Support */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Contacter le Support</h3>
                        <p className="text-sm text-mist mb-4">Vous ne trouvez pas de réponse ? Contactez-nous.</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => toast.info("Ouverture du gestionnaire de tickets...")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow hover:border-signal/30 transition-all text-sm font-medium"
                            >
                                <TicketCheck className="h-5 w-5 text-signal" />
                                Soumettre un Ticket
                            </button>
                            <button
                                onClick={() => toast.info("Initialisation du chat en direct...")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow hover:border-signal/30 transition-all text-sm font-medium"
                            >
                                <MessageSquare className="h-5 w-5 text-signal" />
                                Démarrer un Chat
                            </button>
                            <button
                                onClick={() => toast.info("Redirection vers votre client mail...")}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-snow hover:border-signal/30 transition-all text-sm font-medium"
                            >
                                <Mail className="h-5 w-5 text-signal" />
                                Envoyer un Email
                            </button>
                        </div>
                    </div>

                    {/* Documentation */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-bold text-snow mb-1">Documentation</h3>
                        <p className="text-sm text-mist mb-4">Explorez nos guides détaillés et ressources.</p>
                        <button
                            onClick={() => toast.info("Ouverture de la documentation...")}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-signal/10 border border-signal/20 text-signal hover:bg-signal/20 transition-all text-sm font-bold"
                        >
                            <BookOpen className="h-5 w-5" />
                            Parcourir les Guides
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
