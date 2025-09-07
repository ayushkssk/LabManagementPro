import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Plus } from 'lucide-react';
import { getTests } from '@/services/testService';
import { useNavigate } from 'react-router-dom';

interface TestField {
  id: string;
  name: string;
  type: string;
  unit?: string;
  normalRange?: string;
}

interface Test {
  id: string;
  code?: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  fields: TestField[];
}

const TestsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { data: tests = [], isLoading } = useQuery<Test[]>({
    queryKey: ['tests'],
    queryFn: getTests as any,
  });

  const filteredTests = React.useMemo(() => {
    if (!searchQuery) return tests;
    const query = searchQuery.toLowerCase();
    return tests.filter(test => {
      const testCode = test.code || `TEST-${test.id.slice(-4).toUpperCase()}`;
      return (
        test.name.toLowerCase().includes(query) ||
        testCode.toLowerCase().includes(query) ||
        test.category.toLowerCase().includes(query) ||
        test.fields?.some(field => field.name.toLowerCase().includes(query))
      );
    });
  }, [tests, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading tests...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <h1 className="text-2xl font-bold">Laboratory Tests</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Code</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Parameters</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <TableRow 
                      key={test.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/tests/${test.id}`)}
                    >
                      <TableCell className="font-mono text-sm">
                        {test.code || `TEST-${test.id.slice(-4).toUpperCase()}`}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="font-medium">{test.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {test.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                          {test.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {test.fields?.slice(0, 3).map((field) => (
                            <span key={field.id} className="text-xs px-2 py-1 bg-muted rounded">
                              {field.name}
                            </span>
                          ))}
                          {test.fields && test.fields.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{test.fields.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{test.price.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {searchQuery ? 'No tests found matching your search.' : 'No tests available.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestsList;
