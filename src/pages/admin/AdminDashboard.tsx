import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Hospital,
  TestTube,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  UserPlus,
  Settings,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Clock,
  Bell,
  Search,
  FileText,
  Receipt,
  LayoutGrid,
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '@/services/patientService';
import { getTests } from '@/services/testService';
import { PatientData } from '@/services/patientService';
import { TestData } from '@/services/testService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = window.location.pathname.split('/').filter(Boolean);
  
  // Format the breadcrumb items at the top level
  const breadcrumbItems = useMemo(() => [
    { label: 'Home', path: '/', active: location.length === 0 },
    ...location.map((item, index) => ({
      label: item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, ' '),
      path: `/${location.slice(0, index + 1).join('/')}`,
      active: index === location.length - 1
    }))
  ], [location]);

  const [patients, setPatients] = useState<PatientData[]>([]);
  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState(0);
  const [todaysPatients, setTodaysPatients] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsData, testsData] = await Promise.all([
          getPatients(),
          getTests()
        ]);
        
        setPatients(patientsData);
        setTests(testsData);

        // derive revenue and today's patients
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayCount = patientsData.filter(p => {
          const d = new Date(p.registrationDate);
          return d >= today;
        }).length;
        setTodaysPatients(todayCount);
        const totalRevenue = patientsData.reduce((sum, p) => sum + (p.balance || 0), 0);
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

  // Calculate statistics (memoized for perf)
  const { pendingReports, activePatients, overduePatients, totalRevenue, recentPatients } = useMemo(() => {
    const pr = patients.filter(p => p.status === 'inactive').length;
    const ap = patients.filter(p => p.status === 'active').length;
    const ov = patients.filter(p => p.status === 'overdue').length;
    const rev = patients.reduce((sum, patient) => sum + (patient.balance || 0), 0);
    const rp = [...patients]
      .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
      .slice(0, 5);
    return { pendingReports: pr, activePatients: ap, overduePatients: ov, totalRevenue: rev, recentPatients: rp };
  }, [patients]);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      description: 'Registered patients',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      trend: { value: '+8%', up: true },
      chartData: [30, 40, 35, 50, 49, 60, 70, 91, 125, 110, 130, 150]
    },
    {
      title: 'Active Samples',
      value: activePatients,
      icon: TestTube,
      description: 'In progress',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30',
      trend: { value: '+3%', up: true },
      chartData: [20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 90]
    },
    {
      title: 'Completed Reports',
      value: patients.filter(p => p.status === 'active').length,
      icon: FileText,
      description: 'This month',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      trend: { value: '+12%', up: true },
      chartData: [15, 25, 30, 40, 35, 45, 50, 60, 70, 80, 90, 100]
    },
    {
      title: 'Total Revenue',
      value: `₹${revenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'This month',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-900/30',
      trend: { value: '+5%', up: true },
      chartData: [25, 35, 30, 45, 40, 55, 50, 65, 60, 75, 80, 95]
    }
  ];

  // Lists for main content
  const ongoingCollections = patients.filter(p => p.status === 'active').slice(0, 5);
  const testsInProgress = patients.filter(p => p.status === 'inactive').slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-transparent p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-7 w-48 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-4 w-72 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-36 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-7 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-8">

      {/* Search and Profile */}
      <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-lg border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search patients, tests..." className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
            <button className="relative rounded-lg border p-2 hover:bg-muted/50 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] text-white grid place-items-center">3</span>
            </button>
            <div className="flex items-center gap-2 rounded-lg border px-2 py-1 hover:bg-muted/50 transition">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 grid place-items-center text-white text-sm font-medium">AD</div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const maxValue = Math.max(...stat.chartData);
          const minHeight = 0.5; // Minimum height for bars (0.5rem)
          
          return (
            <Card key={index} className="shadow-card hover:shadow-elevated transition-smooth group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      {stat.trend && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stat.trend.up ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-rose-600 bg-rose-100 dark:bg-rose-900/30'}`}>
                          {stat.trend.up ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                          {stat.trend.value}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{stat.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                
                {/* Enhanced Mini Chart */}
                <div className="mt-4 h-12 w-full">
                  <div className="flex items-end justify-between h-full gap-1">
                    {stat.chartData.map((value, i) => {
                      const height = Math.max((value / maxValue) * 2.5, minHeight);
                      const opacity = 0.2 + (0.8 * (i / (stat.chartData.length - 1)));
                      
                      return (
                        <div 
                          key={i}
                          className={`w-full rounded-t-sm ${stat.color.replace('text-', 'bg-').replace('-600', '-500')} transition-all duration-300 ease-in-out`}
                          style={{
                            height: `${height}rem`,
                            opacity: 0.3 + (0.7 * (i / stat.chartData.length))
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Row - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="p-6 h-auto flex flex-col items-center justify-center gap-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-background to-muted/20 text-center"
          onClick={() => navigate('/lab/register')}
        >
          <div className="p-3 rounded-full bg-primary/10">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Add Patient</h3>
            <p className="text-base text-muted-foreground">Create a new patient record</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="p-6 h-auto flex flex-col items-center justify-center gap-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 border-accent/20 hover:border-accent/40 bg-gradient-to-br from-background to-muted/20 text-center"
          onClick={() => navigate('/patients')}
        >
          <div className="p-3 rounded-full bg-accent/10">
            <TestTube className="w-8 h-8 text-accent" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Collect Sample</h3>
            <p className="text-base text-muted-foreground">Start or update a collection</p>
          </div>
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Patients - Enhanced */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => navigate('/samples')}>
              <div className="text-center mb-4 group">
                <CardTitle className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                  RECENT PATIENTS
                </CardTitle>
                <CardDescription className="text-base font-medium text-muted-foreground group-hover:text-primary/80 transition-colors">
                  Latest Patient Registrations & Updates
                </CardDescription>
              </div>
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:bg-primary/10"
                  onClick={() => navigate('/patients')}
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentPatients.length > 0 ? (
                <div className="divide-y">
                  {recentPatients.map((p, index) => (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/lab/patients/${p.id}`)}
                    >
                      <div className="flex items-center gap-5 w-full">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <span className="text-xl font-bold">{p.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-foreground">{p.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
                            <span className="font-medium">Age: {p.age}</span>
                            <span>•</span>
                            <span className="font-medium capitalize">{p.gender}</span>
                            {p.lastVisit && (
                              <>
                                <span>•</span>
                                <span className="font-medium">Last Visit: {new Date(p.lastVisit).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="h-10 w-10 p-0 hover:bg-muted/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lab/patients/${p.id}`);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No recent patients found</p>
                  <p className="text-sm text-muted-foreground mt-1">New patients will appear here</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/lab/register')}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New Patient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ongoing Collections card removed as requested */}
{/* Tests in Progress card removed as requested */}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendar card removed as requested */}
{/* Shortcuts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Shortcuts</CardTitle>
              <CardDescription>Quick navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/patients')}>
                  <Users className="w-5 h-5" />
                  <span className="text-xs">Patients</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/lab/register')}>
                  <UserPlus className="w-5 h-5" />
                  <span className="text-xs">Register</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/patients')}>
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/tests')}>
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-xs">Tests</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/profile')}>
                  <Hospital className="w-5 h-5" />
                  <span className="text-xs">Profile</span>
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

      {/* Removed bottom Recent Patients and Hospital Overview cards as requested */}

      {/* Floating IT4B badge */}
      <div className="fixed bottom-4 right-4 z-40">
        <a
          href="https://it4b.in"
          target="_blank"
          rel="noreferrer"
          className="shadow-card hover:shadow-elevated transition-smooth inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Developed by <span className="font-semibold text-foreground">IT4B.in</span>
        </a>
      </div>

    </div>
  );
};

export default AdminDashboard;