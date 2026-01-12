'use client';

import { createContext, useContext, useEffect } from 'react';
import { useLayoutStore } from '../store';
import { translations } from '../utils/i18n';

import type { Language, LanguageData, LanguageContextType, LanguageProviderProps } from '@/core/types/i18n';

export const AVAILABLE_LANGUAGES: LanguageData[] = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸'
    },
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी',
        flag: '🇮🇳'
    }
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const language = useLayoutStore((state) => state.language) as Language;
    const setLanguageState = useLayoutStore((state) => state.setLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language]?.[key] || key;
    };

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        availableLanguages: AVAILABLE_LANGUAGES,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
