import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useHospitals } from '@/context/HospitalContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const hospitalFormSchema = z.object({
  // Hospital Information
  name: z.string().min(2, {
    message: 'Hospital name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  street: z.string().min(2, {
    message: 'Street address is required.',
  }),
  city: z.string().min(2, {
    message: 'City is required.',
  }),
  state: z.string().min(2, {
    message: 'State is required.',
  }),
  pincode: z.string().min(3, {
    message: 'Pincode is required.',
  }),
  country: z.string().min(2, {
    message: 'Country is required.',
  }),
  website: z.string().url().or(z.literal('')).optional(),
  gst: z.string().optional(),
  registration: z.string().optional(),
  tagline: z.string().optional(),
  footerNote: z.string().optional(),
  
  // Display Settings
  primaryColor: z.string().default('#3b82f6'),
  fontFamily: z.string().default('Arial, sans-serif'),
  headerStyle: z.enum(['centered', 'left', 'withSideLogo']).default('centered'),
  showLogo: z.boolean().default(true),
  showTagline: z.boolean().default(true),
  showGst: z.boolean().default(true),
  
  // Admin Account
  adminName: z.string().min(2, {
    message: 'Admin name must be at least 2 characters.',
  }),
  adminEmail: z.string().email({
    message: 'Please enter a valid admin email address.',
  }),
  adminPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  letterHeadEnabled: z.boolean().default(false),
});

type HospitalFormValues = z.infer<typeof hospitalFormSchema>;

