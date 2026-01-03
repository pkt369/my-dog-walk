module.exports = {
	expo: {
		name: "DogWalk",
		slug: "dogwalk",
		version: "1.0.1",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "dogwalk",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		ios: {
			supportsTablet: false,
			bundleIdentifier: "com.datasurfing.dogwalk",
			infoPlist: {
				UIDeviceFamily: [1],
				UIRequiresFullScreen: true,
				ITSAppUsesNonExemptEncryption: false,
				CFBundleDisplayName: "DogWalk",
				CFBundleLocalizations: ["en"],
				NSUserTrackingUsageDescription: "This app needs tracking permission to provide customized ads.",
				UIBackgroundModes: ["location"]
			}
		},
		android: {
			package: "com.datasurfing.dogwalk",
			adaptiveIcon: {
				backgroundColor: "#E6F4FE",
				foregroundImage: "./assets/images/icon.png",
				monochromeImage: "./assets/images/icon.png"
			},
			edgeToEdgeEnabled: true,
			predictiveBackGestureEnabled: false,
			config: {
				androidManifest: {
					supportsScreens: {
						smallScreens: true,
						normalScreens: true,
						largeScreens: false,
						xlargeScreens: false,
						anyDensity: true
					}
				}
			}
		},
		web: {
			output: "static",
			favicon: "./assets/images/favicon.png"
		},
		plugins: [
			"expo-tracking-transparency",
			"expo-router",
			[
				"expo-splash-screen",
				{
					image: "./assets/images/splash-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
					dark: {
						backgroundColor: "#000000"
					}
				}
			],
			"expo-web-browser",
			[
				"react-native-google-mobile-ads",
				{
					userTrackingUsageDescription: "This identifier is used to deliver personalized ads to you.",
					iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS,
					androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID
				}
			],
			[
				"expo-location",
				{
					locationAlwaysAndWhenInUsePermission: "DogWalk uses your location, even while the app is in the background, to record your entire walking route and provide accurate distance and time tracking.",
					locationAlwaysPermission: "DogWalk accesses your location even when the app is in the background to record your full walking route and ensure accurate distance and time tracking.",
					locationWhenInUsePermission: "DogWalk uses your location while the app is in use to record your walking route and provide distance and time tracking. To record the full route, allow background location access.",
					isAndroidBackgroundLocationEnabled: true,
					isAndroidForegroundServiceEnabled: true
				}
			],
			[
				"expo-notifications",
				{
					icon: "./assets/images/icon.png",
					color: "#E6F4FE",
					sounds: []
				}
			]
		],
		experiments: {
			typedRoutes: true,
			reactCompiler: false
		},
		extra: {
			router: {},
			eas: {
				projectId: "05dafe7d-293e-4d0b-9057-4a8f6e5d2e76"
			}
		}
	}
};
