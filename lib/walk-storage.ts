import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CoordinateTuple } from './geo';

export interface WalkEntry {
  id: string;
  time: number; // seconds
  distance: number; // kilometers
  path: CoordinateTuple[];
  snapshotUri?: string;
  memo?: string;
  endedAt: string; // ISO timestamp
}

export type WalkLogMap = Record<string, WalkEntry[]>;

const STORAGE_KEY = '@walk-logs';

export const loadWalkLogs = async (): Promise<WalkLogMap> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as WalkLogMap;
  } catch (error) {
    console.warn('Failed to read walk logs', error);
    return {};
  }
};

export const persistWalkLogs = async (logs: WalkLogMap) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.warn('Failed to save walk logs', error);
  }
};

export const addWalkLog = async (dateKey: string, entry: WalkEntry) => {
  const logs = await loadWalkLogs();
  const existing = logs[dateKey] ?? [];
  logs[dateKey] = [entry, ...existing];
  await persistWalkLogs(logs);
  return logs;
};

export const removeWalkLog = async (dateKey: string, entryId: string) => {
  const logs = await loadWalkLogs();
  const existing = logs[dateKey] ?? [];
  const nextEntries = existing.filter((entry) => entry.id !== entryId);
  if (nextEntries.length === 0) {
    delete logs[dateKey];
  } else {
    logs[dateKey] = nextEntries;
  }
  await persistWalkLogs(logs);
  return logs;
};

export const buildTodaySummary = (logs: WalkLogMap, dateKey: string) => {
  const entries = logs[dateKey] ?? [];
  return entries.reduce(
    (acc, item) => {
      acc.time += item.time;
      acc.distance += item.distance;
      return acc;
    },
    { time: 0, distance: 0 }
  );
};

export const sortDatesDesc = (logs: WalkLogMap) =>
  Object.keys(logs).sort((a, b) => (a > b ? -1 : 1));
