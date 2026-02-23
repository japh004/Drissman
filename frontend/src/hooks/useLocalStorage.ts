"use client";

import { useState, useEffect } from "react";

/**
 * A useState replacement that persists data in localStorage.
 * Data survives page refreshes until backend APIs are connected.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const storageKey = `drissman_${key}`;
    const legacyKey = key;

    const [value, setValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const stored = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyKey);
            return stored ? JSON.parse(stored) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
            // Keep legacy key in sync while the app migrates to drissman_* keys.
            localStorage.setItem(legacyKey, JSON.stringify(value));
        } catch {
            // localStorage full or unavailable - ignore
        }
    }, [legacyKey, storageKey, value]);

    return [value, setValue];
}
