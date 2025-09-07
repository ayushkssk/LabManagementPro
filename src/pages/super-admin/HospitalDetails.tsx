import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, User, FileText, CreditCard, Activity } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { demoUsers } from '@/data/demoData';
import { demoPatients } from '@/data/demoData';

interface HospitalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string; // In real app, never expose passwords like this
}

const HospitalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    isDemo: boolean;
  } | null>(null);
  
  const [users, setUsers] = useState<HospitalUser[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch hospital and user data from API
    const fetchData = async () => {
      try {
        console.log('Fetching hospital data for ID:', id);
        console.log('All demo users:', demoUsers);
        
        // Get all users for this hospital
        const hospitalUsers = demoUsers
          .filter(user => {
            console.log(`Checking user ${user.id} with hospitalId:`, user.hospitalId);
            return user.hospitalId === id;
          })
          .map(user => ({
            ...user,
            // In a real app, these would come from the backend
            password: 'demo123', // Default password for demo users
          }));

        console.log('Filtered hospital users:', hospitalUsers);

        if (hospitalUsers.length === 0) {
          console.error('No users found for hospital ID:', id);
          throw new Error('No users found for this hospital');
        }

        setUsers(hospitalUsers);
        
        // Count patients for this hospital (in a real app, this would be an API call)
        // For demo purposes, we'll just show a static number
        setPatientCount(42);

        // Set hospital details
        setHospital({
          id: id || '',
          name: 'Demo Hospital',
          email: hospitalUsers[0]?.email || 'demo@hospital.com',
          phone: '+1 (555) 000-0000',
          address: '123 Demo Street, Demo City, DC 12345',
          isDemo: true
        });

      } catch (error) {
        console.error('Error fetching hospital details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hospital || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">
          {!hospital ? 'Hospital not found' : 'No users found for this hospital'}
        </h2>
        <Button asChild>
          <Link to="/super-admin/hospitals" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hospitals
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/super-admin/hospitals" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hospitals
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {hospital.name}
            {hospital.isDemo && (
              <Badge variant="outline" className="ml-3 bg-yellow-100 text-yellow-800">
                Demo
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage hospital details and user accounts
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter(u => u.role === 'admin').length} admin users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total registered patients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contact</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hospital.phone}</div>
                <p className="text-xs text-muted-foreground">
                  {hospital.email}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Address</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{hospital.address}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Users</CardTitle>
              <CardDescription>
                Manage user accounts for this hospital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{user.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              user.role === 'admin' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">ID:</span> 
                        <span className="ml-1 font-mono text-xs bg-muted px-2 py-1 rounded">
                          {user.id}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium">Password:</span>
                        <span className="ml-1 font-mono text-xs bg-muted px-2 py-1 rounded">
                          {user.password}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalDetails;
