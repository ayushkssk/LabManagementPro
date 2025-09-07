import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useHospitals } from '@/context/HospitalContext';

interface HospitalFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

const NewHospital = () => {
  const { user } = useAuth();
  const { addHospital } = useHospitals();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to perform this action',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add the new hospital to the context
      const newHospital = addHospital({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: 'active',
        logo: '',
        admin: {
          id: `user-${Math.random().toString(36).substr(2, 9)}`,
          name: formData.adminName,
          email: formData.adminEmail,
          role: 'admin'
        }
      });

      console.log('New hospital created:', newHospital);

      toast({
        title: 'Success',
        description: 'Hospital created successfully',
      });
      
      // Redirect to hospitals list
      navigate('/super-admin/hospitals');
    } catch (error) {
      console.error('Error creating hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to create hospital. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Add New Hospital</h1>
        <p className="text-muted-foreground">Register a new hospital in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
          <CardDescription>Enter the hospital's details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Hospital Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter hospital email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminName">Admin Name *</Label>
                <Input
                  id="adminName"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="Enter admin's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="Enter admin's email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Temporary Password *</Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="Set a temporary password"
                  required
                />
                <p className="text-xs text-muted-foreground">Admin will be prompted to change this on first login</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/super-admin/hospitals')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Hospital'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewHospital;
