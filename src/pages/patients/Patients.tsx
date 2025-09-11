import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Search, Filter, Download, MoreHorizontal, Loader2, TestTube2, Droplets,
  Eye, Edit, Trash2, Printer, Users, Calendar as CalendarIcon, X, RefreshCw
} from 'lucide-react';
import { getTests } from '@/services/testService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  getPatients, 
  type PatientData, 
  searchPatients, 
  bulkSoftDeletePatients, 
  bulkDeletePatients, 
  bulkRestorePatients,
  getDeletedPatients 
} from '@/services/patientService';
import { toast } from '@/hooks/use-toast';
import { DeletePatientsModal } from '@/components/patients/DeletePatientsModal';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Record<string, { id: string; name: string; code?: string; price?: number }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        // Fetch patients and tests in parallel
        const [patientsData, testsData] = await Promise.all([
          getPatients(showDeleted),
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
  }, [showDeleted]);

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
    
    // Check status filter
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    // If no date range is selected, only filter by search and status
    if (!dateRange?.from || !dateRange?.to) return matchesSearch && matchesStatus;
    
    // Check if patient's registration date is within the selected date range
    const visitDate = new Date(patient.registrationDate).getTime();
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59, 999);
    
    const isInDateRange = visitDate >= fromDate.getTime() && visitDate <= toDate.getTime();
    
    return matchesSearch && matchesStatus && isInDateRange;
  });

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(new Set(filteredPatients.map(p => p.id)));
    } else {
      setSelectedPatients(new Set());
    }
  };

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    const newSelected = new Set(selectedPatients);
    if (checked) {
      newSelected.add(patientId);
    } else {
      newSelected.delete(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange(undefined);
    setStatusFilter('all');
  };

  // Delete handlers
  const handleSoftDelete = async (patientIds: string[]) => {
    try {
      await bulkSoftDeletePatients(patientIds, user?.name || user?.email);
      setSelectedPatients(new Set());
      
      // Refresh patients list
      const [patientsData] = await Promise.all([getPatients(showDeleted)]);
      setPatients(patientsData);
      
      toast({
        title: 'Success',
        description: `${patientIds.length} patient${patientIds.length !== 1 ? 's' : ''} archived successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive patients. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async (patientIds: string[]) => {
    try {
      await bulkDeletePatients(patientIds);
      setSelectedPatients(new Set());
      
      // Refresh patients list
      const [patientsData] = await Promise.all([getPatients(showDeleted)]);
      setPatients(patientsData);
      
      toast({
        title: 'Success',
        description: `${patientIds.length} patient${patientIds.length !== 1 ? 's' : ''} permanently deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete patients. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async (patientIds: string[]) => {
    try {
      await bulkRestorePatients(patientIds);
      setSelectedPatients(new Set());
      
      // Refresh patients list
      const [patientsData] = await Promise.all([getPatients(showDeleted)]);
      setPatients(patientsData);
      
      toast({
        title: 'Success',
        description: `${patientIds.length} patient${patientIds.length !== 1 ? 's' : ''} restored successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore patients. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getSelectedPatientsData = () => {
    return Array.from(selectedPatients).map(id => {
      const patient = patients.find(p => p.id === id);
      return {
        id,
        name: patient?.name || 'Unknown',
        hospitalId: patient?.hospitalId,
        isDeleted: patient?.isDeleted || false
      };
    });
  };

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
    <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex-1 min-h-0 flex flex-col p-6 space-y-6 overflow-hidden">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Patient Records</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage and view all patient information</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedPatients.size > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {selectedPatients.size} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatients(new Set())}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => navigate('/lab/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </div>
        </div>

        {/* Modern Filter Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by name, phone, or ID..."
                    className="pl-10 h-11 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant={showDeleted ? "default" : "outline"}
                    onClick={() => setShowDeleted(!showDeleted)}
                    className="h-11 px-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    {showDeleted ? "Show Active" : "Show Deleted"}
                  </Button>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none shadow-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 px-4 rounded-xl border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all",
                          !dateRange && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM dd, y")
                          )
                        ) : (
                          <span>Date Range</span>
                        )}
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
              </div>
              
              <div className="flex items-center space-x-2">
                {(searchQuery || dateRange || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-11 px-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="h-11 px-4 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredPatients.length}</span> of <span className="font-semibold">{patients.length}</span> patients
                  </span>
                </div>
              </div>
              {selectedPatients.size > 0 && (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Printer className="w-3 h-3 mr-1" />
                    Print Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-red-600 hover:text-red-700"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Manage Selected
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Modern Table Card */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-0 bg-white dark:bg-slate-800">
          
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="overflow-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                <Table className="min-w-full">
                  <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-700 z-10">
                    <TableRow className="border-b border-slate-200 dark:border-slate-600">
                      <TableHead className="w-12 pl-6">
                        <Checkbox
                          checked={selectedPatients.size === filteredPatients.length && filteredPatients.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-slate-300"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Patient ID</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Phone</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Registration Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Test Names</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Last Visit</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Balance</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <TableRow 
                          key={patient.id}
                          className={cn(
                            "group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700",
                            selectedPatients.has(patient.id) && "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          )}
                        >
                          <TableCell className="pl-6">
                            <Checkbox
                              checked={selectedPatients.has(patient.id)}
                              onCheckedChange={(checked) => handleSelectPatient(patient.id, checked as boolean)}
                              className="border-slate-300"
                            />
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            <div className="flex flex-col">
                              {patient.hospitalId && <span className="text-slate-800 dark:text-slate-200">{patient.hospitalId}</span>}
                              {!patient.hospitalId && patient.id && (
                                <span className="text-slate-500 dark:text-slate-400 text-xs">{patient.id}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="space-y-1">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{patient.name}</div>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                              <span>{patient.age} yrs</span>
                              <span>•</span>
                              <span className="capitalize">{patient.gender}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">{patient.phone}</TableCell>
                          <TableCell className="space-y-1">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">{format(patient.registrationDate, 'dd MMM yyyy')}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {format(patient.registrationDate, 'hh:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.tests?.length ? (
                              <div className="flex flex-wrap gap-2 max-w-[400px]">
                                {patient.tests.map((testRef: TestReference, i: number) => {
                                  const testId = typeof testRef === 'string' ? testRef : testRef.id;
                                  const test = tests[testId];
                                  const displayName = (typeof testRef === 'object' && testRef.name) 
                                    ? testRef.name 
                                    : test?.name || `Test ${i + 1}`;
                                  
                                  return (
                                    <Badge 
                                      key={i}
                                      variant="secondary" 
                                      className="text-xs py-1 px-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800/50 dark:hover:bg-blue-900/40"
                                    >
                                      {displayName}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">No tests</span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {format(patient.lastVisit, 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-semibold",
                            patient.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          )}>
                            {formatCurrency(patient.balance)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={patient.status === 'active' ? 'default' : 'secondary'}
                              className={cn(
                                "text-xs font-medium",
                                patient.status === 'active' && "bg-green-100 text-green-800 hover:bg-green-200",
                                patient.status === 'inactive' && "bg-gray-100 text-gray-800 hover:bg-gray-200",
                                patient.status === 'overdue' && "bg-red-100 text-red-800 hover:bg-red-200"
                              )}
                            >
                              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/patients/${patient.id}`)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/patients/${patient.id}/edit`)}
                                className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                title="Edit Patient"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/lab/sample-collection/${patient.id}`)}
                                className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                title="Collect Sample"
                              >
                                <Droplets className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                                title="Print Report"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No patients found
                      </TableCell>
                    </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Modern Footer */}
            <div className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredPatients.length}</span> of <span className="font-semibold">{patients.length}</span> patients
                    </span>
                  </div>
                  {selectedPatients.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {selectedPatients.size} selected
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled className="h-9 px-4 rounded-lg">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled className="h-9 px-4 rounded-lg">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer Branding */}
        <div className="text-center py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Developed by <span className="font-semibold text-blue-600 dark:text-blue-400">IT4B.in</span>
          </p>
        </div>
      </div>

      {/* Delete Modal */}
      <DeletePatientsModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedPatients={getSelectedPatientsData()}
        onSoftDelete={handleSoftDelete}
        onPermanentDelete={handlePermanentDelete}
        onRestore={handleRestore}
      />
    </div>
  );
};

export default Patients;
