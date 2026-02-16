"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
    label: string;
    href: string;
    count?: number;
}

interface TabNavigationProps {
    tabs: Tab[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-1 bg-white/[0.04] backdrop-blur-sm p-1.5 rounded-2xl border border-white/[0.06] mb-8 w-fit">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap",
                            isActive
                                ? "bg-signal text-asphalt shadow-lg shadow-signal/20"
                                : "text-mist hover:text-snow hover:bg-white/[0.06]"
                        )}
                    >
                        <span className="flex items-center gap-2">
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={cn(
                                    "text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center",
                                    isActive
                                        ? "bg-asphalt/20 text-asphalt"
                                        : "bg-white/10 text-mist"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
