function parseApiDate(dateString: string): Date {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateString);
  const normalizedDateString = hasTimezone ? dateString : `${dateString}Z`;

  return new Date(normalizedDateString);
}

export function formatDate(dateString: string): string {
  const date = parseApiDate(dateString);

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  });
}

export function formatDateTime(dateString: string): string {
  const date = parseApiDate(dateString);

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}분 ${remainingSeconds}초`;
}
