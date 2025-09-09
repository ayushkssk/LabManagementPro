import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface TestParameter {
  id: string;
  name: string;
  unit: string;
  normalRange: string;
  value?: string;
  notes?: string;
}

interface TestParameterTableProps {
  parameters: Record<string, TestParameter>;
  onParameterChange: (id: string, field: string, value: string | boolean) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export const TestParameterTable: React.FC<TestParameterTableProps> = ({
  parameters,
  onParameterChange,
  onNotesChange,
}) => {
  const params = Object.values(parameters);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parameter</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Normal Range</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {params.map((param) => (
            <TableRow key={param.id}>
              <TableCell className="font-medium">{param.name}</TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={param.value || ''}
                  onChange={(e) => onParameterChange(param.id, 'value', e.target.value)}
                  className="w-24"
                />
              </TableCell>
              <TableCell>{param.unit}</TableCell>
              <TableCell>{param.normalRange}</TableCell>
              <TableCell>
                <Textarea
                  value={param.notes || ''}
                  onChange={(e) => onNotesChange(param.id, e.target.value)}
                  placeholder="Notes"
                  className="min-h-[60px] w-full"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestParameterTable;
