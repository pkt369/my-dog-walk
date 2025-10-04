import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

export const shareCaptureStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  captureSurface: {
    gap: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 24,
  },
  captureSurfaceRounded: {
    borderRadius: 24,
  },
  metricsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  snapshotCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  snapshotImage: {
    width: '100%',
    height: 350,
  },
  placeholderCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },
  shareButton: {
    backgroundColor: Colors.light.tint,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
