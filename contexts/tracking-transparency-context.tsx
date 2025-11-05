import * as TrackingTransparency from 'expo-tracking-transparency';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

type TrackingStatus = 'not-determined' | 'requesting' | 'granted' | 'denied' | 'not-supported';

interface TrackingTransparencyContextType {
  status: TrackingStatus;
  isReady: boolean;
}

const TrackingTransparencyContext = createContext<TrackingTransparencyContextType>({
  status: 'not-determined',
  isReady: false,
});

export function useTrackingTransparency() {
  return useContext(TrackingTransparencyContext);
}

interface TrackingTransparencyProviderProps {
  children: React.ReactNode;
}

export function TrackingTransparencyProvider({ children }: TrackingTransparencyProviderProps) {
  const [status, setStatus] = useState<TrackingStatus>('not-determined');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAdsWithATT = async () => {
      // Request App Tracking Transparency permission on iOS
      if (Platform.OS === 'ios') {
        setStatus('requesting');
        try {
          const { status: permissionStatus } = await TrackingTransparency.requestTrackingPermissionsAsync();

          if (permissionStatus === 'granted') {
            setStatus('granted');
            // Initialize Google Ads with personalized ads
            await mobileAds().initialize();
          } else {
            setStatus('denied');
            // Initialize Google Ads with non-personalized ads only
            await mobileAds().setRequestConfiguration({
              maxAdContentRating: MaxAdContentRating.G,
              tagForChildDirectedTreatment: false,
              tagForUnderAgeOfConsent: false,
              testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
            });
            await mobileAds().initialize();
          }
        } catch (error) {
          if (__DEV__) {
            console.error('Failed to request tracking permission or initialize ads:', error);
          }
          setStatus('denied');
          // Still initialize ads even if ATT fails
          try {
            await mobileAds().initialize();
          } catch (initError) {
            if (__DEV__) {
              console.error('Failed to initialize Google Ads:', initError);
            }
          }
        } finally {
          setIsReady(true);
        }
      } else {
        // Android or web - no ATT required
        setStatus('not-supported');
        // Initialize ads for Android
        if (Platform.OS === 'android') {
          try {
            await mobileAds().initialize();
          } catch (error) {
            if (__DEV__) {
              console.error('Failed to initialize Google Ads on Android:', error);
            }
          }
        }
        setIsReady(true);
      }
    };

    initializeAdsWithATT();
  }, []);

  return (  
    <TrackingTransparencyContext.Provider value={{ status, isReady }}>
      {children}
    </TrackingTransparencyContext.Provider>
  );
}
