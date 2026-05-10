import type { FieldConfig, SelectOption } from '@/types/resources';
import { normalizeFieldValue } from '@/utils/schema';
import { titleCase } from '@/utils/formatters';

export const mapRecordToFormValues = <TFormValues>(
  fields: FieldConfig[],
  record: Record<string, unknown> | undefined,
  defaultValues: TFormValues,
) => {
  const nextValues = { ...(defaultValues as Record<string, unknown>) };

  if (!record) {
    return nextValues as TFormValues;
  }

  fields.forEach((field) => {
    nextValues[field.name] = normalizeFieldValue(field, record[field.name]);
  });

  return nextValues as TFormValues;
};

export const buildDynamicFilterOptions = <TRecord extends Record<string, any>>(
  records: TRecord[],
  key: string,
): SelectOption[] => {
  const values = Array.from(
    new Set(
      records
        .map((record) => record[key])
        .filter((value): value is string | number => value !== null && value !== undefined && value !== ''),
    ),
  );

  return values
    .map((value) => ({
      label: titleCase(String(value)),
      value: String(value),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
};

export const filterRecords = <TRecord extends Record<string, any>>(
  records: TRecord[],
  searchValue: string,
  searchKeys: string[],
  filters: Record<string, string>,
) => {
  return records.filter((record) => {
    const searchMatch =
      !searchValue ||
      searchKeys.some((key) =>
        String(record[key] ?? '')
          .toLowerCase()
          .includes(searchValue.toLowerCase()),
      );

    const filtersMatch = Object.entries(filters).every(([filterKey, filterValue]) => {
      if (!filterValue) {
        return true;
      }

      return String(record[filterKey] ?? '').toLowerCase() === filterValue.toLowerCase();
    });

    return searchMatch && filtersMatch;
  });
};

export const sortRecords = <TRecord extends Record<string, any>>(records: TRecord[]) => {
  return [...records].sort((left, right) => {
    if ('display_order' in left || 'display_order' in right) {
      return Number(left.display_order ?? 0) - Number(right.display_order ?? 0);
    }

    if ('created_at' in left || 'created_at' in right) {
      return String(right.created_at ?? '').localeCompare(String(left.created_at ?? ''));
    }

    return 0;
  });
};
