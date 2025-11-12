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

  let locationAlwaysAndWhenInUsePermission = 'DogWalk uses your location, even while the app is in the background, to record your entire walking route and provide accurate distance and time tracking.';
  let locationAlwaysPermission = 'DogWalk accesses your location even when the app is in the background to record your full walking route and ensure accurate distance and time tracking.';
  let locationWhenInUsePermission = 'DogWalk uses your location while the app is in use to record your walking route and provide distance and time tracking. To record the full route, allow background location access.';

  if (locale.startsWith('ko')) {
    appName = '도그워크';
    trackingDescription = '이 앱은 맞춤형 광고 제공을 위해 추적 권한이 필요합니다.';
    locationAlwaysAndWhenInUsePermission =
      '도그워크는 산책 경로 전체를 기록하고 정확한 거리 및 시간 추적을 제공하기 위해 앱이 백그라운드에 있을 때도 위치 정보를 사용합니다.';
    locationAlwaysPermission =
      '도그워크가 앱이 백그라운드에 있을 때도 위치 정보에 접근하여 산책 경로 전체를 기록하고, 정확한 거리와 시간 추적을 제공할 수 있도록 허용합니다.';
    locationWhenInUsePermission =
      '도그워크가 앱 사용 중에 위치 정보를 사용하여 산책 경로를 기록하고 거리 및 시간 추적을 제공합니다. 전체 경로 기록을 위해서는 백그라운드 위치 접근을 허용해 주세요.';
  } else if (locale.startsWith('ja')) {
    appName = 'ドッグウォーク';
    trackingDescription = 'このアプリはカスタマイズされた広告を提供するために追跡許可が必要です。';
    locationAlwaysAndWhenInUsePermission =
      'ドッグウォークは、アプリがバックグラウンドにある場合でも位置情報を利用して、散歩ルート全体を記録し、正確な距離と時間の追跡を行います。';
    locationAlwaysPermission =
      'ドッグウォークがアプリがバックグラウンドにある場合でも位置情報にアクセスし、散歩ルート全体を記録して正確な距離と時間を追跡できるように許可してください。';
    locationWhenInUsePermission =
      'ドッグウォークがアプリ使用中に位置情報を利用して散歩ルートを記録し、距離と時間の追跡を行います。ルート全体を記録するにはバックグラウンドでの位置情報利用を許可してください。';
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
        'expo-tracking-transparency',
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
            userTrackingUsageDescription: 'This identifier is used to deliver personalized ads to you.',
            iosAppId: 'ca-app-pub-9912842723450619~7600130981',
            androidAppId: 'ca-app-pub-9912842723450619~1091413015',
          },
        ],
        [
          'expo-location',
          {
            locationAlwaysAndWhenInUsePermission,
            locationAlwaysPermission,
            locationWhenInUsePermission,
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
