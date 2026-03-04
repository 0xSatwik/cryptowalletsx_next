export const SITE_URL = 'https://cryptowalletsx.com';

export interface SeoDateInfo {
  isoDate: string;
  shortDate: string;
  longDate: string;
  ordinalLongDate: string;
}

interface SeoDateOptions {
  timeZone?: string;
  rolloverHour?: number;
  rolloverMinute?: number;
}

const DEFAULT_TIME_ZONE = 'UTC';

function createDate(input?: Date | string): Date {
  if (!input) {
    return new Date();
  }

  if (input instanceof Date) {
    return input;
  }

  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? new Date(`${input}T12:00:00Z`)
    : new Date(input);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);

  const getValue = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return {
    year: getValue('year'),
    month: getValue('month'),
    day: getValue('day'),
    hour: getValue('hour'),
    minute: getValue('minute'),
  };
}

function resolveDate(input?: Date | string, options?: SeoDateOptions): { date: Date; timeZone: string } {
  const timeZone = options?.timeZone ?? DEFAULT_TIME_ZONE;

  if (input) {
    return {
      date: createDate(input),
      timeZone,
    };
  }

  if (typeof options?.rolloverHour !== 'number') {
    return {
      date: new Date(),
      timeZone,
    };
  }

  const now = new Date();
  const parts = getTimeZoneParts(now, timeZone);
  const rolloverMinute = options.rolloverMinute ?? 0;
  const isBeforeCutoff =
    parts.hour < options.rolloverHour ||
    (parts.hour === options.rolloverHour && parts.minute < rolloverMinute);

  const baseUtc = Date.UTC(parts.year, parts.month - 1, parts.day, 12);
  const adjustedDate = new Date(isBeforeCutoff ? baseUtc - 86400000 : baseUtc);

  return {
    date: adjustedDate,
    timeZone,
  };
}

export function getSeoDateInfo(input?: Date | string, options?: SeoDateOptions): SeoDateInfo {
  const { date, timeZone } = resolveDate(input, options);

  const monthShort = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone,
  }).format(date);

  const monthLong = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone,
  }).format(date);

  const monthNumber = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    timeZone,
  }).format(date);

  const day = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    timeZone,
  }).format(date);

  const dayNumber = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    timeZone,
  }).format(date);

  const year = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    timeZone,
  }).format(date);

  const numericDay = Number(day);
  const ordinalLongDate = `${numericDay}${getOrdinalSuffix(numericDay)} ${monthLong}, ${year}`;
  const isoDate = `${year}-${monthNumber}-${dayNumber}`;

  return {
    isoDate,
    shortDate: `${monthShort} ${day}, ${year}`,
    longDate: `${monthLong} ${day}, ${year}`,
    ordinalLongDate,
  };
}

export function getBinanceDateInfo(input?: Date | string): SeoDateInfo {
  return getSeoDateInfo(input, {
    timeZone: 'Asia/Kolkata',
    rolloverHour: 11,
    rolloverMinute: 0,
  });
}
