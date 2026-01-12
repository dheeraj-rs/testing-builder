export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: string;
}

export interface LanguageData {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: LanguageData[];
}

export interface LanguageProviderProps {
  children: React.ReactNode;
}
