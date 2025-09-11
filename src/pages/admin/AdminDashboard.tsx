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
  BarChart3,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatients } from '@/services/patientService';
import { getTests } from '@/services/testService';
import { PatientData } from '@/services/patientService';
import { TestData } from '@/services/testService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: { value: '+8%', up: true }
    },
    {
      title: 'Available Tests',
      value: tests.length,
      icon: TestTube,
      description: 'Test types',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: { value: '+3%', up: true }
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total earnings',
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: { value: '+12%', up: true }
    },
    {
      title: 'Reports Pending',
      value: pendingReports,
      icon: Activity,
      description: 'Awaiting results',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: { value: '-5%', up: false }
    }
  ];

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
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent" />
        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back. Manage your laboratory operations seamlessly.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/admin/profile')} variant="outline" className="group">
                <Hospital className="w-4 h-4 mr-2" />
                Hospital Profile
              </Button>
              <Button onClick={() => navigate('/admin/tests')} className="bg-gradient-medical hover:opacity-90 group">
                <TestTube className="w-4 h-4 mr-2" />
                Manage Tests
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    {stat.trend && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stat.trend.up ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'}`}>
                        {stat.trend.up ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                        {stat.trend.value}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {/* Mini chart placeholder */}
              <div className="mt-4 h-10 w-full rounded-md bg-gradient-to-r from-muted to-muted/40 grid grid-cols-12 overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`m-1 rounded bg-foreground/10 ${i % 3 === 0 ? 'h-6' : i % 2 === 0 ? 'h-8' : 'h-4'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Performance Overview</CardTitle>
            <CardDescription>Weekly patients, revenue and test throughput</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-lg border bg-muted/30 flex items-end gap-2 p-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`flex-1 rounded-t-md bg-primary/50 ${i % 4 === 0 ? 'h-3/4' : i % 3 === 0 ? 'h-2/3' : i % 2 === 0 ? 'h-1/2' : 'h-2/5'}`} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> System Health</CardTitle>
            <CardDescription>Uptime and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-xs text-muted-foreground">99.98% in last 30 days</p>
                </div>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">2 pending actions</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2"
              onClick={() => navigate('/lab/register')}
            >
              <UserPlus className="w-12 h-12 text-primary" />
              <span className="text-lg font-semibold">Register Patient</span>
              <span className="text-sm text-muted-foreground">New patient entry</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2"
              onClick={() => navigate('/admin/tests')}
            >
              <TestTube className="w-12 h-12 text-accent" />
              <span className="text-lg font-semibold">Add New Test</span>
              <span className="text-sm text-muted-foreground">Create test templates</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="w-12 h-12 text-muted-foreground" />
              <span className="text-lg font-semibold">System Settings</span>
              <span className="text-sm text-muted-foreground">Configure preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Recent Patients</span>
            </CardTitle>
            <CardDescription>Latest patient registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPatients.length > 0 ? (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {patient.name?.charAt(0) ?? 'P'}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.age} • {patient.gender}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/lab/patients/${patient.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No patients found</p>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/lab/patients')}
            >
              View All Patients
            </Button>
          </CardContent>
        </Card>

        {/* Hospital Overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hospital className="w-5 h-5 text-primary" />
              <span>Hospital Overview</span>
            </CardTitle>
            <CardDescription>Your hospital information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Hospital className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Lab Management System</h3>
                <p className="text-sm text-muted-foreground">Manage your laboratory operations</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Tests:</span>
                <span className="text-foreground font-medium">{tests.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Patients:</span>
                <span className="text-foreground font-medium">{activePatients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overdue Follow-ups:</span>
                <span className="text-foreground font-medium">{overduePatients}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/admin/profile')}
            >
              Edit Hospital Profile
            </Button>
          </CardContent>
        </Card>
      </div>

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