import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  TestTube,
  Loader2
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
  
  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      description: 'All patients',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Patients',
      value: activePatients,
      icon: CheckCircle,
      description: 'Active status',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Pending Reports',
      value: pendingReports,
      icon: Clock,
      description: 'In progress',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Overdue',
      value: overduePatients,
      icon: AlertCircle,
      description: 'Needs attention',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

  const urgentPatients = patients.filter(p => p.status === 'overdue').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lab Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage patient tests and reports efficiently
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => navigate('/lab/patients')}
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Patient List
          </Button>
          <Button 
            onClick={() => navigate('/lab/register')}
            className="bg-gradient-medical hover:opacity-90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            New Patient
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

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              <span>Pending Reports</span>
            </CardTitle>
            <CardDescription>Tests awaiting result entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentPatients.length > 0 ? (
              <>
                {urgentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5">
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Age: {patient.age}, {patient.city}
                      </p>
                      <p className="text-xs text-warning font-medium">
                        Status: {patient.status}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-warning text-warning hover:bg-warning/10"
                      onClick={() => navigate(`/lab/patients/${patient.id}`)}
                    >
                      <TestTube className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/lab/patients')}
                >
                  View All Pending
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                <p>All reports completed!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Today's Activity</span>
            </CardTitle>
            <CardDescription>Daily patient summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Patients Registered</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-primary">{todaysPatients}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Reports Completed</p>
                    <p className="text-sm text-muted-foreground">Active patients</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-success">{completedReports}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Revenue Generated</p>
                    <p className="text-sm text-muted-foreground">Total balance</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-accent">
                  ₹{revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Common lab technician tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2 hover:bg-primary/5 hover:border-primary/30"
              onClick={() => navigate('/lab/register')}
            >
              <UserPlus className="w-8 h-8 text-primary" />
              <span className="font-medium">Register Patient</span>
              <span className="text-xs text-muted-foreground">New patient entry</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2 hover:bg-warning/5 hover:border-warning/30"
              onClick={() => navigate('/lab/patients')}
            >
              <TestTube className="w-8 h-8 text-warning" />
              <span className="font-medium">Enter Results</span>
              <span className="text-xs text-muted-foreground">Complete pending tests</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-6 h-auto flex flex-col space-y-2 hover:bg-success/5 hover:border-success/30"
              onClick={() => navigate('/lab/patients')}
            >
              <CheckCircle className="w-8 h-8 text-success" />
              <span className="font-medium">Print Reports</span>
              <span className="text-xs text-muted-foreground">Generate documents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabDashboard;