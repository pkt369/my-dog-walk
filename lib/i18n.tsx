import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocalization from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  LANGUAGE_LOCALE_MAP,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/constants/localization';
import { formatDateLabel, formatDistance, formatDuration, formatTimeLabel } from '@/lib/format';
import { translations, type TranslationTree } from '@/locales/translations';

const isSupported = (value: unknown): value is SupportedLanguage =>
  typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);

const mapCodeToLanguage = (code?: string | null): SupportedLanguage => {
  if (!code) return 'en';
  const normalized = code.toLowerCase();
  if (normalized.startsWith('ko')) return 'ko';
  if (normalized.startsWith('ja')) return 'ja';
  return 'en';
};

const detectDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = ExpoLocalization.getLocales?.();
    if (locales && locales.length > 0) {
      const primary = locales[0];
      return mapCodeToLanguage(primary.languageCode ?? primary.languageTag);
    }
    return 'en';
  } catch (error) {
    console.warn('Failed to detect device language', error);
    return 'en';
  }
};

type LocalizationContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  strings: TranslationTree;
  localeTag: string;
  formatDuration: (seconds: number) => string;
  formatDistance: (km: number) => string;
  formatDateLabel: (isoDate: string) => string;
  formatTime: (iso: string) => string;
  deviceLanguage: SupportedLanguage;
  deviceLocaleTag: string;
  isHydrated: boolean;
};

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

type LocalizationProviderProps = {
  children: ReactNode;
};

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  const deviceLanguage = useMemo(() => detectDeviceLanguage(), []);
  const deviceLocaleTag = LANGUAGE_LOCALE_MAP[deviceLanguage];
  const [language, setLanguageState] = useState<SupportedLanguage>(deviceLanguage);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (isMounted && isSupported(stored)) {
          setLanguageState(stored);
        }
      } catch (error) {
        console.warn('Failed to load saved language preference', error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateLanguage = useCallback(async (next: SupportedLanguage) => {
    setLanguageState(next);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch (error) {
      console.warn('Failed to persist language preference', error);
    }
  }, []);

  const strings = useMemo(() => translations[language], [language]);
  const localeTag = LANGUAGE_LOCALE_MAP[language];

  const value = useMemo<LocalizationContextValue>(() => ({
    language,
    setLanguage: updateLanguage,
    strings,
    localeTag,
    formatDuration: (seconds: number) => formatDuration(seconds, language),
    formatDistance: (km: number) => formatDistance(km, language),
    formatDateLabel: (isoDate: string) => formatDateLabel(isoDate, language),
    formatTime: (iso: string) => formatTimeLabel(iso, language),
    deviceLanguage,
    deviceLocaleTag,
    isHydrated,
  }), [language, updateLanguage, strings, localeTag, deviceLanguage, deviceLocaleTag, isHydrated]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
