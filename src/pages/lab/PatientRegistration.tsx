import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, ArrowLeft, Receipt, FileText, Calculator, X, Check, ChevronsUpDown } from 'lucide-react';
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter tests based on search query with debounce
  const [filteredTests, setFilteredTests] = React.useState(demoTests);
  
  React.useEffect(() => {
    // Simple debounce implementation
    const timer = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredTests(demoTests);
      } else {
        const query = searchQuery.toLowerCase();
        const results = demoTests.filter(test => 
          test.name.toLowerCase().includes(query) ||
          test.fields.some(field => field.name.toLowerCase().includes(query))
        );
        setFilteredTests(results);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const toggleTestSelection = (testId: string) => {
    setPatient(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testId)
        ? prev.selectedTests.filter(id => id !== testId)
        : [...prev.selectedTests, testId]
    }));
  };
  
  const removeTest = (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPatient(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.filter(id => id !== testId)
    }));
  };
  
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
                  <div className="relative">
                    <div 
                      className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[42px] cursor-pointer bg-background"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      {patient.selectedTests.length === 0 ? (
                        <span className="text-muted-foreground text-sm py-1.5 px-2">Search and select tests...</span>
                      ) : (
                        patient.selectedTests.map(testId => {
                          const test = demoTests.find(t => t.id === testId);
                          return test ? (
                            <div 
                              key={testId}
                              className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{test.name}</span>
                              <button 
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={(e) => removeTest(testId, e)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null;
                        })
                      )}
                      <input
                        type="text"
                        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
                        placeholder={patient.selectedTests.length === 0 ? "Type to search tests..." : ""}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!isOpen) setIsOpen(true);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && filteredTests.length > 0) {
                            toggleTestSelection(filteredTests[0].id);
                            setSearchQuery('');
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(!isOpen);
                        }}
                      >
                        <ChevronsUpDown className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {isOpen && (
                      <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                        {filteredTests.length > 0 ? (
                          <div className="p-1">
                            {filteredTests.map((test) => {
                              const isSelected = patient.selectedTests.includes(test.id);
                              return (
                                <div
                                  key={test.id}
                                  className={`relative flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-muted/30' : ''}`}
                                  onClick={() => {
                                    toggleTestSelection(test.id);
                                    setSearchQuery('');
                                  }}
                                >
                                  <div className={`flex items-center justify-center w-5 h-5 border rounded ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">{test.name}</span>
                                      <span className="text-xs text-primary font-medium">₹{test.price}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {test.fields.length} parameters
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No tests found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected tests summary */}
                  {patient.selectedTests.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium">Selected Tests ({patient.selectedTests.length}):</p>
                      <div className="space-y-1">
                        {patient.selectedTests.map(testId => {
                          const test = demoTests.find(t => t.id === testId);
                          return test ? (
                            <div key={testId} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                              <span>{test.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-medium">₹{test.price}</span>
                                <button 
                                  type="button"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={(e) => removeTest(testId, e)}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
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