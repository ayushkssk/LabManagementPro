import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with actual API call
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    hospital: 'City General Hospital',
    status: 'active',
    lastLogin: '2023-09-07T10:30:00Z',
    avatar: '',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'doctor',
    hospital: 'Sunshine Medical Center',
    status: 'active',
    lastLogin: '2023-09-06T15:45:00Z',
    avatar: '',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    role: 'lab_technician',
    hospital: 'City General Hospital',
    status: 'inactive',
    lastLogin: '2023-09-01T09:15:00Z',
    avatar: '',
  },
  // Add more users as needed
];

const Users = () => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'doctor':
        return 'secondary';
      case 'lab_technician':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full max-w-full pl-6 pt-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Users</h1>
          <p className="text-muted-foreground text-sm">Manage all users in the system</p>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <CardTitle className="text-base">{user.name}</CardTitle>
                <CardDescription className="flex items-center flex-wrap gap-1">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] h-4">
                    {formatRole(user.role)}
                  </Badge>
                  <Badge 
                    variant={user.status === 'active' ? 'default' : 'secondary'} 
                    className="text-[10px] h-4"
                  >
                    {user.status}
                  </Badge>
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
                  {user.email}
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {user.hospital}
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Last login: {new Date(user.lastLogin).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Users;
