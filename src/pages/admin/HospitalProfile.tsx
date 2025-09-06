import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Hospital, Upload, Eye, Save, ArrowLeft } from 'lucide-react';
import { demoHospital } from '@/data/demoData';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const HospitalProfile = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(demoHospital);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
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
            <h1 className="text-3xl font-bold text-foreground">Hospital Profile</h1>
            <p className="text-muted-foreground">Manage your hospital information and letterhead settings</p>
          </div>
        </div>
        <div className="flex space-x-3">
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
              <Hospital className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Hospital Information</CardTitle>
            <CardDescription>Basic details about your medical facility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label>Hospital Logo</Label>
              <div className="flex items-center space-x-4">
                {hospital.logo && (
                  <img 
                    src={hospital.logo} 
                    alt="Hospital Logo" 
                    className="w-20 h-20 rounded-lg object-cover border-2 border-border"
                  />
                )}
                {isEditing && (
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
                        <Upload className="w-4 h-4" />
                        <span>Upload Logo</span>
                      </div>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Basic Information */}
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
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={hospital.address}
                  onChange={(e) => setHospital(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted/30' : ''}
                  rows={3}
                />
              </div>

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
                  <Label htmlFor="gst">GST Number</Label>
                  <Input
                    id="gst"
                    value={hospital.gst}
                    onChange={(e) => setHospital(prev => ({ ...prev, gst: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted/30' : ''}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Letter Head Preview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Letter Head Preview</span>
            </CardTitle>
            <CardDescription>How your letterhead will appear on bills and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/20">
              {/* Letterhead Design */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-start space-x-6 mb-6">
                  {hospital.logo && (
                    <img 
                      src={hospital.logo} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-primary mb-2">{hospital.name}</h2>
                    <p className="text-sm text-muted-foreground mb-1">{hospital.address}</p>
                    <p className="text-sm text-muted-foreground mb-1">Phone: {hospital.phone}</p>
                    <p className="text-sm text-muted-foreground">GST: {hospital.gst}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-lg mb-2">Lab Test Report</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Patient: John Doe</p>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                    <p>Report ID: RPT-001</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Print Settings</CardTitle>
          <CardDescription>Configure how bills and reports are printed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              checked={hospital.letterHeadEnabled}
              onCheckedChange={(checked) => 
                setHospital(prev => ({ ...prev, letterHeadEnabled: checked }))
              }
              disabled={!isEditing}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">With Letter Head</h4>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalProfile;