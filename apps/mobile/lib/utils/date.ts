/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환 (로컬 타임존 기준)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 서버에서 받은 ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 * @param isoDateString - ISO 형식의 날짜 문자열 (예: "2024-01-15T00:00:00.000Z")
 * @param fallback - 파싱 실패 시 반환할 기본값
 */
export function parseServerDate(isoDateString: string | undefined | null, fallback?: string): string {
  if (!isoDateString) return fallback || '';
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return fallback || isoDateString;
    return formatDate(d);
  } catch {
    return fallback || isoDateString;
  }
}

/**
 * 서버에서 받은 ISO 시간 문자열을 HH:mm 형식으로 변환
 * @param isoTimeString - ISO 형식의 시간 문자열 (예: "2024-01-15T14:30:00.000Z")
 * @param fallback - 파싱 실패 시 반환할 기본값
 */
export function parseServerTime(isoTimeString: string | undefined | null, fallback?: string): string {
  if (!isoTimeString) return fallback || '';
  try {
    const t = new Date(isoTimeString);
    if (isNaN(t.getTime())) return fallback || isoTimeString;
    const hours = t.getHours().toString().padStart(2, '0');
    const minutes = t.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return fallback || isoTimeString;
  }
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate;
}

export function getDaysBetween(startDate: string, endDate: string): number {
  // 날짜 문자열을 로컬 시간으로 파싱 (YYYY-MM-DD 형식)
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
}

// API용 24시간 형식 (HH:mm)
export function formatTimeForApi(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const match = timeString.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return { hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) };
  }
  return { hours: 0, minutes: 0 };
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return DAY_NAMES[d.getDay()];
}

export function getMonthYear(date: Date | string): { year: number; month: number } {
  const d = typeof date === 'string' ? new Date(date) : date;
  return { year: d.getFullYear(), month: d.getMonth() };
}
