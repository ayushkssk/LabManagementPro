import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Icons
import { 
  Plus, Search, Filter, Download, MoreHorizontal, Loader2, 
  Calendar as CalendarIcon, User, Phone, Mail, FileText, 
  CheckCircle2, AlertCircle, ChevronRight, ChevronDown, SlidersHorizontal,
  FileText as ReportIcon, Printer, FileEdit, Trash2, Eye
} from 'lucide-react';

// Types
type PatientStatus = 'pending' | 'completed' | 'in_progress' | 'cancelled';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  registrationDate: Date;
  status: PatientStatus;
  tests?: Array<{
    id: string;
    name: string;
    status: 'pending' | 'completed' | 'in_progress';
  }>;
}

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: 'P1001',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    email: 'rahul.sharma@example.com',
    age: 35,
    gender: 'Male',
    registrationDate: new Date(),
    status: 'in_progress',
    tests: [
      { id: 'T001', name: 'Complete Blood Count', status: 'completed' },
      { id: 'T002', name: 'Lipid Profile', status: 'in_progress' }
    ]
  },
  {
    id: 'P1002',
    name: 'Priya Patel',
    phone: '+91 8765432109',
    email: 'priya.patel@example.com',
    age: 28,
    gender: 'Female',
    registrationDate: subDays(new Date(), 1),
    status: 'completed',
    tests: [
      { id: 'T003', name: 'Thyroid Profile', status: 'completed' }
    ]
  },
  {
    id: 'P1003',
    name: 'Amit Kumar',
    phone: '+91 7654321098',
    email: 'amit.kumar@example.com',
    age: 42,
    gender: 'Male',
    registrationDate: subDays(new Date(), 2),
    status: 'pending',
    tests: [
      { id: 'T004', name: 'Liver Function Test', status: 'pending' },
      { id: 'T005', name: 'Kidney Function Test', status: 'pending' }
    ]
  }
];

const statusVariantMap: Record<PatientStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  completed: 'default',
  in_progress: 'secondary',
  cancelled: 'destructive'
};

const statusLabelMap: Record<PatientStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  in_progress: 'In Progress',
  cancelled: 'Cancelled'
};

const PatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API:
        // const data = await getPatients();
        // setPatients(data);
        
        // Using mock data for now
        setTimeout(() => {
          setPatients(mockPatients);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patients. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'today' && isToday(patient.registrationDate)) ||
      patient.status === activeTab;

    // Filter by date range
    let matchesDateRange = true;
    if (dateRange?.from && dateRange?.to) {
      const patientDate = patient.registrationDate.getTime();
      const fromDate = startOfDay(dateRange.from).getTime();
      const toDate = endOfDay(dateRange.to).getTime();
      matchesDateRange = patientDate >= fromDate && patientDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const togglePatientDetails = (patientId: string) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleViewDetails = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleEditPatient = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/patients/edit/${patient.id}`);
  };

  const handlePrintReport = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement print functionality
    console.log('Printing report for:', patient.id);
    // In a real app, you would open a print dialog or navigate to a print view
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
          <span>Loading patients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Records</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all patient information and test results
          </p>
        </div>
        <Button onClick={() => navigate('/lab/patient-registration')} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            
            <div className="flex items-center gap-2">
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
                          {format(dateRange.from, "MMM dd, y")} -{" "}
                          {format(dateRange.to, "MMM dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, y")
                      )
                    ) : (
                      <span>Filter by date</span>
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
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
                  {dateRange?.from && (
                    <div className="p-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setDateRange(undefined)}
                      >
                        Clear filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 px-3">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">Filters</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    Status
                  </div>
                  {Object.entries(statusLabelMap).map(([status, label]) => (
                    <DropdownMenuItem
                      key={status}
                      className="flex items-center gap-2"
                      onClick={() => setActiveTab(status === activeTab ? 'all' : status)}
                    >
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          status === 'completed' ? 'bg-green-500' : '',
                          status === 'in_progress' ? 'bg-blue-500' : '',
                          status === 'pending' ? 'bg-yellow-500' : '',
                          status === 'cancelled' ? 'bg-red-500' : ''
                        )}
                      />
                      <span>{label}</span>
                      {status === activeTab && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
          <TabsTrigger value="all" className="py-2 px-3">All</TabsTrigger>
          <TabsTrigger value="today" className="py-2 px-3">Today</TabsTrigger>
          <TabsTrigger value="in_progress" className="py-2 px-3">In Progress</TabsTrigger>
          <TabsTrigger value="completed" className="py-2 px-3">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No patients found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery || dateRange || activeTab !== 'all'
                  ? 'No patients match your current filters. Try adjusting your search or filters.'
                  : 'No patients have been added yet. Get started by adding a new patient.'}
              </p>
              {!searchQuery && !dateRange && activeTab === 'all' && (
                <Button className="mt-4" onClick={() => navigate('/lab/patient-registration')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className="overflow-hidden transition-all hover:shadow-md"
              onClick={() => togglePatientDetails(patient.id)}
            >
              <div className="p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{patient.name}</h3>
                        <Badge variant={statusVariantMap[patient.status]} className="text-xs">
                          {statusLabelMap[patient.status]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {patient.id} • {patient.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="hidden md:block text-sm text-muted-foreground">
                      {format(patient.registrationDate, 'MMM d, yyyy')}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePatientDetails(patient.id);
                      }}
                    >
                      <ChevronRight 
                        className={cn(
                          'h-4 w-4 transition-transform',
                          expandedPatient === patient.id ? 'rotate-90' : ''
                        )} 
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPatient === patient.id && (
                <div className="border-t bg-muted/20">
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Patient Details</h4>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>{patient.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>{patient.phone}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>Registered on {format(patient.registrationDate, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Tests</h4>
                        <div className="space-y-2">
                          {patient.tests?.map((test) => (
                            <div key={test.id} className="flex items-center justify-between text-sm">
                              <span>{test.name}</span>
                              <Badge 
                                variant={test.status === 'completed' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {test.status === 'completed' ? 'Completed' : 
                                 test.status === 'in_progress' ? 'In Progress' : 'Pending'}
                              </Badge>
                            </div>
                          )) || (
                            <p className="text-sm text-muted-foreground">No tests assigned</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full md:w-auto justify-start"
                              onClick={(e) => handleViewDetails(patient)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full md:w-auto justify-start"
                              onClick={(e) => handleEditPatient(patient, e)}
                            >
                              <FileEdit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full md:w-auto justify-start"
                              onClick={(e) => handlePrintReport(patient, e)}
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Print Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
