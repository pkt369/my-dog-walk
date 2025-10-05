export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'settings.language';

export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};
