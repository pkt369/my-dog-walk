import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polyline, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { formatDistance, formatDuration } from '@/lib/format';
import { CoordinateTuple, haversineDistance } from '@/lib/geo';

interface WalkPayload {
  duration: number;
  distance: number;
  path: CoordinateTuple[];
}

export default function WalkScreen() {
  const router = useRouter();
  const [path, setPath] = useState<CoordinateTuple[]>([]);
  const [region, setRegion] = useState<Region | undefined>();
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '산책을 기록하려면 위치 접근 허용이 필요해요.', [
          { text: '확인', onPress: () => router.back() },
        ]);
        return;
      }

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const initialPoint: CoordinateTuple = [
        initial.coords.latitude,
        initial.coords.longitude,
      ];

      setDistance(0);
      setElapsed(0);
      setPath([initialPoint]);
      setRegion({
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });

      startTsRef.current = Date.now();
      setIsTracking(true);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        (location) => {
          setRegion((prev) => ({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: prev?.latitudeDelta ?? 0.002,
            longitudeDelta: prev?.longitudeDelta ?? 0.002,
          }));

          setPath((prev) => {
            const nextPoint: CoordinateTuple = [
              location.coords.latitude,
              location.coords.longitude,
            ];
            if (prev.length === 0) {
              return [nextPoint];
            }
            const lastPoint = prev[prev.length - 1];
            const segment = haversineDistance(
              { latitude: lastPoint[0], longitude: lastPoint[1] },
              { latitude: nextPoint[0], longitude: nextPoint[1] }
            );
            setDistance((current) => current + segment);
            return [...prev, nextPoint];
          });
        }
      );
    };

    startTracking();

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [router]);

  useEffect(() => {
    if (!isTracking) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      if (!startTsRef.current) return;
      const delta = Math.floor((Date.now() - startTsRef.current) / 1000);
      setElapsed(delta);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTracking]);

  const handleStop = () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);

    const finalDuration = startTsRef.current
      ? Math.floor((Date.now() - startTsRef.current) / 1000)
      : elapsed;

    const payload: WalkPayload = {
      duration: finalDuration,
      distance,
      path,
    };

    router.replace({ pathname: '/summary', params: { payload: JSON.stringify(payload) } });
  };

  return (
    <View style={styles.container}>
      {region ? (
        <MapView style={StyleSheet.absoluteFill} region={region} showsUserLocation followsUserLocation>
          {path.length > 1 ? (
            <Polyline coordinates={path.map(([latitude, longitude]) => ({ latitude, longitude }))} strokeColor={Colors.light.tint} strokeWidth={6} />
          ) : null}
        </MapView>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>위치 정보를 불러오는 중이에요…</Text>
        </View>
      )}

      <SafeAreaView style={styles.overlay}>
        <View style={styles.statsCard}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>경과 시간</Text>
            <Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>이동 거리</Text>
            <Text style={styles.statValue}>{formatDistance(distance)}</Text>
          </View>
        </View>

        <Pressable style={styles.stopButton} onPress={handleStop}>
          <Text style={styles.stopLabel}>산책 종료</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  overlay: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    gap: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  stopLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
