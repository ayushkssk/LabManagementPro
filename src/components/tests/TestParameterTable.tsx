import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
  className?: string;
  rowHeight?: number;
  headerHeight?: number;
}

export const TestParameterTable: React.FC<TestParameterTableProps> = ({
  parameters,
  onParameterChange,
  onNotesChange,
  className,
  rowHeight = 20,
  headerHeight = 24,
}) => {
  const params = Object.values(parameters);

  return (
    <div className={cn("rounded-sm border border-gray-200 text-[10px] -my-0.5 overflow-hidden", className)}>
      <Table className="border-collapse w-full">
        <TableHeader>
          <TableRow className="h-6">
            <TableHead className="px-1.5 py-0.5 bg-gray-50 border-r border-gray-200">Parameter</TableHead>
            <TableHead className="px-1.5 py-0.5 bg-gray-50 border-r border-gray-200 w-24">Value</TableHead>
            <TableHead className="px-1.5 py-0.5 bg-gray-50 border-r border-gray-200 w-12">Unit</TableHead>
            <TableHead className="px-1.5 py-0.5 bg-gray-50 border-r border-gray-200 w-24">Normal Range</TableHead>
            <TableHead className="px-1.5 py-0.5 bg-gray-50 w-32">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {params.map((param) => (
            <TableRow key={param.id} className="h-6 hover:bg-gray-50">
              <TableCell className="px-1.5 py-0.5 border-r border-gray-100 font-medium truncate max-w-[120px]">
                <span className="truncate block" title={param.name}>{param.name}</span>
              </TableCell>
              <TableCell className="p-0.5 border-r border-gray-100">
                <Input
                  type="text"
                  value={param.value || ''}
                  onChange={(e) => onParameterChange(param.id, 'value', e.target.value)}
                  className="h-5 w-full text-[10px] px-1.5 py-0 border border-gray-200 rounded-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </TableCell>
              <TableCell className="px-1.5 py-0.5 border-r border-gray-100 text-center">{param.unit}</TableCell>
              <TableCell className="px-1.5 py-0.5 border-r border-gray-100 text-center">{param.normalRange}</TableCell>
              <TableCell className="p-0.5">
                <input
                  value={param.notes || ''}
                  onChange={(e) => onNotesChange(param.id, e.target.value)}
                  placeholder="-"
                  className="w-full h-5 text-[10px] px-1.5 py-0 border border-gray-200 rounded-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
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
