import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { haversineDistance, CoordinateTuple } from './geo';

export const LOCATION_TASK_NAME = 'background-location-task';
const WALK_SESSION_KEY = '@walk_session_background';

export interface WalkSessionData {
  startTime: number;
  path: CoordinateTuple[];
  distance: number;
  isActive: boolean;
}

// Define the background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[Background Location] Task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    if (locations && locations.length > 0) {
      try {
        // Get current session data
        const sessionJson = await AsyncStorage.getItem(WALK_SESSION_KEY);
        if (!sessionJson) {
          console.log('[Background Location] No active session found');
          return;
        }

        const session: WalkSessionData = JSON.parse(sessionJson);

        // Process each new location
        for (const location of locations) {
          const { coords } = location;
          const { latitude, longitude } = coords;

          // Filter out inaccurate readings (same as foreground logic)
          if (coords.accuracy && coords.accuracy > 50) {
            console.log('[Background Location] Skipping inaccurate location:', coords.accuracy);
            continue;
          }

          const newCoord: CoordinateTuple = [latitude, longitude];

          // Calculate distance from last point
          if (session.path.length > 0) {
            const lastCoord = session.path[session.path.length - 1];
            const distance = haversineDistance(
              { latitude: lastCoord[0], longitude: lastCoord[1] },
              { latitude, longitude }
            );

            // Only add if moved more than 1 meter
            if (distance >= 0.001) {
              session.path.push(newCoord);
              session.distance += distance;
            }
          } else {
            // First point
            session.path.push(newCoord);
          }
        }

        // Save updated session
        await AsyncStorage.setItem(WALK_SESSION_KEY, JSON.stringify(session));

        console.log('[Background Location] Updated session:', {
          points: session.path.length,
          distance: session.distance.toFixed(2) + ' km'
        });

      } catch (err) {
        console.error('[Background Location] Error processing locations:', err);
      }
    }
  }
});

export interface BackgroundLocationOptions {
  notificationTitle?: string;
  notificationBody?: string;
}

export const startBackgroundLocationTracking = async (
  options?: BackgroundLocationOptions
): Promise<boolean> => {
  try {
    // Request foreground permission first
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.error('[Background Location] Foreground permission denied');
      return false;
    }

    // Request background permission
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.error('[Background Location] Background permission denied');
      return false;
    }

    // Check if already running
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      console.log('[Background Location] Task already running');
      return true;
    }

    // Initialize session data
    const initialSession: WalkSessionData = {
      startTime: Date.now(),
      path: [],
      distance: 0,
      isActive: true,
    };
    await AsyncStorage.setItem(WALK_SESSION_KEY, JSON.stringify(initialSession));

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 2000, // Update every 2 seconds
      distanceInterval: 1, // Update every 1 meter
      showsBackgroundLocationIndicator: Platform.OS === 'ios',
      foregroundService: Platform.OS === 'android' ? {
        notificationTitle: options?.notificationTitle || 'Dog Walk Active',
        notificationBody: options?.notificationBody || 'Tracking your walk...',
        notificationColor: '#E6F4FE',
        killServiceOnDestroy: true,
      } : undefined,
    });

    console.log('[Background Location] Started successfully');
    return true;

  } catch (error) {
    console.error('[Background Location] Failed to start:', error);
    return false;
  }
};

export const stopBackgroundLocationTracking = async (): Promise<WalkSessionData | null> => {
  try {
    // Check if task is registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('[Background Location] Stopped successfully');
    }

    // Get final session data
    const sessionJson = await AsyncStorage.getItem(WALK_SESSION_KEY);
    if (sessionJson) {
      const session: WalkSessionData = JSON.parse(sessionJson);
      session.isActive = false;

      // Clean up
      await AsyncStorage.removeItem(WALK_SESSION_KEY);

      return session;
    }

    return null;
  } catch (error) {
    console.error('[Background Location] Failed to stop:', error);
    return null;
  }
};

export const getBackgroundSessionData = async (): Promise<WalkSessionData | null> => {
  try {
    const sessionJson = await AsyncStorage.getItem(WALK_SESSION_KEY);
    if (sessionJson) {
      return JSON.parse(sessionJson);
    }
    return null;
  } catch (error) {
    console.error('[Background Location] Failed to get session data:', error);
    return null;
  }
};

export const isBackgroundLocationRunning = async (): Promise<boolean> => {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('[Background Location] Failed to check status:', error);
    return false;
  }
};
