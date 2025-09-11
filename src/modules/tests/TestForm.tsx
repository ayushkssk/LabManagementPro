import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldConfig } from './types';

interface TestFormProps {
  fields: FieldConfig[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

const TestForm: React.FC<TestFormProps> = ({ fields, values, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const commonLabel = (
          <div className="flex items-baseline justify-between">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {('unit' in field) && (field as any).unit && (
              <span className="text-xs text-muted-foreground">Unit: {(field as any).unit}</span>
            )}
          </div>
        );

        const refRange = field.refRange ? (
          <div className="text-xs text-muted-foreground mb-2">
            <span className="font-medium">Ref. Range: </span>
            <span className="whitespace-pre-line">{field.refRange}</span>
          </div>
        ) : null;

        if (field.type === 'select') {
          return (
            <div key={field.id} className="space-y-2">
              {commonLabel}
              {refRange}
              <Select
                value={(values[field.id] ?? (field as any).defaultValue) || ''}
                onValueChange={(value) => onChange(field.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.type === 'number') {
          const f = field as any;
          return (
            <div key={field.id} className="space-y-2">
              {commonLabel}
              {refRange}
              <Input
                id={field.id}
                type="number"
                value={(values[field.id] ?? (field as any).defaultValue) || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                required={field.required}
                min={f.min}
                max={f.max}
                step={f.step}
              />
            </div>
          );
        }

        if (field.type === 'datetime-local') {
          return (
            <div key={field.id} className="space-y-2">
              {commonLabel}
              {refRange}
              <Input
                id={field.id}
                type="datetime-local"
                value={(values[field.id] ?? (field as any).defaultValue) || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                required={field.required}
              />
            </div>
          );
        }

        if ((field as any).type === 'textarea') {
          return (
            <div key={field.id} className="space-y-2 md:col-span-2">
              {commonLabel}
              {refRange}
              <Textarea
                id={field.id}
                value={(values[field.id] ?? (field as any).defaultValue) || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default TestForm;
