import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Filter, SortAsc, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'name' | 'price'>('name');
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  
  const { data: tests = [], isLoading } = useQuery<Test[]>({
    queryKey: ['tests'],
    queryFn: getTests as any,
  });

  // Debounce search for smoother typing
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    tests.forEach(t => t.category && set.add(t.category));
    return ['all', ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
  }, [tests]);

  const processedTests = React.useMemo(() => {
    const query = debouncedQuery.toLowerCase();
    let list = tests.slice();
    // filter by search
    if (query) {
      list = list.filter(test => {
        const testCode = test.code || `TEST-${test.id.slice(-4).toUpperCase()}`;
        return (
          test.name.toLowerCase().includes(query) ||
          testCode.toLowerCase().includes(query) ||
          test.category.toLowerCase().includes(query) ||
          test.fields?.some(field => field.name.toLowerCase().includes(query))
        );
      });
    }
    // filter by category
    if (selectedCategory !== 'all') {
      list = list.filter(t => t.category === selectedCategory);
    }
    // sort
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * dir;
      }
      return ((a.price || 0) - (b.price || 0)) * dir;
    });
    return list;
  }, [tests, debouncedQuery, selectedCategory, sortBy, sortDir]);

  const total = processedTests.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedTests = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTests.slice(start, start + pageSize);
  }, [processedTests, currentPage, pageSize]);

  React.useEffect(() => {
    // reset page when filters change
    setPage(1);
  }, [debouncedQuery, selectedCategory, sortBy, sortDir, pageSize]);

  const handleExport = async () => {
    try {
      // Lazy-load xlsx to keep initial bundle small
      const mod = await import('xlsx');
      const XLSX: any = (mod as any).default || mod;

      // Flatten rows: one row per parameter; first row per test includes Test info
      const rows: any[] = [];
      processedTests.forEach((t) => {
        const fields = t.fields || [];
        if (fields.length === 0) {
          rows.push({
            'Test Code': t.code || `TEST-${t.id.slice(-4).toUpperCase()}`,
            'Test Name': t.name,
            Category: t.category,
            Parameter: '',
            Unit: '',
            'Normal Range': '',
            Price: t.price,
          });
          return;
        }
        fields.forEach((f, idx) => {
          rows.push({
            'Test Code': idx === 0 ? (t.code || `TEST-${t.id.slice(-4).toUpperCase()}`) : '',
            'Test Name': idx === 0 ? t.name : '',
            Category: idx === 0 ? t.category : '',
            Parameter: f.name,
            Unit: (f as any).unit || '',
            'Normal Range': (f as any).normalRange || '',
            Price: idx === 0 ? t.price : '',
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tests');
      XLSX.writeFile(wb, 'laboratory_tests.xlsx');
    } catch (err) {
      // no-op: if xlsx missing, fail silently here or show alert
      console.error('Export failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading tests...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background">
      <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 space-y-4 overflow-hidden">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Laboratory Tests</h1>
            <Button variant="default" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={selectedCategory}
                onChange={(e)=>setSelectedCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {sortDir === 'asc' ? <SortAsc className="h-4 w-4 text-muted-foreground" /> : <SortDesc className="h-4 w-4 text-muted-foreground" />}
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={sortBy}
                onChange={(e)=>setSortBy(e.target.value as 'name'|'price')}
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
              <Button variant="outline" onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')} size="sm">
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows</span>
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={pageSize}
                onChange={(e)=>setPageSize(parseInt(e.target.value) || 10)}
              >
                {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-1 overflow-auto">
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead>Test Code</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Parameters</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTests.length > 0 ? (
                    pagedTests.map((test) => (
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
                      <TableCell colSpan={5} className="h-24 text-center">
                        {debouncedQuery || selectedCategory !== 'all' ? 'No tests found matching your filters.' : 'No tests available.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden p-3 space-y-2">
              {pagedTests.length > 0 ? (
                pagedTests.map(test => (
                  <div key={test.id} className="rounded border p-3 bg-card shadow-sm" onClick={() => navigate(`/tests/${test.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{test.name}</div>
                      <div className="text-sm font-mono text-muted-foreground">{test.code || `TEST-${test.id.slice(-4).toUpperCase()}`}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{test.description || 'No description'}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{test.category}</span>
                      <span className="text-right text-sm font-medium">₹{test.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {test.fields?.slice(0, 3).map(f => (
                        <span key={f.id} className="text-xs px-2 py-0.5 bg-muted rounded">{f.name}</span>
                      ))}
                      {test.fields && test.fields.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{test.fields.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  {debouncedQuery || selectedCategory !== 'all' ? 'No tests found matching your filters.' : 'No tests available.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pagination controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">Showing {(currentPage-1)*pageSize + 1}-{Math.min(currentPage*pageSize, total)} of {total}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <div className="text-sm">Page {currentPage} / {totalPages}</div>
            <Button variant="outline" size="sm" disabled={currentPage>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestsList;
