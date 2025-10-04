import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@my-dog-walk/preferences';

export interface Preferences {
  includeStatsInSnapshot: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  includeStatsInSnapshot: true,
};

const mergeWithDefaults = (prefs: Partial<Preferences> | null | undefined): Preferences => ({
  ...DEFAULT_PREFERENCES,
  ...(prefs ?? {}),
});

export const loadPreferences = async (): Promise<Preferences> => {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return mergeWithDefaults(parsed);
  } catch (error) {
    console.warn('Failed to load preferences', error);
    return DEFAULT_PREFERENCES;
  }
};

export const updatePreferences = async (patch: Partial<Preferences>) => {
  try {
    const current = await loadPreferences();
    const next = { ...current, ...patch };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Failed to update preferences', error);
    return mergeWithDefaults(patch);
  }
};
