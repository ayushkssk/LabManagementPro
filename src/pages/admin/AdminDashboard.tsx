import React from 'react';
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
  Settings
} from 'lucide-react';
import { demoPatients, demoBills, demoTests, demoHospital } from '@/data/demoData';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Patients',
      value: demoPatients.length,
      icon: Users,
      description: 'Registered patients',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Tests',
      value: demoTests.length,
      icon: TestTube,
      description: 'Available test types',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Revenue Today',
      value: `₹${demoBills.reduce((sum, bill) => sum + bill.totalAmount, 0)}`,
      icon: DollarSign,
      description: 'Total earnings',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Reports Pending',
      value: demoPatients.filter(p => p.status === 'Report Pending').length,
      icon: Activity,
      description: 'Awaiting results',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  const recentPatients = demoPatients.slice(0, 3);

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
              <UserPlus className="w-8 h-8 text-primary" />
              <span className="font-medium">Register Patient</span>
              <span className="text-xs text-muted-foreground">New patient entry</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2"
              onClick={() => navigate('/admin/tests')}
            >
              <TestTube className="w-8 h-8 text-accent" />
              <span className="font-medium">Add New Test</span>
              <span className="text-xs text-muted-foreground">Create test templates</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="w-8 h-8 text-muted-foreground" />
              <span className="font-medium">System Settings</span>
              <span className="text-xs text-muted-foreground">Configure preferences</span>
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
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Age: {patient.age}, Dr. {patient.doctor}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'Report Ready' 
                      ? 'bg-success/10 text-success' 
                      : patient.status === 'Report Pending'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-accent/10 text-accent'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
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
              {demoHospital.logo && (
                <img 
                  src={demoHospital.logo} 
                  alt="Hospital Logo" 
                  className="w-16 h-16 rounded-lg object-cover border"
                />
              )}
              <div>
                <h3 className="font-semibold text-foreground">{demoHospital.name}</h3>
                <p className="text-sm text-muted-foreground">{demoHospital.address}</p>
                <p className="text-sm text-muted-foreground">GST: {demoHospital.gst}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Letter Head:</span>
                <span className={demoHospital.letterHeadEnabled ? 'text-success' : 'text-muted-foreground'}>
                  {demoHospital.letterHeadEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Tests:</span>
                <span className="text-foreground font-medium">{demoTests.length}</span>
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