import { es, type Translations } from './es';
import { en } from './en';

export type Lang = 'es' | 'en';
export type { Translations };

export const dictionaries: Record<Lang, Translations> = { es, en };

export function useTranslations(lang: Lang): Translations {
  return dictionaries[lang];
}
