export const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}시간 ${mins.toString().padStart(2, '0')}분`;
  }

  return `${mins.toString().padStart(2, '0')}분 ${secs.toString().padStart(2, '0')}초`;
};

export const formatDistance = (km: number) => `${km.toFixed(2)} km`;

export const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};
