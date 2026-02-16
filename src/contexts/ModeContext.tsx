'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AppMode = 'internships' | 'campus';

interface ModeContextType {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
    toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<AppMode>('campus');

    // Persist mode selection
    useEffect(() => {
        const savedMode = localStorage.getItem('campussync-mode') as AppMode;
        if (savedMode) {
            setModeState(savedMode);
        }
    }, []);

    const setMode = (newMode: AppMode) => {
        setModeState(newMode);
        localStorage.setItem('campussync-mode', newMode);
    };

    const toggleMode = () => {
        const newMode = mode === 'internships' ? 'campus' : 'internships';
        setMode(newMode);
    };

    return (
        <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    );
}

export function useMode() {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error('useMode must be used within ModeProvider');
    }
    return context;
}
