import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Activity,
  TestTube,
  Bell,
  Search,
  FileText,
  Receipt,
  LayoutGrid,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '@/services/patientService';
import { PatientData } from '@/services/patientService';

const LabDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState(0);
  const [todaysPatients, setTodaysPatients] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsData] = await Promise.all([
          getPatients()
        ]);
        
        setPatients(patientsData);
        
        // Calculate today's patients
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysPatientsCount = patientsData.filter(p => {
          const regDate = new Date(p.registrationDate);
          return regDate >= today;
        }).length;
        setTodaysPatients(todaysPatientsCount);
        
        // Calculate revenue (using balance as a proxy since we don't have bills)
        const totalRevenue = patientsData.reduce((sum, patient) => sum + (patient.balance || 0), 0);
        setRevenue(totalRevenue);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const pendingReports = patients.filter(p => p.status === 'inactive').length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const overduePatients = patients.filter(p => p.status === 'overdue').length;
  const completedReports = activePatients; // Assuming active patients have completed reports

  // Calculate today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Overview stats row
  const stats = [
    {
      title: 'Patients',
      value: patients.length,
      icon: Users,
      description: 'Total registered',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Samples',
      value: activePatients,
      icon: TestTube,
      description: 'Active collections',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Reports',
      value: completedReports,
      icon: FileText,
      description: 'Completed reports',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Revenue',
      value: `₹${revenue.toLocaleString()}`,
      icon: Receipt,
      description: 'Total generated',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  const urgentPatients = patients.filter(p => p.status === 'overdue').slice(0, 5);
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, 5);
  const ongoingCollections = patients.filter(p => p.status === 'active').slice(0, 5);
  const testsInProgress = patients.filter(p => p.status === 'inactive').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="sticky top-0 z-10 rounded-xl border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src="/hospitallogo.png" alt="Logo" className="h-8 w-8 rounded" />
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-xl font-semibold">Lab Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patients, tests..."
                className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="relative rounded-lg border p-2 hover:bg-muted/50 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white grid place-items-center">3</span>
            </button>
            <div className="flex items-center gap-2 rounded-lg border px-2 py-1 hover:bg-muted/50 transition">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 grid place-items-center text-white text-sm font-medium">
                LS
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-smooth overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="p-6 h-auto flex flex-col items-start gap-2 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
          onClick={() => navigate('/lab/register')}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <span className="font-medium">Add Patient</span>
          </div>
          <span className="text-xs text-muted-foreground">Create a new patient record</span>
        </Button>
        <Button
          variant="outline"
          className="p-6 h-auto flex flex-col items-start gap-2 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
          onClick={() => navigate('/lab/patients')}
        >
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-accent" />
            <span className="font-medium">Collect Sample</span>
          </div>
          <span className="text-xs text-muted-foreground">Start or update a collection</span>
        </Button>
        <Button
          variant="outline"
          className="p-6 h-auto flex flex-col items-start gap-2 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
          onClick={() => navigate('/lab/billing')}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-warning" />
            <span className="font-medium">Generate Bill</span>
          </div>
          <span className="text-xs text-muted-foreground">Create invoice for services</span>
        </Button>
        <Button
          variant="outline"
          className="p-6 h-auto flex flex-col items-start gap-2 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
          onClick={() => navigate('/lab/patients')}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-success" />
            <span className="font-medium">View Reports</span>
          </div>
          <span className="text-xs text-muted-foreground">Browse patient reports</span>
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Patients */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Latest registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPatients.length > 0 ? (
                recentPatients.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Age {p.age} • {p.city}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/lab/patients/${p.id}`)}>View</Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent patients.</p>
              )}
            </CardContent>
          </Card>

          {/* Ongoing Collections */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Ongoing Collections</CardTitle>
              <CardDescription>Active samples being collected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ongoingCollections.length > 0 ? (
                ongoingCollections.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-accent/10 grid place-items-center">
                        <TestTube className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">City: {p.city}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/lab/patients/${p.id}`)}>Update</Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No ongoing collections.</p>
              )}
            </CardContent>
          </Card>

          {/* Tests in Progress */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tests in Progress</CardTitle>
              <CardDescription>Awaiting result entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testsInProgress.length > 0 ? (
                testsInProgress.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-warning/10 grid place-items-center">
                        <Clock className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Status: {p.status}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/lab/patients/${p.id}`)}>Enter Result</Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tests in progress.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Latest updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1" />
                <div>
                  <p className="text-sm">System healthy and operational</p>
                  <p className="text-xs text-muted-foreground">Uptime 99.98%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mt-1" />
                <div>
                  <p className="text-sm">{overduePatients} patients overdue</p>
                  <Button size="sm" variant="link" className="px-0" onClick={() => navigate('/lab/patients')}>Review now</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Today&apos;s overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Today</p>
                    <p className="text-xs text-muted-foreground">{today.toDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">Patients</p>
                  <p className="text-xl font-semibold">{todaysPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shortcuts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
              <CardDescription>Quick navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/lab/patients')}>
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Patients</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/lab/register')}>
                  <UserPlus className="w-5 h-5" />
                  <span className="text-xs">Register</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/lab/patients')}>
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/lab/billing')}>
                  <Receipt className="w-5 h-5" />
                  <span className="text-xs">Billing</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/tests')}>
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-xs">Tests</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/settings')}>
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 rounded-xl border bg-card p-4 text-xs text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} LabManager Pro. All rights reserved.</p>
        <p>Version 1.0.0 • Developed by IT4B.in</p>
      </div>
    </div>
  );
};

export default LabDashboard;