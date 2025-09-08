import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Eye, Save, ArrowLeft, Settings, Printer, Image, Palette, Type, MapPin, Phone, Mail, FileText, Building2 } from 'lucide-react';
import { Hospital } from '@/types';
import { demoHospital } from '@/data/demoData';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
 

const HospitalProfile = () => {
  const navigate = useNavigate();
  // Format address object to string for display
  const formatAddress = (address: { street?: string; city?: string; state?: string; pincode?: string; country?: string }) => {
    if (!address) return '';
    const { street, city, state, pincode, country } = address;
    return [street, city, state, pincode, country].filter(Boolean).join(', ');
  };

  const [hospital, setHospital] = useState<Hospital>({
    ...demoHospital,
    email: '',
    website: '',
    registrationNumber: '',
    tagline: '',
    settings: {
      ...demoHospital.settings,
      primaryColor: '#2563eb',
      fontFamily: 'Arial, sans-serif',
      headerStyle: 'centered',
      showLogo: true,
      showTagline: true,
      showGst: true,
      footerNote: 'This is a computer generated bill. No signature required.'
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load persisted settings once
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hospitalProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHospital(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    try {
      localStorage.setItem('hospitalProfile', JSON.stringify(hospital));
    } catch (e) {
      // ignore
    }
    toast({
      title: "Profile Updated",
      description: "Hospital profile has been saved successfully.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to Firebase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setHospital(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteUpload = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (ev) => {
          setHospital(prev => ({ ...prev, logo: ev.target?.result as string }));
          toast({ title: 'Logo updated', description: 'Image pasted from clipboard.' });
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  };

  const handleAddLogoUrl = () => {
    if (!isEditing) return;
    if (!logoUrlInput) return;
    setHospital(prev => ({ ...prev, logo: logoUrlInput }));
    toast({ title: 'Logo updated', description: 'Logo set from URL.' });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setHospital(prev => ({ ...prev, logo: ev.target?.result as string }));
      toast({ title: 'Logo updated', description: 'Image added from drag & drop.' });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handlePasteFromClipboardApi = async () => {
    if (!isEditing) return;
    if (!('clipboard' in navigator) || !(navigator as any).clipboard.read) {
      toast({ title: 'Clipboard not supported', description: 'Your browser does not support reading images from clipboard via API. Try Ctrl+V/Cmd+V instead.' });
      return;
    }
    try {
      const items = await (navigator as any).clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (ev) => {
              setHospital(prev => ({ ...prev, logo: ev.target?.result as string }));
              toast({ title: 'Logo updated', description: 'Image pasted from clipboard.' });
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      toast({ title: 'No image in clipboard', description: 'Copy an image and try again.' });
    } catch (err) {
      toast({ title: 'Paste failed', description: 'Permission denied or no image available.' });
    }
  };

  // Capture paste anywhere on the page while editing
  useEffect(() => {
    const onWindowPaste = (e: ClipboardEvent) => {
      if (!isEditing) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            setHospital(prev => ({ ...prev, logo: ev.target?.result as string }));
            toast({ title: 'Logo updated', description: 'Image pasted from clipboard.' });
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    };
    window.addEventListener('paste', onWindowPaste);
    return () => window.removeEventListener('paste', onWindowPaste);
  }, [isEditing]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hospital Profile & Letterhead</h1>
            <p className="text-muted-foreground">Customize your hospital information and letterhead design for bills and reports</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-medical hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-gradient-medical hover:opacity-90">
              <Settings className="w-4 h-4 mr-2" />
              Edit Letterhead
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="letterhead" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="letterhead" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Letterhead Design</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Hospital Profile</span>
          </TabsTrigger>
          <TabsTrigger value="print-settings" className="flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Print Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Letterhead Design Tab */}
        <TabsContent value="letterhead" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Design Controls */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Design Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Header Style</Label>
                      <select 
                        className="border rounded-md p-2 text-sm w-40"
                        value={hospital.settings.headerStyle || 'centered'}
                        onChange={(e) => setHospital(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            headerStyle: (e.target.value as 'centered' | 'left' | 'withSideLogo') || 'centered'
                          }
                        }))}
                        disabled={!isEditing}
                      >
                        <option value="centered">Centered</option>
                        <option value="left">Left Aligned</option>
                        <option value="withSideLogo">With Side Logo</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Primary Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={hospital.settings.primaryColor || '#2563eb'}
                          onChange={(e) => setHospital(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              primaryColor: e.target.value
                            }
                          }))}
                          disabled={!isEditing}
                          className="w-8 h-8 p-0 border rounded cursor-pointer"
                        />
                        {isEditing && (
                          <span className="text-xs text-muted-foreground">{hospital.settings.primaryColor}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Font Family</Label>
                      <select 
                        className="border rounded-md p-2 text-sm w-48"
                        value={hospital.settings.fontFamily || 'Arial, sans-serif'}
                        onChange={(e) => setHospital(prev => ({ 
                          ...prev, 
                          settings: {
                            ...prev.settings,
                            fontFamily: e.target.value
                          } 
                        }))}
                        disabled={!isEditing}
                      >
                        <option value="Arial, sans-serif">Arial, sans-serif</option>
                        <option value="Georgia, serif">Georgia, serif</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Display Elements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="show-logo" 
                          className="rounded border-gray-300"
                          checked={!!hospital.settings.showLogo}
                          onChange={(e) => setHospital(prev => ({ 
                            ...prev, 
                            settings: {
                              ...prev.settings,
                              showLogo: e.target.checked 
                            }
                          }))}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="show-logo" className="text-sm font-normal">Show Logo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="show-tagline" 
                          className="rounded border-gray-300"
                          checked={!!hospital.settings.showTagline}
                          onChange={(e) => setHospital(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              showTagline: e.target.checked
                            }
                          }))}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="show-tagline" className="text-sm font-normal">Show Tagline</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="show-gst" 
                          className="rounded border-gray-300"
                          checked={!!hospital.settings.showGst}
                          onChange={(e) => setHospital(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              showGst: e.target.checked
                            }
                          }))}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="show-gst" className="text-sm font-normal">Show GST Number</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="design-tagline">Header Tagline</Label>
                    <Input
                      id="design-tagline"
                      value={hospital.tagline || ''}
                      onChange={(e) => setHospital(prev => ({ ...prev, tagline: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="e.g., Advanced Diagnostic Center & Pathology Lab"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="design-address">Header Address</Label>
                    <Textarea
                      id="design-address"
                      value={formatAddress(hospital.address)}
                      onChange={(e) => {
                        // Convert string back to address object
                        const addressParts = e.target.value.split(',').map(part => part.trim());
                        setHospital(prev => ({
                          ...prev,
                          address: {
                            street: addressParts[0] || '',
                            city: addressParts[1] || '',
                            state: addressParts[2] || '',
                            pincode: addressParts[3] || '',
                            country: addressParts[4] || ''
                          }
                        }));
                      }}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Enter full address for letterhead (street, city, state, pincode, country)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="design-phone">Header Phone</Label>
                      <Input
                        id="design-phone"
                        value={hospital.phone}
                        onChange={(e) => setHospital(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="+91 ..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="design-email">Header Email</Label>
                      <Input
                        id="design-email"
                        type="email"
                        value={hospital.email || ''}
                        onChange={(e) => setHospital(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upload Logo</CardTitle>
                  <CardDescription>Recommended size: 200x80px</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      ref={dropZoneRef}
                      onPaste={handlePasteUpload}
                      onClick={() => dropZoneRef.current?.focus()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      tabIndex={0}
                      role="button"
                      aria-label="Upload area. Click and press Ctrl+V/Cmd+V to paste image."
                      className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center space-y-2 outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                      title="Click and press Ctrl+V / Cmd+V to paste an image"
                    >
                      <Image className="w-10 h-10 text-muted-foreground" />
                      <div className="text-sm text-center">
                        <Label htmlFor="logo-upload" className="text-primary cursor-pointer hover:underline">
                          Click to upload
                        </Label>{' '}
                        or drag and drop
                      </div>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG (max. 2MB)</p>
                      <p className="text-xs text-muted-foreground">Tips: Paste (Ctrl+V / Cmd+V), Drag & Drop, or use the button below</p>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={!isEditing}
                      />
                    </div>
                    {hospital.logo && (
                      <div className="flex items-center justify-center p-2 border rounded-lg">
                        <img 
                          src={hospital.logo} 
                          alt="Hospital Logo" 
                          className="h-16 object-contain"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
                      <Input
                        placeholder="Paste image URL (https://...)"
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddLogoUrl(); }}
                        disabled={!isEditing}
                      />
                      <Button type="button" variant="outline" onClick={handleAddLogoUrl} disabled={!isEditing || !logoUrlInput}>
                        Add from URL
                      </Button>
                    </div>

                    <div className="flex justify-center">
                      <Button type="button" variant="secondary" onClick={handlePasteFromClipboardApi} disabled={!isEditing}>
                        Paste from Clipboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Pane */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Live Preview</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.print()}
                      className="print:hidden"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Test
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-8 bg-white shadow-sm" style={{ fontFamily: hospital.fontFamily || 'Arial, sans-serif' }}>
                    {/* Letterhead Design */}
                    <div className={`${hospital.headerStyle === 'left' || hospital.headerStyle === 'withSideLogo' ? 'text-left' : 'text-center'} mb-8`}>
                      {hospital.showLogo && hospital.logo && (
                        <div className={`${hospital.headerStyle === 'withSideLogo' ? 'flex items-center gap-4' : 'flex justify-center'} mb-4`}>
                          <img 
                            src={hospital.logo} 
                            alt="Hospital Logo" 
                            className={`object-contain ${hospital.headerStyle === 'withSideLogo' ? 'h-16' : 'h-16'}`}
                          />
                          {hospital.headerStyle === 'withSideLogo' && (
                            <div>
                              <h1 className="text-2xl font-bold" style={{ color: hospital.primaryColor || '#2563eb' }}>{hospital.name}</h1>
                              {hospital.showTagline && hospital.tagline && (
                                <p className="text-gray-600 mt-1">{hospital.tagline}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {hospital.headerStyle !== 'withSideLogo' && (
                        <>
                          <h1 className="text-2xl font-bold" style={{ color: hospital.primaryColor || '#2563eb' }}>{hospital.name}</h1>
                          {hospital.showTagline && hospital.tagline && (
                            <p className="text-gray-600 mt-1">{hospital.tagline}</p>
                          )}
                        </>
                      )}
                      
                      <div className="mt-4 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{formatAddress(hospital.address)}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-4">
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {hospital.phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {hospital.email}
                          </span>
                        </div>
                        {hospital.showGst && (
                          <div>
                            <span>GST: {hospital.gst} | Reg. No.: {hospital.registration || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="my-4" style={{ borderTop: `2px solid ${hospital.primaryColor || '#e5e7eb'}` }}></div>
                    </div>

                    {/* Sample Bill Content */}
                    <div className="text-center py-8">
                      <h2 className="text-xl font-semibold mb-4">BILL / RECEIPT</h2>
                      <div className="text-sm text-gray-600 space-y-2 mb-8">
                        <p>Bill No: INV-2023-00123</p>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Test</th>
                              <th className="p-2 text-right">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="p-2">Complete Blood Count (CBC)</td>
                              <td className="p-2 text-right">500.00</td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">Blood Sugar Fasting</td>
                              <td className="p-2 text-right">200.00</td>
                            </tr>
                            <tr className="border-t font-semibold">
                              <td className="p-2">Total</td>
                              <td className="p-2 text-right">700.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-8 pt-4 border-t text-sm text-gray-500">
                        <p>This is a computer generated bill. No signature required.</p>
                        <p className="mt-2">Thank you for choosing our services!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hospital Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hospital Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Hospital Information</span>
                </CardTitle>
                <CardDescription>Basic details about your medical facility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Hospital Name</Label>
                    <Input
                      id="name"
                      value={hospital.name}
                      onChange={(e) => setHospital(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted/30' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={hospital.tagline || ''}
                      onChange={(e) => setHospital(prev => ({ ...prev, tagline: e.target.value }))}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted/30' : ''}
                      placeholder="e.g., Advanced Diagnostic Center & Pathology Lab"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      value={formatAddress(hospital.address)}
                      onChange={(e) => {
                        // Convert string back to address object
                        const addressParts = e.target.value.split(',').map(part => part.trim());
                        setHospital(prev => ({
                          ...prev,
                          address: {
                            street: addressParts[0] || '',
                            city: addressParts[1] || '',
                            state: addressParts[2] || '',
                            pincode: addressParts[3] || '',
                            country: addressParts[4] || ''
                          }
                        }));
                      }}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-muted/30' : ''}
                      rows={3}
                      placeholder="street, city, state, pincode, country"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={hospital.phone}
                        onChange={(e) => setHospital(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-muted/30' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={hospital.email || ''}
                        onChange={(e) => setHospital(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-muted/30' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={hospital.website || ''}
                        onChange={(e) => setHospital(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-muted/30' : ''}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Legal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gst">GST Number</Label>
                      <Input
                        id="gst"
                        value={hospital.gst}
                        onChange={(e) => setHospital(prev => ({ ...prev, gst: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-muted/30' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="registration">Registration Number</Label>
                      <Input
                        id="registration"
                        value={hospital.registration || ''}
                        onChange={(e) => setHospital(prev => ({ ...prev, registration: e.target.value }))}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-muted/30' : ''}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {hospital.logo && (
              <div className="flex items-center space-x-4">
                <img 
                  src={hospital.logo} 
                  alt="Logo" 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary mb-2">{hospital.name}</h2>
                  <p className="text-sm text-muted-foreground mb-1">{formatAddress(hospital.address)}</p>
                  <p className="text-sm text-muted-foreground mb-1">Phone: {hospital.phone}</p>
                  <p className="text-sm text-muted-foreground">GST: {hospital.gst}</p>
                </div>
              </div>
            )}
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="font-semibold text-lg mb-2">Lab Test Report</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Patient: John Doe</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Report ID: RPT-001</p>
              </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hospital logo and name</li>
                <li>• Full address and contact info</li>
                <li>• GST number</li>
                <li>• Professional appearance</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Without Letter Head</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Plain format</li>
                <li>• For pre-printed letterheads</li>
                <li>• Minimal design</li>
                <li>• Cost-effective printing</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Print Settings Tab */}
        <TabsContent value="print-settings" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Print Settings</CardTitle>
              <CardDescription>Configure how bills and reports are printed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="letterhead-toggle" className="text-base font-medium">
                      Use Hospital Letter Head in Prints
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this to include hospital logo and details on all printed documents
                    </p>
                  </div>
                  <Switch
                    id="letterhead-toggle"
                    checked={hospital.letterHeadEnabled || false}
                    onCheckedChange={(checked) => 
                      setHospital(prev => ({ ...prev, letterHeadEnabled: checked }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalProfile;