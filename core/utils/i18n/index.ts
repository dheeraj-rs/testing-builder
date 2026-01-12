import { Language, Translations } from '@/core/types/i18n';
import { configTranslations } from './config';

const mergeTranslations = (language: Language): Translations => {
  return {
    ...configTranslations[language],
  };
};

export const translations: Record<Language, Translations> = {
  en: mergeTranslations('en'),
  hi: mergeTranslations('hi'),
};
