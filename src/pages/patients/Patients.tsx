import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Download, MoreHorizontal, Loader2, TestTube2, Droplets } from 'lucide-react';
import { getTests } from '@/services/testService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getPatients, type PatientData, searchPatients } from '@/services/patientService';
import { toast } from '@/hooks/use-toast';

type Test = string | {
  id: string;
  name: string;
  code?: string;
  price?: number;
};

interface TestReferenceObject {
  id: string;
  name?: string;
  code?: string;
}

interface TestReferenceObject {
  id: string;
  name?: string;
  code?: string;
}

type TestReference = string | TestReferenceObject;

type Patient = PatientData & {
  tests?: TestReference[];
};

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Record<string, { id: string; name: string; code?: string; price?: number }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        // Fetch patients and tests in parallel
        const [patientsData, testsData] = await Promise.all([
          getPatients(),
          getTests()
        ]) as [PatientData[], any[]];

        // Create a map of test IDs to test details
        const testsMap = testsData.reduce<Record<string, { id: string; name: string; code?: string; price?: number }>>((acc, test) => {
          if (test?.id) {
            acc[test.id] = { 
              id: test.id, 
              name: test.name || 'Unnamed Test', 
              code: test.code,
              price: test.price
            };
          }
          return acc;
        }, {});

        console.log('Tests data from database:', testsData);
        console.log('Processed tests map:', testsMap);
        setPatients(patientsData);
        setTests(testsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patients. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  // Sort patients by registration date (newest first) and then by hospital ID
  const sortedPatients = [...patients].sort((a, b) => {
    // First sort by registration date (newest first)
    const dateDiff = new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    
    // If same date, sort by hospital ID
    const idA = a.hospitalId || a.id || '';
    const idB = b.hospitalId || b.id || '';
    return idA.localeCompare(idB);
  });

  const filteredPatients = sortedPatients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    const patientId = patient.hospitalId || patient.id || '';
    
    // Check if patient matches search query
    const matchesSearch = (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchQuery) ||
      patientId.toLowerCase().includes(searchLower)
    );
    
    // If no date range is selected, only filter by search
    if (!dateRange?.from || !dateRange?.to) return matchesSearch;
    
    // Check if patient's registration date is within the selected date range
    const visitDate = new Date(patient.registrationDate).getTime();
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    
    const isInDateRange = visitDate >= fromDate.getTime() && visitDate <= toDate.getTime();
    
    return matchesSearch && isInDateRange;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      case 'overdue':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Overdue</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading patients...</span>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Patients Records</h1>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full md:w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                    <Filter className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            <div className="rounded-md border flex-1 flex flex-col overflow-hidden">
              <div className="overflow-auto">
                <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-mono font-medium">
                          <div className="flex flex-col">
                            {patient.hospitalId && <span className="text-foreground">{patient.hospitalId}</span>}
                            {!patient.hospitalId && patient.id && (
                              <span className="text-muted-foreground text-xs">{patient.id}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="space-y-1">
                          <div className="font-medium">{patient.name}</div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{patient.age} yrs</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                          </div>
                        </TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell className="space-y-1">
                          <div>{format(patient.registrationDate, 'dd MMM yyyy')}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(patient.registrationDate, 'hh:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.tests?.length ? (
                            <div className="flex flex-col gap-1 max-w-[250px]">
                              <div className="flex items-center gap-2">
                                <TestTube2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium">{patient.tests.length} Tests</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {patient.tests.map((testRef: TestReference, i: number) => {
                                  // Handle both string (test ID) and object test references
                                  const testId = typeof testRef === 'string' ? testRef : testRef.id;
                                  const test = tests[testId];
                                  
                                  // Get name and code from testRef if it's an object, otherwise use test data or fallback
                                  const displayName = (typeof testRef === 'object' && testRef.name) 
                                    ? testRef.name 
                                    : test?.name || `Test ${i + 1}`;
                                  
                                  const displayCode = (typeof testRef === 'object' && testRef.code) 
                                    ? testRef.code 
                                    : test?.code || `T${testId.substring(0, 4).toUpperCase()}`;
                                  return (
                                    <div key={i} className="group relative">
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs font-mono py-1 px-1.5 h-auto hover:bg-secondary/80 transition-colors"
                                      >
                                        <span className="font-semibold">{displayCode}</span>
                                      </Badge>
                                      <div className="absolute z-50 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-lg border max-w-[200px] break-words">
                                        <div className="font-semibold">{displayName}</div>
                                        {test?.code && <div className="text-muted-foreground">Code: {test.code}</div>}
                                        {test?.price !== undefined && (
                                          <div className="mt-1 text-green-600">
                                            ₹{test?.price.toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No tests assigned</span>
                          )}
                        </TableCell>
                        <TableCell>{format(patient.lastVisit, 'dd MMM yyyy')}</TableCell>
                        <TableCell className={`text-right font-medium ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(patient.balance)}
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(`/lab/sample-collection/${patient.id}`)}
                              title="Collect Sample"
                            >
                              <Droplets className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No patients found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                </Table>
              </div>
              
              <div className="border-t p-2 bg-background">
                <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{filteredPatients.length}</strong> of <strong>{patients.length}</strong> patients
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Patients;
