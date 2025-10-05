export default ({ config }) => {
  let locale = 'en';

  try {
    const Localization = require('expo-localization');
    locale = Localization.locale.toLowerCase();
  } catch (e) {
    // console.warn('expo-localization not available at config evaluation time');
  }

  let appName = 'DogWalk';
  if (locale.startsWith('ko')) {
    appName = '도그워크';
  } else if (locale.startsWith('ja')) {
    appName = 'ドッグウォーク';
  }

  return {
    expo: {
      name: appName,
      slug: 'dogwalk',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      scheme: 'dogwalk',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.datasurfing.dogwalk',
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
        },
      },
      android: {
        adaptiveIcon: {
          backgroundColor: '#E6F4FE',
          foregroundImage: './assets/images/android-icon-foreground.png',
          backgroundImage: './assets/images/android-icon-background.png',
          monochromeImage: './assets/images/android-icon-monochrome.png',
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: 'com.devjun.dogwalk',
      },
      web: {
        output: 'static',
        favicon: './assets/images/favicon.png',
      },
      plugins: [
        'expo-localization',
        'expo-router',
        [
          'expo-splash-screen',
          {
            image: './assets/images/splash-icon.png',
            imageWidth: 200,
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
            dark: {
              backgroundColor: '#000000',
            },
          },
        ],
        'expo-web-browser',
        [
          'react-native-google-mobile-ads',
          {
            userTrackingUsageDescription: '맞춤 광고 제공을 위해 기기 식별자를 사용합니다.',
            iosAppId: 'ca-app-pub-9912842723450619~7600130981',
            androidAppId: 'ca-app-pub-9912842723450619~1091413015',
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
      extra: {
        router: {},
        eas: {
          projectId: '06d146bc-5c06-4013-8257-0da577e21600',
        },
      },
    },
  };
};
