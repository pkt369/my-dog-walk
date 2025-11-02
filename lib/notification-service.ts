import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface WalkNotificationData {
  title: string;
  body: string;
  elapsedSeconds: number;
  distanceKm: number;
}

const NOTIFICATION_IDENTIFIER = 'walk-tracking-notification';
let currentNotificationId: string | null = null;

/**
 * Initialize notification service for both iOS and Android
 */
export const initializeNotificationService = async (): Promise<void> => {
  // Set notification handler - only show when app is in background
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,  // Don't show when app is active
      shouldShowList: false,    // Don't show when app is active
    }),
  });

  // Request notification permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[Notification Service] Notification permission denied');
    return;
  }

  // Create notification channel for Android
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('walk-tracking', {
        name: 'Walk Tracking',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
        showBadge: false,
        description: 'Persistent notification shown during active walk sessions',
      });
      console.log('[Notification Service] Android notification channel created');
    } catch (error) {
      console.error('[Notification Service] Failed to create notification channel:', error);
    }
  }

  console.log('[Notification Service] Initialized successfully');
};

/**
 * Shows or updates the persistent notification
 * This creates a single notification that updates its content over time
 */
export const updateWalkNotification = async (
  data: WalkNotificationData
): Promise<boolean> => {
  try {
    // Format the notification content
    const hours = Math.floor(data.elapsedSeconds / 3600);
    const minutes = Math.floor((data.elapsedSeconds % 3600) / 60);
    const seconds = data.elapsedSeconds % 60;

    let timeStr = '';
    if (hours > 0) {
      timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    const distanceStr = data.distanceKm < 1
      ? `${Math.round(data.distanceKm * 1000)}m`
      : `${data.distanceKm.toFixed(2)}km`;

    const bodyText = `${timeStr} | ${distanceStr}`;

    // Schedule/update notification
    const notificationConfig: Notifications.NotificationRequestInput = {
      identifier: currentNotificationId || NOTIFICATION_IDENTIFIER,
      content: {
        title: data.title,
        body: bodyText,
        data: { type: 'walk-tracking' },
        sticky: true,
        priority: Platform.OS === 'android'
          ? Notifications.AndroidNotificationPriority.DEFAULT
          : undefined,
        badge: 0,
        ...(Platform.OS === 'android' && {
          vibrate: [],
        }),
      },
      trigger: null, // Show immediately
    };

    const identifier = await Notifications.scheduleNotificationAsync(notificationConfig);

    if (!currentNotificationId) {
      currentNotificationId = identifier;
      console.log('[Notification Service] Notification created:', identifier);
    }

    return true;
  } catch (error) {
    console.error('[Notification Service] Failed to update notification:', error);
    return false;
  }
};

/**
 * Starts the walk notification
 * This is just an alias for updateWalkNotification for semantic clarity
 */
export const startWalkNotification = async (
  data: WalkNotificationData
): Promise<boolean> => {
  return await updateWalkNotification(data);
};

/**
 * Dismisses the walk notification
 */
export const dismissWalkNotification = async (): Promise<void> => {
  try {
    if (currentNotificationId) {
      await Notifications.dismissNotificationAsync(currentNotificationId);
      currentNotificationId = null;
      console.log('[Notification Service] Notification dismissed');
    }

    // Also dismiss all notifications to be safe
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('[Notification Service] Failed to dismiss notification:', error);
  }
};

/**
 * Checks if notification service is available
 */
export const isNotificationServiceAvailable = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Gets the current notification ID
 */
export const getCurrentNotificationId = (): string | null => {
  return currentNotificationId;
};
