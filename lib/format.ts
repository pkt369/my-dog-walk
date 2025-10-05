import { LANGUAGE_LOCALE_MAP, type SupportedLanguage } from '@/constants/localization';

const padNumber = (value: number) => value.toString().padStart(2, '0');

export const formatDuration = (seconds: number, language: SupportedLanguage) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.max(0, seconds % 60);

  switch (language) {
    case 'ko': {
      if (hrs > 0) {
        return `${hrs}시간 ${padNumber(mins)}분`;
      }
      return `${padNumber(mins)}분 ${padNumber(secs)}초`;
    }
    case 'ja': {
      if (hrs > 0) {
        return `${hrs}時間 ${padNumber(mins)}分`;
      }
      return `${padNumber(mins)}分 ${padNumber(secs)}秒`;
    }
    case 'en':
    default: {
      if (hrs > 0) {
        return `${hrs}h ${padNumber(mins)}m`;
      }
      return `${padNumber(mins)}m ${padNumber(secs)}s`;
    }
  }
};

export const formatDistance = (km: number, language: SupportedLanguage) => {
  const formatted = km.toFixed(2);
  switch (language) {
    case 'ko':
      return `${formatted} km`;
    case 'ja':
      return `${formatted} km`;
    case 'en':
    default:
      return `${formatted} km`;
  }
};

export const formatDateLabel = (isoDate: string, language: SupportedLanguage) => {
  const locale = LANGUAGE_LOCALE_MAP[language];
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

export const formatTimeLabel = (iso: string, language: SupportedLanguage) => {
  const locale = LANGUAGE_LOCALE_MAP[language];
  return new Date(iso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};
