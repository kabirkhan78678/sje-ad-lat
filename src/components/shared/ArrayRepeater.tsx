import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import type { FieldConfig } from '@/types/resources';

type ArrayRepeaterProps = {
  name: string;
  label: string;
  addLabel?: string;
  itemLabel?: string;
  subfields?: FieldConfig[];
};

const getDefaultObjectItem = (subfields: FieldConfig[]) =>
  subfields.reduce<Record<string, unknown>>((accumulator, subfield) => {
    if (subfield.defaultValue !== undefined) {
      accumulator[subfield.name] = subfield.defaultValue;
    } else if (subfield.type === 'switch') {
      accumulator[subfield.name] = false;
    } else {
      accumulator[subfield.name] = '';
    }

    return accumulator;
  }, {});

const NestedFieldRenderer = ({
  field,
  fieldPath,
}: {
  field: FieldConfig;
  fieldPath: string;
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors?.[fieldPath.split('.')[0] as keyof typeof errors];

  return (
    <div className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
      <label className="mb-2 block text-sm font-semibold text-slate-800">{field.label}</label>
      <Controller
        control={control}
        name={fieldPath}
        render={({ field: controllerField }) => {
          if (field.type === 'textarea') {
            return <Textarea {...controllerField} placeholder={field.placeholder} rows={field.rows ?? 4} />;
          }

          if (field.type === 'select') {
            return (
              <Select {...controllerField}>
                <option value="">Select {field.label}</option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            );
          }

          if (field.type === 'switch') {
            return (
              <div className="flex h-11 items-center rounded-xl border border-slate-300 bg-white px-3">
                <Switch checked={Boolean(controllerField.value)} onChange={controllerField.onChange} />
              </div>
            );
          }

          return (
            <Input
              {...controllerField}
              placeholder={field.placeholder}
              type={field.type === 'number' ? 'number' : field.type}
            />
          );
        }}
      />
      {fieldError ? null : null}
    </div>
  );
};

export const ArrayRepeater = ({
  addLabel = 'Add item',
  itemLabel = 'Item',
  label,
  name,
  subfields,
}: ArrayRepeaterProps) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const isObjectArray = Boolean(subfields && subfields.length > 0);

  return (
    <div className="panel-subtle space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">Manage repeatable items for this section.</p>
        </div>
        <Button
          onClick={() => append(isObjectArray ? getDefaultObjectItem(subfields ?? []) : '')}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No items added yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {fields.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <GripVertical className="h-4 w-4 text-slate-400" />
                {itemLabel} {index + 1}
              </div>
              <Button onClick={() => remove(index)} size="sm" type="button" variant="ghost">
                <Trash2 className="h-4 w-4 text-rose-600" />
              </Button>
            </div>

            {isObjectArray ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(subfields ?? []).map((subfield) => (
                  <NestedFieldRenderer
                    key={subfield.name}
                    field={subfield}
                    fieldPath={`${name}.${index}.${subfield.name}`}
                  />
                ))}
              </div>
            ) : (
              <Controller
                control={control}
                name={`${name}.${index}`}
                render={({ field }) => <Input {...field} placeholder={`${itemLabel} ${index + 1}`} />}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