const NewHospital = () => {
  const { user } = useAuth();
  const { addHospital } = useHospitals();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      website: '',
      gst: '',
      registration: '',
      tagline: '',
      footerNote: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      primaryColor: '#3b82f6',
      fontFamily: 'Arial, sans-serif',
      headerStyle: 'centered',
      showLogo: true,
      showTagline: true,
      showGst: true,
      letterHeadEnabled: false,
    },
  });

  // Generate random hospital data
  const generateRandomHospital = () => {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan'];
    const streets = ['Main Road', 'MG Road', 'Park Street', 'Church Street', 'Brigade Road', 'Commercial Street', 'Linking Road', 'Hill Road'];
    const specialties = ['General', 'Cardiac', 'Orthopedic', 'Pediatric', 'Multi-Specialty', 'Super Specialty'];
    const prefixes = ['City', 'Metro', 'Unity', 'LifeLine', 'Sunrise', 'Grand', 'Elite', 'Prime'];
    const suffixes = ['Hospital', 'Medical Center', 'Healthcare', 'Health Center', 'Clinic'];
    
    const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomGST = () => `${random([22, 27, 29, 30, 33])}${String.fromCharCode(65 + random([0, 25]))}${String.fromCharCode(65 + random([0, 25]))}${String.fromCharCode(65 + random([0, 25]))}${String.fromCharCode(65 + random([0, 25]))}${randomNumber(1000, 9999)}${String.fromCharCode(65 + random([0, 25]))}${randomNumber(1, 9)}Z${randomNumber(1, 9)}`;
    
    const city = random(cities);
    const state = random(states);
    const streetNumber = randomNumber(1, 999);
    const streetName = random(streets);
    const prefix = random(prefixes);
    const suffix = random(suffixes);
    const hospitalName = `${prefix} ${random(specialties)} ${suffix}`;
    const domain = hospitalName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com';
    
    const taglines = [
      'Caring for you, always',
      'Your health, our priority',
      'Excellence in healthcare',
      'Compassionate care, advanced medicine',
      'Healing with a human touch'
    ];
    
    const colors = ['#2563eb', '#059669', '#7C3AED', '#DC2626', '#EA580C', '#16A34A'];
    const fonts = ['Arial, sans-serif', 'Roboto, sans-serif', 'Poppins, sans-serif', 'Open Sans, sans-serif'];
    const headerStyles = ['centered', 'left', 'withSideLogo'] as const;
    
    form.reset({
      name: hospitalName,
      email: `contact@${domain}`,
      phone: `+91 ${randomNumber(70000, 99999)} ${randomNumber(10000, 99999)}`,
      street: `${streetNumber} ${streetName}`,
      city: city,
      state: state,
      pincode: randomNumber(100000, 999999).toString(),
      country: 'India',
      website: `https://${domain}`,
      gst: randomGST(),
      registration: `${random(['MCI', 'DMC', 'KMC', 'TNMSC'])}/${randomNumber(10000, 99999)}`,
      tagline: random(taglines),
      footerNote: ' ' + new Date().getFullYear() + ' ' + hospitalName + '. All rights reserved.',
      adminName: 'Admin User',
      adminEmail: `admin@${domain}`,
      adminPassword: 'Admin@123',
      primaryColor: random(colors),
      fontFamily: random(fonts),
      headerStyle: random(['centered', 'left', 'withSideLogo']),
      showLogo: true,
      showTagline: true,
      showGst: true,
      letterHeadEnabled: false,
    });
  };

  // Quick fill function for testing
  const quickFillForm = () => {
    // Call generateRandomHospital which will reset the form with random data
    generateRandomHospital();
    
    toast({
      title: 'Form filled with random hospital data',
      description: 'You can now submit the form or press Ctrl+E again for different data.',
    });
  };
  
  // Add keyboard event listener for quick fill (Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        quickFillForm();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [form]);

  const onSubmit = async (data: HospitalFormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a hospital.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const now = new Date();
      
      // Create the hospital data in the expected format
      const hospitalData = {
        // Basic Information
        name: data.name,
        displayName: data.name, // Using name as displayName
        type: 'hospital' as const,
        registrationNumber: data.registration || '',
        gstNumber: data.gst || '',
        
        // Contact Information
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: 'India',
        },
        phoneNumbers: [data.phone],
        email: data.email,
        website: data.website || '',
        
        // About
        tagline: data.tagline || '',
        
        // Media
        logoUrl: '',
        
        // Settings
        settings: {
          primaryColor: data.primaryColor,
          secondaryColor: '#f3f4f6', // Default secondary color
          fontFamily: data.fontFamily,
          headerStyle: data.headerStyle,
          showLogo: data.showLogo,
          showTagline: data.showTagline,
          showGst: data.showGst,
          letterHeadEnabled: data.letterHeadEnabled || false,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'dd/MM/yyyy',
          currency: 'INR',
        },
        
        // Letterhead Settings
        letterhead: {
          logoUrl: '',
          showHospitalName: true,
          showAddress: true,
          showContact: true,
          showEmail: true,
          showWebsite: true,
          showGst: true,
          showRegistration: true,
        },
        
        // Admin & Access
        admin: {
          id: `admin-${Math.random().toString(36).substr(2, 9)}`,
          name: data.adminName,
          email: data.adminEmail,
          phone: data.phone,
          role: 'admin' as const,
          createdAt: now,
        },
        
        // Status
        isActive: true,
        isVerified: false,
        isDemo: false,
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        registrationDate: now,
      };

      // Add the new hospital to the context
      const hospitalId = await addHospital(hospitalData);

      console.log('New hospital created with ID:', hospitalId);

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
    <div className="w-full max-w-5xl p-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Hospital</h1>
        <p className="text-muted-foreground">Register a new hospital in the system</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="display">Display Settings</TabsTrigger>
              <TabsTrigger value="admin">Admin Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Hospital Information</CardTitle>
                  <CardDescription>Enter the hospital's basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter hospital name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="hospital@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="22AAAAA0000A1Z5" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="registration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Registration number" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="Pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="tagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tagline (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Quality Healthcare Services" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="footerNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer Note (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder=" 2024 Hospital Name. All rights reserved." {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="display">
              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Customize how the hospital information appears</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="color" className="w-16 h-10 p-1" {...field} />
                              <Input className="w-32" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Family</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="Arial, sans-serif">Arial</option>
                              <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                              <option value="'Times New Roman', serif">Times New Roman</option>
                              <option value="'Courier New', monospace">Courier New</option>
                              <option value="'Georgia', serif">Georgia</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="headerStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Header Style</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="centered">Centered</option>
                              <option value="left">Left Aligned</option>
                              <option value="withSideLogo">Side Logo</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormLabel>Display Options</FormLabel>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="showLogo"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Show Logo</FormLabel>
                                <FormDescription>
                                  Display hospital logo in the header
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="showTagline"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Show Tagline</FormLabel>
                                <FormDescription>
                                  Display tagline below hospital name
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="showGst"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Show GST Number</FormLabel>
                                <FormDescription>
                                  Display GST number in the header
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Account</CardTitle>
                  <CardDescription>Create an admin account for this hospital</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="adminName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            At least 8 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Hospital'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewHospital;
