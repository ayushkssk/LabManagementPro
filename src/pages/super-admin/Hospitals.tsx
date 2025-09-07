import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual API call
const mockHospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    email: 'contact@citygeneral.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Center Drive, New York, NY 10001',
    status: 'active',
    logo: '/placeholder-hospital-1.jpg',
    registrationDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Sunshine Medical Center',
    email: 'info@sunshinemed.com',
    phone: '+1 (555) 987-6543',
    address: '456 Health Avenue, Los Angeles, CA 90001',
    status: 'active',
    logo: '/placeholder-hospital-2.jpg',
    registrationDate: '2023-02-20',
  },
  // Add more hospitals as needed
];

const Hospitals = () => {
  return (
    <div className="w-full max-w-full pl-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registered Hospitals</h1>
          <p className="text-muted-foreground text-sm">Manage all registered hospitals in the system</p>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockHospitals.map((hospital) => (
          <Card key={hospital.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={hospital.logo} alt={hospital.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {hospital.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <CardTitle className="text-base">{hospital.name}</CardTitle>
                <CardDescription className="flex items-center flex-wrap gap-1">
                  <Badge variant={hospital.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-4">
                    {hospital.status}
                  </Badge>
                  <span className="text-xs">{new Date(hospital.registrationDate).toLocaleDateString()}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5 h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V7.5L17.5 2H6a2 2 0 0 0-2 2v4" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  {hospital.email}
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5 h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {hospital.phone}
                </div>
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5 h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-ellipsis line-clamp-2">{hospital.address}</span>
                </div>
              </div>
              <div className="mt-3 flex justify-end space-x-1.5">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  View
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                  Deactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Hospitals;
