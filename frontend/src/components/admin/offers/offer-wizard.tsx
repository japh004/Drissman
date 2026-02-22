"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useOffers } from "@/hooks";
import { Check, ChevronRight } from "lucide-react";
import { BasicInfoStep } from "./wizard-steps/basic-info-step";
import { ModuleSelectionStep } from "./wizard-steps/module-selection-step";
import { PreviewStep } from "./wizard-steps/preview-step";
import { toast } from "sonner";

import { offerModuleService } from "@/lib/api/offer-modules";

export interface OfferWizardData {
    name: string;
    description: string;
    price: number;
    hours: number;
    permitType: string;
    imageUrl?: string;
    status: 'ACTIVE' | 'DRAFT';
    selectedModuleIds: string[]; // for step 2
}

const STEPS = [
    { id: 1, title: 'Informations', description: 'Détails de base' },
    { id: 2, title: 'Curriculum', description: 'Modules inclus' },
    { id: 3, title: 'Confirmation', description: 'Aperçu final' },
];

export function OfferWizard() {
    const router = useRouter();
    const { user } = useAuth();
    const { createOffer } = useOffers(user?.schoolId);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Global form state
    const [formData, setFormData] = useState<OfferWizardData>({
        name: "",
        description: "",
        price: 0,
        hours: 20,
        permitType: "B",
        imageUrl: "",
        status: "ACTIVE",
        selectedModuleIds: []
    });

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const updateFormData = (data: Partial<OfferWizardData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        if (!user?.schoolId) return;

        try {
            setIsSubmitting(true);

            // 1. Create the offer
            const newOffer = await createOffer({
                schoolId: user.schoolId,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                hours: formData.hours,
                permitType: formData.permitType,
                imageUrl: formData.imageUrl
            });

            // 2. Attach modules
            if (formData.selectedModuleIds.length > 0) {
                const modulesPayload = formData.selectedModuleIds.map((moduleId, index) => ({
                    moduleId,
                    orderIndex: index + 1
                }));

                await offerModuleService.setModulesForOffer(newOffer.id, {
                    modules: modulesPayload
                });
            }

            toast.success("Offre créée avec succès !");
            router.push("/admin/offers");
        } catch (error) {
            console.error(error);
            toast?.error?.("Erreur lors de la création de l'offre");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full flex-1">
            {/* Stepper Header */}
            <div className="border-b border-white/5 bg-asphalt p-6">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    {STEPS.map((step, idx) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300
                                        ${isCompleted ? 'bg-signal text-asphalt' :
                                            isCurrent ? 'bg-signal text-asphalt ring-4 ring-signal/20' :
                                                'bg-white/5 text-white/40 border border-white/10'}
                                    `}>
                                        {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${isCurrent || isCompleted ? 'text-white' : 'text-white/40'}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-white/40 hidden sm:block">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className="hidden sm:flex items-center px-4 w-24 md:w-32 lg:w-48">
                                        <div className={`h-1 w-full rounded-full transition-all duration-500
                                            ${currentStep > step.id ? 'bg-signal' : 'bg-white/5'}
                                        `} />
                                        <ChevronRight className={`h-5 w-5 mx-2 shrink-0
                                            ${currentStep > step.id ? 'text-signal' : 'text-white/20'}
                                        `} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-asphalt-light">
                <div className="max-w-3xl mx-auto">
                    {currentStep === 1 && (
                        <BasicInfoStep
                            data={formData}
                            updateData={updateFormData}
                            onNext={handleNext}
                        />
                    )}
                    {currentStep === 2 && (
                        <ModuleSelectionStep
                            data={formData}
                            updateData={updateFormData}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentStep === 3 && (
                        <PreviewStep
                            data={formData}
                            onBack={handleBack}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
