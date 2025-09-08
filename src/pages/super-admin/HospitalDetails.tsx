import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useHospitals } from '@/context/HospitalContext';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Settings, 
  FileSignature, 
  FileArchive,
  Info,
  Pencil,
  Save,
  Trash2,
  Upload,
  Download,
  PlusCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Hospital, LetterheadSettings } from '@/types';

const HospitalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hospitals, updateHospital, deleteHospital } = useHospitals();
  
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Hospital>>({});
  const [letterheadData, setLetterheadData] = useState<LetterheadSettings>({
    logoUrl: '',
    showHospitalName: true,
    showAddress: true,
    showContact: true,
    showEmail: true,
    showWebsite: true,
    showGst: true,
    showRegistration: true,
    customCss: ''
    // headerImage and footerImage are optional in LetterheadSettings
  });
  
  // Documents state
  const [documents, setDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: Date;
    size: string;
  }>>([]);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        if (!id) return;
        
        // In a real app, this would be an API call
        const foundHospital = hospitals.find(h => h.id === id);
        
        if (foundHospital) {
          setHospital(foundHospital);
          setFormData(foundHospital);
          
          // Set letterhead data if it exists with proper type safety
          if (foundHospital.letterhead) {
            setLetterheadData({
              ...foundHospital.letterhead,
              // Ensure all required fields have values
              logoUrl: foundHospital.letterhead.logoUrl || '',
              showHospitalName: foundHospital.letterhead.showHospitalName ?? true,
              showAddress: foundHospital.letterhead.showAddress ?? true,
              showContact: foundHospital.letterhead.showContact ?? true,
              showEmail: foundHospital.letterhead.showEmail ?? true,
              showWebsite: foundHospital.letterhead.showWebsite ?? true,
              showGst: foundHospital.letterhead.showGst ?? true,
              showRegistration: foundHospital.letterhead.showRegistration ?? true,
              customCss: foundHospital.letterhead.customCss || ''
            });
          }
          
          // Simulate loading documents
          setDocuments([
            {
              id: '1',
              name: 'Registration Certificate.pdf',
              type: 'PDF',
              uploadDate: new Date(),
              size: '2.5 MB'
            },
            {
              id: '2',
              name: 'GST Certificate.pdf',
              type: 'PDF',
              uploadDate: new Date(),
              size: '1.8 MB'
            }
          ]);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Hospital not found',
          });
          navigate('/super-admin/hospitals');
        }
      } catch (error) {
        console.error('Error fetching hospital details:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load hospital details',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitalData();
  }, [id, hospitals, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [name]: value
      }
    }));
  };

  const handleLetterheadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setLetterheadData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      if (!hospital) return;
      
      const updatedHospital = {
        ...hospital,
        ...formData,
        letterhead: letterheadData,
        updatedAt: new Date()
      };
      
      // In a real app, this would be an API call
      await updateHospital(id, updatedHospital);
      
      setHospital(updatedHospital);
      setIsEditing(false);
      
      toast({
        title: 'Success',
        description: 'Hospital details updated successfully',
      });
    } catch (error) {
      console.error('Error updating hospital:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update hospital details',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'header' | 'footer') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, upload the file to a storage service
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setLetterheadData(prev => ({
        ...prev,
        [`${type}Image`]: url
      }));
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">
          Hospital not found
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
          <div className="flex items-center mt-2">
            {isEditing ? (
              <Input
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="text-3xl font-bold p-0 border-0 shadow-none focus-visible:ring-0"
              />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">
                {hospital.name}
              </h1>
            )}
            {hospital.isDemo && (
              <Badge variant="outline" className="ml-3 bg-yellow-100 text-yellow-800">
                Demo
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-4"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
            {isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => {
                  setFormData(hospital);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            {hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)} • Registered on {new Date(hospital.registrationDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="details" 
        className="space-y-4"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">
            <Info className="mr-2 h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="letterhead">
            <FileSignature className="mr-2 h-4 w-4" />
            Letterhead
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileArchive className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>
                View and manage hospital details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="name">Hospital Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    {isEditing ? (
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="hospital">Hospital</option>
                        <option value="clinic">Clinic</option>
                        <option value="diagnostic-center">Diagnostic Center</option>
                        <option value="multi-specialty">Multi-Specialty</option>
                      </select>
                    ) : (
                      <p className="text-sm capitalize">{hospital.type.replace('-', ' ')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    {isEditing ? (
                      <Input
                        id="tagline"
                        name="tagline"
                        value={formData.tagline || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {hospital.tagline || 'No tagline set'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Phone Numbers</Label>
                    {isEditing ? (
                      <div className="space-y-2">
                        {formData.phoneNumbers?.map((phone, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={phone}
                              onChange={(e) => {
                                const newPhones = [...(formData.phoneNumbers || [])];
                                newPhones[index] = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  phoneNumbers: newPhones
                                }));
                              }}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const newPhones = [...(formData.phoneNumbers || [])];
                                newPhones.splice(index, 1);
                                setFormData(prev => ({
                                  ...prev,
                                  phoneNumbers: newPhones
                                }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              phoneNumbers: [...(prev.phoneNumbers || []), '']
                            }));
                          }}
                        >
                          Add Phone Number
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {hospital.phoneNumbers?.map((phone, index) => (
                          <p key={index} className="text-sm">{phone}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        name="website"
                        value={formData.website || ''}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-sm">
                        {hospital.website ? (
                          <a 
                            href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {hospital.website}
                          </a>
                        ) : 'No website'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    {isEditing ? (
                      <Input
                        id="street"
                        name="street"
                        value={formData.address?.street || ''}
                        onChange={handleAddressChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.address?.street}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        name="city"
                        value={formData.address?.city || ''}
                        onChange={handleAddressChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.address?.city}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    {isEditing ? (
                      <Input
                        id="state"
                        name="state"
                        value={formData.address?.state || ''}
                        onChange={handleAddressChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.address?.state}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Postal/Zip Code</Label>
                    {isEditing ? (
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.address?.pincode || ''}
                        onChange={handleAddressChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.address?.pincode}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    {isEditing ? (
                      <Input
                        id="country"
                        name="country"
                        value={formData.address?.country || ''}
                        onChange={handleAddressChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.address?.country || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Registration Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    {isEditing ? (
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.registrationNumber || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    {isEditing ? (
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        value={formData.gstNumber || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm">{hospital.gstNumber || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData(hospital);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="letterhead" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Letterhead Settings</CardTitle>
              <CardDescription>
                Customize the appearance of your hospital's letterhead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logo & Images</h3>
                  
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-md border flex items-center justify-center overflow-hidden">
                        {letterheadData.logoUrl ? (
                          <img 
                            src={letterheadData.logoUrl} 
                            alt="Hospital Logo" 
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs text-center">No logo</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="logo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                        />
                        <Label 
                          htmlFor="logo-upload" 
                          className="cursor-pointer text-sm font-medium text-primary hover:underline"
                        >
                          {letterheadData.logoUrl ? 'Change' : 'Upload'} Logo
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 200x100px
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Header Image</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-32 rounded-md border flex items-center justify-center overflow-hidden">
                        {letterheadData.headerImage ? (
                          <img 
                            src={letterheadData.headerImage} 
                            alt="Header Image" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs text-center">No header image</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="header-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'header')}
                        />
                        <Label 
                          htmlFor="header-upload" 
                          className="cursor-pointer text-sm font-medium text-primary hover:underline"
                        >
                          {letterheadData.headerImage ? 'Change' : 'Upload'} Header
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 1200x200px
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Footer Image</Label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-32 rounded-md border flex items-center justify-center overflow-hidden">
                        {letterheadData.footerImage ? (
                          <img 
                            src={letterheadData.footerImage} 
                            alt="Footer Image" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs text-center">No footer image</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="footer-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'footer')}
                        />
                        <Label 
                          htmlFor="footer-upload" 
                          className="cursor-pointer text-sm font-medium text-primary hover:underline"
                        >
                          {letterheadData.footerImage ? 'Change' : 'Upload'} Footer
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 1200x100px
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Options</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Hospital Name</Label>
                        <p className="text-sm text-muted-foreground">
                          Display hospital name on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showHospitalName}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showHospitalName: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Address</Label>
                        <p className="text-sm text-muted-foreground">
                          Display hospital address on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showAddress}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showAddress: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Contact Info</Label>
                        <p className="text-sm text-muted-foreground">
                          Display phone numbers on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showContact}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showContact: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Display email address on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showEmail}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showEmail: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Website</Label>
                        <p className="text-sm text-muted-foreground">
                          Display website URL on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showWebsite}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showWebsite: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show GST Number</Label>
                        <p className="text-sm text-muted-foreground">
                          Display GST number on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showGst}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showGst: checked
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Registration Number</Label>
                        <p className="text-sm text-muted-foreground">
                          Display registration number on the letterhead
                        </p>
                      </div>
                      <Switch 
                        checked={letterheadData.showRegistration}
                        onCheckedChange={(checked) => setLetterheadData(prev => ({
                          ...prev,
                          showRegistration: checked
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Custom CSS</h3>
                <div className="space-y-2">
                  <Label htmlFor="customCss">Custom CSS (Advanced)</Label>
                  <Textarea
                    id="customCss"
                    name="customCss"
                    value={letterheadData.customCss}
                    onChange={handleLetterheadChange}
                    placeholder=".letterhead-header { background-color: #f8fafc; }"
                    className="font-mono text-sm h-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add custom CSS to further style your letterhead
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLetterheadData(hospital.letterhead || {
                      logoUrl: '',
                      headerImage: '',
                      footerImage: '',
                      showHospitalName: true,
                      showAddress: true,
                      showContact: true,
                      showEmail: true,
                      showWebsite: true,
                      showGst: true,
                      showRegistration: true,
                      customCss: ''
                    });
                  }}
                >
                  Reset
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Upload and manage hospital documents and certificates
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 bg-muted/50 px-4 py-2 text-sm font-medium">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Uploaded</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {documents.map((doc) => (
                      <div key={doc.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50">
                        <div className="col-span-6 flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {doc.type}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {doc.uploadDate.toLocaleDateString()}
                        </div>
                        <div className="col-span-2 flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No documents uploaded</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload documents to keep them organized in one place
                  </p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Settings</CardTitle>
              <CardDescription>
                Configure hospital-specific settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Online Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow patients to book appointments online
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Online Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow patients to view reports online
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for appointments and reports
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send SMS notifications for appointments and reports
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Billing Settings</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" defaultValue="18" className="w-32" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable GST</Label>
                      <p className="text-sm text-muted-foreground">
                        Include GST in billing
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                
                <div className="rounded-lg border border-destructive p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-destructive">Deactivate Hospital</h4>
                      <p className="text-sm text-muted-foreground">
                        Deactivating will prevent any new registrations or bookings
                      </p>
                    </div>
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                      Deactivate
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-lg border border-destructive p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-destructive">Delete Hospital</h4>
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone. All data will be permanently deleted.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
                          try {
                            await deleteHospital(id);
                            toast({
                              title: 'Success',
                              description: 'Hospital deleted successfully',
                              variant: 'default',
                            });
                            navigate('/super-admin/hospitals');
                          } catch (error) {
                            console.error('Error deleting hospital:', error);
                            toast({
                              title: 'Error',
                              description: error instanceof Error ? error.message : 'Failed to delete hospital',
                              variant: 'destructive',
                            });
                          }
                        }
                      }}
                      disabled={hospital?.isDemo}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {hospital?.isDemo ? 'Cannot Delete Demo Hospital' : 'Delete Hospital'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hospital Users</CardTitle>
                  <CardDescription>
                    Manage user accounts for this hospital
                  </CardDescription>
                </div>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hospital.admin && (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={hospital.admin.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {hospital.admin.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{hospital.admin.name}</p>
                          <Badge 
                            variant="outline" 
                            className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Admin
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{hospital.admin.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Primary Contact</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {hospital.phoneNumbers?.[0] || 'No phone number'}
                      </div>
                    </div>
                  </div>
                )}
                
                {hospital.staff?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || ''} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{user.name}</p>
                          <Badge 
                            variant="outline" 
                            className="ml-2 bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!hospital.staff || hospital.staff.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">No additional users</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add staff members to help manage this hospital
                    </p>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Staff Member
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalDetails;
