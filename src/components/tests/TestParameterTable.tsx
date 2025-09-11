import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TestParameter {
  id: string;
  name: string;
  unit: string;
  normalRange: string;
  value?: string;
  group?: string;
  refRange?: string;
  type?: string;
  options?: string[];
}

interface TestParameterTableProps {
  parameters: Record<string, TestParameter>;
  onParameterChange: (id: string, field: string, value: string | boolean) => void;
  className?: string;
  rowHeight?: number;
  headerHeight?: number;
}

export const TestParameterTable: React.FC<TestParameterTableProps> = ({
  parameters,
  onParameterChange,
  className,
  rowHeight = 20,
  headerHeight = 24,
}) => {
  // Check if this is a CBC test by looking for a parameter with 'Erythrocytes' group
  const isCBCTest = Object.values(parameters).some(param => param.group === 'Erythrocytes');

  // Only group parameters if it's a CBC test
  let groupedParams: Record<string, TestParameter[]> = {};
  let sortedGroups: string[] = [];

  if (isCBCTest) {
    // Group parameters by their group name for CBC test
    groupedParams = Object.values(parameters).reduce((acc, param) => {
      const group = param.group || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(param);
      return acc;
    }, {} as Record<string, TestParameter[]>);

    // Define the order of groups for CBC test
    const groupOrder = [
      'Erythrocytes',
      'Platelets',
      'Leucocytes',
      'DIFFERENTIAL LEUCOCYTE COUNT (DLC)',
      'ABSOLUTE COUNT',
      'CELLS',
      'Other'
    ];

    // Sort groups according to the defined order
    sortedGroups = groupOrder.filter(group => groupedParams[group]);
  } else {
    // For non-CBC tests, put all parameters in a single group
    groupedParams['Parameters'] = Object.values(parameters);
    sortedGroups = ['Parameters'];
  }

  return (
    <div className={cn("rounded-sm border border-gray-200 text-[10px] -my-0.5 overflow-hidden flex flex-col h-full", className)}>
      <div className="overflow-auto flex-1">
        <Table className="border-collapse w-full min-w-[600px]">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="h-6">
              <TableHead className="px-3 py-0.5 bg-gray-50 border-r border-gray-200 sticky left-0 z-20 w-[45%] min-w-[200px]">Parameter</TableHead>
              <TableHead className="px-2 py-0.5 bg-gray-50 border-r border-gray-200 w-[10%] text-left">Value</TableHead>
              <TableHead className="px-2 py-0.5 bg-gray-50 border-r border-gray-200 w-[10%] min-w-[60px] text-left">Unit</TableHead>
              <TableHead className="px-2 py-0.5 bg-gray-50 border-r border-gray-200 w-[25%] text-left">Normal Range</TableHead>
              <TableHead className="px-1 py-0.5 bg-gray-50 w-[10%] min-w-[30px] text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {sortedGroups.flatMap((group) => [
              // Main group header - More prominent styling
              <TableRow key={`group-${group}`} className="h-7 bg-gray-100 border-t border-gray-300">
                <TableCell 
                  colSpan={5} 
                  className="px-4 py-1 font-extrabold text-gray-900 uppercase tracking-wide text-sm"
                >
                  {group}
                </TableCell>
            </TableRow>,
            // Group parameters
            ...groupedParams[group].map((param) => (
              <TableRow key={param.id} className="h-7 hover:bg-blue-50 transition-colors group">
                <TableCell className="px-6 py-0.5 border-r border-gray-100 font-medium text-gray-900 truncate w-[50%] sticky left-0 bg-white z-10">
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2 flex-shrink-0"></span>
                    <span className="truncate font-medium" title={param.name}>{param.name}</span>
                  </div>
                </TableCell>
                <TableCell className="p-0.5 border-r border-gray-100">
                  <div className="px-1">
                    {param.type === 'select' && param.options ? (
                      <Select
                        value={param.value || ''}
                        onValueChange={(value) => onParameterChange(param.id, 'value', value)}
                      >
                        <SelectTrigger className="h-5 w-full text-[10px] px-2 py-0 border border-gray-200 rounded-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options.map((option) => (
                            <SelectItem key={option} value={option} className="text-[10px]">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        value={param.value || ''}
                        onChange={(e) => onParameterChange(param.id, 'value', e.target.value)}
                        className="h-5 w-full text-[10px] px-2 py-0 border border-gray-200 rounded-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-0.5 border-r border-gray-100 text-left text-gray-700">{param.unit}</TableCell>
                <TableCell className="px-2 py-0.5 border-r border-gray-100 text-left text-gray-700">
                  {param.normalRange}
                </TableCell>
                <TableCell className="px-1 py-0.5 text-center">
                  {param.value && param.refRange && (
                    <TestResultIndicator value={parseFloat(param.value)} refRange={param.refRange} />
                  )}
                </TableCell>
              </TableRow>
            ))
          ])}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Component to show up/down arrow based on test result
const TestResultIndicator: React.FC<{ value: number; refRange: string }> = ({ value, refRange }) => {
  // Parse reference range (handles different formats like '40-50', 'M: 40-50, F: 36-46', '0.5 - 2.0')
  const parseRange = (range: string): { min: number; max: number } | null => {
    // Try to extract a single range (e.g., '40-50' or '0.5 - 2.0')
    const singleRangeMatch = range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (singleRangeMatch) {
      return {
        min: parseFloat(singleRangeMatch[1]),
        max: parseFloat(singleRangeMatch[2])
      };
    }
    
    // Try to extract male range (e.g., 'M: 40-50, F: 36-46')
    const maleRangeMatch = range.match(/M:\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (maleRangeMatch) {
      return {
        min: parseFloat(maleRangeMatch[1]),
        max: parseFloat(maleRangeMatch[2])
      };
    }
    
    // Try to extract female range if male range not found
    const femaleRangeMatch = range.match(/F:\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (femaleRangeMatch) {
      return {
        min: parseFloat(femaleRangeMatch[1]),
        max: parseFloat(femaleRangeMatch[2])
      };
    }
    
    return null;
  };

  const range = parseRange(refRange);
  if (!range) return null;

  if (value < range.min) {
    return <ArrowDown className="h-3 w-3 text-red-500" />;
  } else if (value > range.max) {
    return <ArrowUp className="h-3 w-3 text-red-500" />;
  }
  
  return <span className="h-3 w-3 text-green-500">✓</span>;
};

export default TestParameterTable;
