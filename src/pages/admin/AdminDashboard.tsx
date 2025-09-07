import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Hospital, 
  TestTube, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Activity,
  UserPlus,
  Settings,
  Loader2
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

  // Calculate statistics
  const pendingReports = patients.filter(p => p.status === 'inactive').length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const overduePatients = patients.filter(p => p.status === 'overdue').length;
  const totalRevenue = patients.reduce((sum, patient) => sum + (patient.balance || 0), 0);
  const recentPatients = [...patients].sort((a, b) => 
    new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
  ).slice(0, 3);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      description: 'Registered patients',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Available Tests',
      value: tests.length,
      icon: TestTube,
      description: 'Test types',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total earnings',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Reports Pending',
      value: pendingReports,
      icon: Activity,
      description: 'Awaiting results',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, manage your hospital lab operations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => navigate('/admin/profile')}
            variant="outline"
          >
            <Hospital className="w-4 h-4 mr-2" />
            Hospital Profile
          </Button>
          <Button 
            onClick={() => navigate('/admin/tests')}
            className="bg-gradient-medical hover:opacity-90"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Manage Tests
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elevated transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} • {patient.gender}
                    </p>
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

    </div>
  );
};

export default AdminDashboard;