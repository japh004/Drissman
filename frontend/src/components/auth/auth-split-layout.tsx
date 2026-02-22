"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthSplitLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    mode: 'login' | 'register';
}

export function AuthSplitLayout({ children, title, description, mode }: AuthSplitLayoutProps) {
    return (
        <div className="min-h-screen flex bg-asphalt overflow-hidden">
            {/* LEFT SIDE : VISUAL & HERO */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden bg-asphalt">
                {/* Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#FFC10710,transparent)]"></div>

                    {/* Dynamic Glow Orbs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-signal/5 rounded-full blur-[100px] animate-pulse"></div>
                </div>

                {/* Full Size Hero Object */}
                <div className="absolute inset-0 z-10 w-full h-full">
                    <Image
                        src="/auth_hero_steering.png"
                        alt="Drissman Premium Driving"
                        fill
                        className="object-cover object-center scale-110"
                        priority
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-asphalt via-transparent to-transparent opacity-90"></div>
                </div>

                {/* Text Overlay */}
                <div className="relative z-20 text-center mt-auto mb-12 max-w-md bg-asphalt/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-2xl">
                    <h2 className="text-3xl font-black text-snow mb-4">
                        Maîtrisez la route <br />
                        <span className="text-signal">avec Style</span>
                    </h2>
                    <p className="text-mist text-lg">
                        La plateforme auto-école nouvelle génération.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE : FORM (Curved Overlap) */}
            <div className="w-full lg:w-1/2 relative bg-white/5 backdrop-blur-3xl shadow-2xl lg:rounded-l-[50px] border-l border-white/10 flex flex-col justify-center p-8 md:p-12 xl:p-24 z-20">
                {/* Logo Mobile + Theme Toggle */}
                <div className="lg:hidden absolute top-8 left-8 right-8 flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-signal/30 to-signal/10 backdrop-blur-sm border border-signal/30 flex items-center justify-center">
                            <span className="text-signal font-black text-base">D</span>
                        </div>
                    </Link>
                    <ThemeToggle />
                </div>

                {/* Desktop Top Nav (Logo + Toggle) */}
                <div className="absolute top-12 right-12 hidden lg:flex items-center gap-6">
                    <ThemeToggle />
                    <div className="bg-asphalt/50 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex items-center">
                        <Link
                            href="/login"
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'login' ? 'bg-signal text-asphalt shadow-lg' : 'text-mist hover:text-snow'}`}
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/register"
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'register' ? 'bg-signal text-asphalt shadow-lg' : 'text-mist hover:text-snow'}`}
                        >
                            Inscription
                        </Link>
                    </div>
                </div>

                <div className="w-full max-w-sm mx-auto">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-snow mb-2 tracking-tight">{title}</h1>
                        <p className="text-mist text-lg">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

