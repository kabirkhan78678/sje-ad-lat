import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type KeyValueRepeaterProps = {
  name: string;
  label: string;
};

export const KeyValueRepeater = ({ label, name }: KeyValueRepeaterProps) => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="panel-subtle space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">Add as many attribute rows as you need.</p>
        </div>
        <Button
          onClick={() => append({ key: '', value: '' })}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add row
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No attributes added yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
          >
            <Input placeholder="Key" {...register(`${name}.${index}.key`)} />
            <Input placeholder="Value" {...register(`${name}.${index}.value`)} />
            <Button onClick={() => remove(index)} size="sm" type="button" variant="ghost">
              <Trash2 className="h-4 w-4 text-rose-600" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
