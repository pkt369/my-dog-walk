import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';

const buildProfile = process.env.EAS_BUILD_PROFILE;

const platformSpecificUnitId = __DEV__ || buildProfile === 'development' || buildProfile === 'preview'
  ? TestIds.INTERSTITIAL
  : Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_ANDROID,
    default: undefined,
  });

const resolvedAdUnitId =
  platformSpecificUnitId || process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID;

type ShowInterstitialAd = () => Promise<boolean>;

type UseInterstitialAdReturn = {
  showAd: ShowInterstitialAd;
};

export function useInterstitialAd(): UseInterstitialAdReturn {
  const adRef = useRef<InterstitialAd | null>(null);
  const adUnitRef = useRef<string | undefined>(resolvedAdUnitId ?? undefined);
  const loadPromiseRef = useRef<Promise<boolean> | null>(null);
  const isLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);

  const getOrCreateAd = useCallback(() => {
    if (!resolvedAdUnitId || !isNativePlatform) {
      return null;
    }

    if (!adRef.current || adUnitRef.current !== resolvedAdUnitId) {
      adRef.current?.removeAllListeners();
      adRef.current = InterstitialAd.createForAdRequest(resolvedAdUnitId);
      adUnitRef.current = resolvedAdUnitId;
      isLoadedRef.current = false;
      isLoadingRef.current = false;
    }

    return adRef.current;
  }, [resolvedAdUnitId]);

  const loadAd = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform || !resolvedAdUnitId) {
      return false;
    }

    const ad = getOrCreateAd();
    if (!ad) {
      return false;
    }

    if (isLoadedRef.current) {
      return true;
    }

    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    const loadPromise = new Promise<boolean>((resolve) => {
      const cleanup = () => {
        loadPromiseRef.current = null;
      };

      const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        isLoadedRef.current = true;
        isLoadingRef.current = false;
        unsubscribeLoaded();
        unsubscribeError();
        cleanup();
        resolve(true);
      });

      const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
        isLoadedRef.current = false;
        isLoadingRef.current = false;
        unsubscribeLoaded();
        unsubscribeError();
        cleanup();
        if (__DEV__) {
          console.warn('[ads] Failed to load interstitial ad', error);
        }
        resolve(false);
      });

      isLoadingRef.current = true;
      ad.load();
    });

    loadPromiseRef.current = loadPromise;
    return loadPromise;
  }, [getOrCreateAd, resolvedAdUnitId]);

  useEffect(() => {
    if (!isNativePlatform || !resolvedAdUnitId) {
      return;
    }

    const ad = getOrCreateAd();
    if (!ad) {
      return;
    }

    void loadAd();

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isLoadedRef.current = false;
      isLoadingRef.current = false;
      void loadAd();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
      isLoadedRef.current = false;
      isLoadingRef.current = false;
    });

    return () => {
      unsubscribeClosed();
      unsubscribeError();
      ad.removeAllListeners();
      adRef.current = null;
      adUnitRef.current = undefined;
      isLoadedRef.current = false;
      isLoadingRef.current = false;
    };
  }, [getOrCreateAd, loadAd, resolvedAdUnitId]);

  const showAd = useCallback(async () => {
    if (!isNativePlatform || !resolvedAdUnitId) {
      return false;
    }

    const ad = getOrCreateAd();
    if (!ad) {
      return false;
    }

    if (!isLoadedRef.current) {
      const loaded = await loadAd();
      if (!loaded) {
        return false;
      }
    }

    try {
      await ad.show();
      return true;
    } catch (error) {
      if (__DEV__) {
        console.warn('[ads] Failed to display interstitial ad', error);
      }
      isLoadedRef.current = false;
      return false;
    }
  }, [getOrCreateAd, loadAd, resolvedAdUnitId]);

  return {
    showAd,
  };
}
