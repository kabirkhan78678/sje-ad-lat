import { ChevronLeft, ChevronRight } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SelectOption, TableColumn } from '@/types/resources';

type TableFilterControl = {
  key: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
};

type DataTableProps<TRecord extends Record<string, any>> = {
  data: TRecord[];
  columns: TableColumn<TRecord>[];
  rowKey?: keyof TRecord | ((record: TRecord) => string);
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: TableFilterControl[];
  actions?: React.ReactNode;
  rowActions?: (record: TRecord) => React.ReactNode;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description: string;
  };
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (record: TRecord) => void;
  onToggleAll?: () => void;
};

const resolveRowKey = <TRecord extends Record<string, any>>(
  record: TRecord,
  rowKey?: keyof TRecord | ((record: TRecord) => string),
) => {
  if (typeof rowKey === 'function') {
    return rowKey(record);
  }

  const resolved = rowKey ? record[rowKey] : record.id;
  return String(resolved ?? '');
};

export const DataTable = <TRecord extends Record<string, any>>({
  actions,
  columns,
  currentPage,
  data,
  emptyState,
  filters,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onToggleAll,
  onToggleRow,
  pageSize,
  rowActions,
  rowKey,
  searchPlaceholder = 'Search records...',
  searchValue,
  selectable,
  selectedIds,
  totalItems,
}: DataTableProps<TRecord>) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          {typeof searchValue === 'string' && onSearchChange ? (
            <div className="w-full max-w-sm">
              <Input
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                value={searchValue}
              />
            </div>
          ) : null}

          {filters?.map((filter) => (
            <div key={filter.key} className="w-full max-w-xs">
              <Select onChange={(event) => filter.onChange(event.target.value)} value={filter.value}>
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>

      {isLoading ? (
        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="p-5">
          <EmptyState
            description={emptyState?.description ?? 'No records found for the current view.'}
            title={emptyState?.title ?? 'No records yet'}
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {selectable ? (
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <input
                        checked={Boolean(data.length) && data.every((record) => selectedIds?.has(resolveRowKey(record, rowKey)))}
                        onChange={onToggleAll}
                        type="checkbox"
                      />
                    </th>
                  ) : null}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {column.label}
                    </th>
                  ))}
                  {rowActions ? (
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.map((record) => {
                  const resolvedKey = resolveRowKey(record, rowKey);

                  return (
                    <tr key={resolvedKey} className="align-top">
                      {selectable ? (
                        <td className="px-5 py-4">
                          <input
                            checked={selectedIds?.has(resolvedKey) ?? false}
                            onChange={() => onToggleRow?.(record)}
                            type="checkbox"
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td key={column.key} className="px-5 py-4 text-sm text-slate-700">
                          {column.render ? column.render(record) : String(record[column.key] ?? '—')}
                        </td>
                      ))}
                      {rowActions ? (
                        <td className="px-5 py-4 text-right">{rowActions(record)}</td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
              </span>
              <div className="w-28">
                <Select onChange={(event) => onPageSizeChange(Number(event.target.value))} value={String(pageSize)}>
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                size="sm"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                size="sm"
                variant="outline"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
