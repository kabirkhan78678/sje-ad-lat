import type { KeyValuePair } from '@/types/resources';

export const formatNumber = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);

  if (Number.isNaN(numeric)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN').format(numeric);
};

export const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const titleCase = (value: string) =>
  value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const keyValuePairsToObject = (pairs: KeyValuePair[]) =>
  pairs.reduce<Record<string, string>>((accumulator, current) => {
    if (current.key.trim()) {
      accumulator[current.key.trim()] = current.value.trim();
    }

    return accumulator;
  }, {});

export const objectToKeyValuePairs = (value: unknown): KeyValuePair[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).map(([key, pairValue]) => ({
    key,
    value: String(pairValue ?? ''),
  }));
};
