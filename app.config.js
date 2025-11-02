export default ({ config }) => {
  let locale = 'en';

  try {
    const Localization = require('expo-localization');
    locale = Localization.locale.toLowerCase();
  } catch (e) {
    // console.warn('expo-localization not available at config evaluation time');
  }

  let appName = 'DogWalk';
  let trackingDescription = 'This app needs tracking permission to provide customized ads.';

  if (locale.startsWith('ko')) {
    appName = '도그워크';
    trackingDescription = '이 앱은 맞춤형 광고 제공을 위해 추적 권한이 필요합니다.';
  } else if (locale.startsWith('ja')) {
    appName = 'ドッグウォーク';
    trackingDescription = 'このアプリはカスタマイズされた広告を提供するために追跡許可が必要です。';
  }

  return {
    expo: {
      versionCode: 3,
      owner: 'datasurfing',
      name: appName,
      slug: 'dogwalk',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      scheme: 'dogwalk',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
        supportsTablet: false,
        bundleIdentifier: 'com.datasurfing.dogwalk',
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
          CFBundleDisplayName: appName,
          CFBundleLocalizations: ['en', 'ko', 'ja'],
          NSUserTrackingUsageDescription: trackingDescription,
          UIBackgroundModes: ['location'],
        },
      },
      android: {
        adaptiveIcon: {
          backgroundColor: '#E6F4FE',
          foregroundImage: './assets/images/icon.png',
          monochromeImage: './assets/images/icon.png',
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: 'com.datasurfing.dogwalk',
        config: {
          androidManifest: {
            supportsScreens: {
              smallScreens: true,
              normalScreens: true,
              largeScreens: false,
              xlargeScreens: false,
              anyDensity: true,
            },
          },
        },
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
        [
          'expo-location',
          {
            locationAlwaysAndWhenInUsePermission: 'Allow DogWalk to use your location to track your walks.',
            locationAlwaysPermission: 'Allow DogWalk to use your location even when the app is in the background to continue tracking your walk.',
            locationWhenInUsePermission: 'Allow DogWalk to use your location to track your walks.',
            isAndroidBackgroundLocationEnabled: true,
            isAndroidForegroundServiceEnabled: true,
          },
        ],
        [
          'expo-notifications',
          {
            icon: './assets/images/icon.png',
            color: '#E6F4FE',
            sounds: [],
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
        reactCompiler: false,
      },
      extra: {
        router: {},
        eas: {
          "projectId": "05dafe7d-293e-4d0b-9057-4a8f6e5d2e76"
        },
      },
    },
  };
};
