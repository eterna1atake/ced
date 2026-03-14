"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UnsavedChangesContextType = {
    isDirty: boolean;
    setIsDirty: (isDirty: boolean) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType>({
    isDirty: false,
    setIsDirty: () => { },
});

export const UnsavedChangesProvider = ({ children }: { children: ReactNode }) => {
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    return (
        <UnsavedChangesContext.Provider value={{ isDirty, setIsDirty }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
};

export const useUnsavedChanges = () => useContext(UnsavedChangesContext);
