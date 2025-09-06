import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, ArrowLeft, Receipt, FileText, Calculator } from 'lucide-react';
import { demoTests } from '@/data/demoData';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface PatientForm {
  name: string;
  age: string;
  gender: string;
  phone: string;
  doctor: string;
  selectedTests: string[];
}

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientForm>({
    name: '',
    age: '',
    gender: '',
    phone: '',
    doctor: '',
    selectedTests: []
  });
  
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<any>(null);

  const handleTestSelection = (testId: string, checked: boolean) => {
    setPatient(prev => ({
      ...prev,
      selectedTests: checked 
        ? [...prev.selectedTests, testId]
        : prev.selectedTests.filter(id => id !== testId)
    }));
  };

  const calculateTotal = () => {
    return patient.selectedTests.reduce((total, testId) => {
      const test = demoTests.find(t => t.id === testId);
      return total + (test?.price || 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (patient.selectedTests.length === 0) {
      toast({
        title: "No tests selected",
        description: "Please select at least one test for the patient.",
        variant: "destructive"
      });
      return;
    }

    // Generate bill
    const selectedTestsData = patient.selectedTests.map(testId => 
      demoTests.find(t => t.id === testId)!
    );

    const bill = {
      id: `BILL-${Date.now()}`,
      patientName: patient.name,
      tests: selectedTestsData,
      totalAmount: calculateTotal(),
      date: new Date(),
      patientId: `PAT-${Date.now()}`
    };

    setGeneratedBill(bill);
    setShowBillDialog(true);
    
    toast({
      title: "Patient Registered",
      description: `${patient.name} has been registered successfully.`,
    });
  };

  const handlePrintBill = () => {
    toast({
      title: "Bill Printed",
      description: "Bill has been sent to printer.",
    });
    setShowBillDialog(false);
    // Reset form
    setPatient({
      name: '',
      age: '',
      gender: '',
      phone: '',
      doctor: '',
      selectedTests: []
    });
  };

  const handleCollectSubmit = () => {
    toast({
      title: "Collecting Samples",
      description: "Redirecting to report collection form.",
    });
    setShowBillDialog(false);
    // In real app, would navigate to report collection with patient data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/lab')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patient Registration</h1>
            <p className="text-muted-foreground">Register new patient and assign tests</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Patient Information</span>
              </CardTitle>
              <CardDescription>Enter patient details and select required tests</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Patient Name *</Label>
                    <Input
                      id="name"
                      value={patient.name}
                      onChange={(e) => setPatient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={patient.age}
                      onChange={(e) => setPatient(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Enter age"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={patient.gender} onValueChange={(value) => setPatient(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={patient.phone}
                      onChange={(e) => setPatient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="doctor">Referring Doctor</Label>
                  <Input
                    id="doctor"
                    value={patient.doctor}
                    onChange={(e) => setPatient(prev => ({ ...prev, doctor: e.target.value }))}
                    placeholder="Dr. Name"
                  />
                </div>

                {/* Test Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Select Tests *</Label>
                  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto border rounded-lg p-4">
                    {demoTests.map((test) => (
                      <div key={test.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-smooth">
                        <Checkbox
                          id={test.id}
                          checked={patient.selectedTests.includes(test.id)}
                          onCheckedChange={(checked) => handleTestSelection(test.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={test.id} className="font-medium cursor-pointer">
                            {test.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {test.fields.length} parameters
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary">₹{test.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-medical hover:opacity-90"
                  disabled={patient.selectedTests.length === 0}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register Patient & Generate Bill
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Bill Preview */}
        <div>
          <Card className="shadow-card sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Bill Summary</span>
              </CardTitle>
              <CardDescription>Selected tests and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.selectedTests.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {patient.selectedTests.map(testId => {
                      const test = demoTests.find(t => t.id === testId);
                      return test ? (
                        <div key={testId} className="flex justify-between items-start p-2 rounded bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">{test.name}</p>
                            <p className="text-xs text-muted-foreground">{test.fields.length} params</p>
                          </div>
                          <span className="font-bold text-primary">₹{test.price}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total Amount:</span>
                      <span className="text-xl font-bold text-primary">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tests selected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bill Generation Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Patient Registered Successfully</span>
            </DialogTitle>
            <DialogDescription>
              Bill has been generated for {generatedBill?.patientName}. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {generatedBill && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Patient:</span>
                  <span className="font-medium">{generatedBill.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tests:</span>
                  <span className="font-medium">{generatedBill.tests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-primary">₹{generatedBill.totalAmount}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Button onClick={handlePrintBill} className="w-full bg-gradient-medical hover:opacity-90">
                <Receipt className="w-4 h-4 mr-2" />
                Print Bill
              </Button>
              <Button onClick={handleCollectSubmit} variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Collect & Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRegistration;