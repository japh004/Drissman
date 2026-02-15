"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
    label: string;
    href: string;
}

interface TabNavigationProps {
    tabs: Tab[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
    const pathname = usePathname();

    return (
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all",
                            isActive
                                ? "bg-signal text-asphalt shadow-md"
                                : "text-mist hover:text-snow hover:bg-white/5"
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
