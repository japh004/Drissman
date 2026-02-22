"use client";

import { useAuth } from "@/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If user is a school admin, they should stay in the dashboard
        // We allow the logout process and specific auth pages if necessary, 
        // but generally redirect to dashboard.
        if (!loading && user?.role === 'SCHOOL_ADMIN') {
            // Check if we are not already on a path that should be accessible (unlikely for public layout)
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    if (loading || (user?.role === 'SCHOOL_ADMIN')) {
        return (
            <div className="min-h-screen bg-asphalt flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-signal animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
