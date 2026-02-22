"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Loader2 } from 'lucide-react';

export default function RootRedirection() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // If not logged in, go to the public portal or login
                router.push('/login');
            } else {
                // Route to the appropriate dashboard based on authentication role
                if (user.role === 'SCHOOL_ADMIN') {
                    router.push('/admin');
                } else if (user.role === 'MONITOR') {
                    router.push('/monitor');
                } else if (user.role === 'CANDIDAT') {
                    router.push('/candidat');
                } else {
                    router.push('/login');
                }
            }
        }
    }, [user, loading, router]);


    return (
        <div className="min-h-screen bg-asphalt flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-signal animate-spin" />
        </div>
    );
}
