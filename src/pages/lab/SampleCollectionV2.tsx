import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, ClipboardList, XCircle, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getPatient, PatientData } from '@/services/patientService';
import { sampleTests as extSampleTests, testConfigurations as extTestConfigs, testConfigByTestId as extConfigMap } from '@/modules/tests/config';
import { TestParameterTable } from '@/components/tests/TestParameterTable';
import { demoTests } from '@/data/demoData';
import { Letterhead, letterheadStyles } from '@/components/letterhead/Letterhead';
import { useHospitalLetterhead } from '@/hooks/useHospitalLetterhead';
import { useReactToPrint } from 'react-to-print';

// Types
interface Sample {
  testId: string;
  testName: string;
  sampleType: string;
  container: string;
  instructions: string;
  collected: boolean;
  collectedAt?: Date;
  collectedBy?: string;
  notes?: string;
}

interface BaseField {
  id: string;
  label: string;
  required: boolean;
  unit?: string;
  refRange?: string;
}

interface NumberField extends BaseField {
  type: 'number';
  min?: string;
  max?: string;
  step?: string;
}

interface SelectField extends BaseField {
  type: 'select';
  options: string[];
}

interface DateTimeField extends BaseField {
  type: 'datetime-local';
}

type FieldConfig = NumberField | SelectField | DateTimeField;

interface TableParam {
  id: string;
  name: string;
  unit: string;
  normalRange: string;
  value?: string;
  notes?: string;
}

// Use shared tests meta from reusable module
const sampleTests = extSampleTests;

const SampleCollectionV2: React.FC = () => {
  // Navigation and routing
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Record<string, TableParam>>({});
  const [technicianName, setTechnicianName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printWithLetterhead, setPrintWithLetterhead] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [currentTest, setCurrentTest] = useState<Sample | null>(null);
  const { hospital: hospitalData } = useHospitalLetterhead();

  // Derived state
  const selectedTest = useMemo(
    () => selectedTestId ? samples.find(test => test.testId === selectedTestId) : null,
    [selectedTestId, samples]
  );

  // Load test configuration when selected test changes
  useEffect(() => {
    if (!selectedTestId) return;
    
    // Get the test configuration key from the mapping
    const configKey = extConfigMap[selectedTestId as keyof typeof extConfigMap];
    if (!configKey) return;
    
    // Get the configuration for this test
    const config = extTestConfigs[configKey as keyof typeof extTestConfigs];
    if (!config) return;
    
    // Convert the configuration to table parameters
    const params: Record<string, TableParam> = {};
    config.fields.forEach(field => {
      params[field.id] = {
        id: field.id,
        name: field.label,
        unit: (field as any).unit || '',
        normalRange: (field as any).refRange || '',
        value: '',
        notes: ''
      };
    });
    
    setParameters(params);
  }, [selectedTestId]);

  // Initialize samples from patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      
      try {
        setIsLoading(true);
        const patientData = await getPatient(patientId);
        
        if (!patientData) {
          throw new Error('Patient not found');
        }
        
        setPatient(patientData);
        
        // Build samples from patient's tests
        const selectedIds = patientData.tests || [];
        const orderedSamples = selectedIds.map(testId => {
          const rich = sampleTests.find(t => t.id === testId);
          if (rich) {
            return {
              testId: rich.id,
              testName: rich.name,
              sampleType: rich.sampleType,
              container: rich.container,
              instructions: rich.instructions,
              collected: false,
              notes: ''
            };
          }
          
          const fallback = demoTests.find(t => t.id === testId);
          return {
            testId,
            testName: fallback?.name || `Test ${testId}`,
            sampleType: 'Blood',
            container: 'Standard',
            instructions: '',
            collected: false,
            notes: ''
          };
        });
        
        setSamples(orderedSamples);
        
        // Auto-select first test if available
        if (orderedSamples.length > 0) {
          setSelectedTestId(orderedSamples[0].testId);
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patient data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId]);

  // Handle test selection
  const handleTestSelect = useCallback((testId: string) => {
    setSelectedTestId(testId);
    
    // Reset parameters when changing tests
    setParameters({});
  }, []);

  // Toggle sample collected status
  const toggleSampleCollected = useCallback((testId: string) => {
    setSamples(prevSamples => {
      const updatedSamples = prevSamples.map(sample =>
        sample.testId === testId
          ? {
              ...sample,
              collected: !sample.collected,
              collectedAt: sample.collected ? undefined : new Date(),
              collectedBy: sample.collected ? undefined : technicianName || 'System',
              notes: !sample.collected && !sample.notes ? 'Sample collected' : sample.notes
            }
          : sample
      );
      
      // Update selectedTest if it's the one being toggled
      if (selectedTest?.testId === testId) {
        const updatedTest = updatedSamples.find(s => s.testId === testId);
        if (updatedTest) {
          setCurrentTest(updatedTest);
        }
      }
      
      return updatedSamples;
    });
    
    const test = samples.find(s => s.testId === testId);
    if (test && !test.collected) {
      setCurrentTest({
        ...test,
        collected: true,
        collectedAt: new Date(),
        collectedBy: technicianName || 'System',
        notes: 'Sample collected'
      });
      
      toast({
        title: 'Sample Collected',
        description: `${test.testName} has been marked as collected.`,
        variant: 'default',
      });
    }
  }, [technicianName, samples, selectedTest]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!technicianName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter technician name',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, save to your backend here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Sample collection recorded successfully',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error saving sample collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sample collection',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [technicianName]);

  // Add a ref for the content to be printed
  const printRef = useRef<HTMLDivElement>(null);

  // Handle print with custom styles
  const handlePrint = useReactToPrint({
    content: () => {
      try {
        // Clone the print content to ensure it's fresh
        const content = printRef.current;
        if (!content) {
          console.error('Print content not found');
          return null;
        }
        
        // Create a new div to hold the print content
        const printContainer = document.createElement('div');
        printContainer.className = 'temp-print-container';
        printContainer.style.visibility = 'hidden';
        
        // Clone the content of the print dialog
        const printContent = document.querySelector('.print-dialog-content');
        if (!printContent) {
          console.error('Print dialog content not found');
          return null;
        }
        
        printContainer.innerHTML = printContent.innerHTML;
        document.body.appendChild(printContainer);
        
        return printContainer;
      } catch (error) {
        console.error('Error preparing print content:', error);
        return null;
      }
    },
    pageStyle: `
      @page { 
        size: A4;
        margin: 10mm;
      }
      body { 
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background: white !important;
        color: black !important;
        font-family: Arial, sans-serif;
        line-height: 1.5;
      }
      .print-content {
        background: white !important;
        color: black !important;
        padding: 20px;
      }
      .print-header {
        display: block !important;
        text-align: center;
        margin-bottom: 1.5rem;
      }
      @media print {
        .print-header {
          position: relative;
          width: 100%;
          margin: 0 auto;
          padding: 0;
        }
        .print-header img {
          max-width: 100%;
          height: auto;
        }
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
      }
      h1, h2, h3 {
        color: #333;
      }
    `,
    removeAfterPrint: true,
    onAfterPrint: () => {
      // Clean up any temporary elements
      const tempElements = document.querySelectorAll('.temp-print-container');
      tempElements.forEach(el => el.remove());
      setShowPrintDialog(false);
    }
  });
  
  // Function to handle the Save & Print action
  const handleSaveAndPrint = useCallback((testId: string) => {
    try {
      const test = samples.find(s => s.testId === testId);
      if (!test) {
        console.error('Test not found');
        return;
      }

      // Update the current test with the latest data
      const updatedTest = {
        ...test,
        collected: true,
        collectedAt: test.collectedAt || new Date(),
        collectedBy: test.collectedBy || technicianName || 'System',
        notes: test.notes || 'Sample collected'
      };
      
      // Update the current test state
      setCurrentTest(updatedTest);
      
      // Update the samples array to keep it in sync
      setSamples(prevSamples => 
        prevSamples.map(s => 
          s.testId === test.testId ? updatedTest : s
        )
      );
      
      // Show the print dialog after a small delay to ensure state is updated
      setTimeout(() => {
        try {
          setShowPrintDialog(true);
        } catch (error) {
          console.error('Error showing print dialog:', error);
          // Optionally show an error message to the user
          // You can use a toast notification here if you have one
        }
      }, 100);
    } catch (error) {
      console.error('Error in save and print:', error);
      // Optionally show an error message to the user
      // You can use a toast notification here if you have one
    }
  }, [samples, technicianName]);
  
  // Function to handle the print button in the dialog
  const handlePrintFromDialog = useCallback(() => {
    try {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        try {
          if (!printRef.current) {
            console.error('Print content not found');
            return;
          }
          handlePrint();
        } catch (error) {
          console.error('Error during printing:', error);
          // Optionally show an error message to the user
        }
      }, 100);
    } catch (error) {
      console.error('Error in print dialog:', error);
      // Optionally show an error message to the user
    }
  }, [handlePrint]);

  // Get test configurations from the external module
  const testConfigurations = extTestConfigs;
  
  // Print dialog component
  const PrintDialog = () => {
    if (!showPrintDialog || !currentTest) return null;

    // Get the current test configuration
    const testConfig = testConfigurations[currentTest.testId as keyof typeof testConfigurations];
    const testParameters = parameters;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Print Test Report</h3>
            <button 
              onClick={() => setShowPrintDialog(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 overflow-auto flex-1 print-dialog-content">
            <div ref={printRef} className="bg-white p-6 print:p-0">
              <div className="print-header mb-6">
                <img 
                  src="/letetrheadheader.png" 
                  alt="Hospital Letterhead" 
                  className="w-full h-auto max-h-32 object-contain print:max-h-40 print:mb-4"
                />
              </div>
              <Letterhead hospital={hospitalData}>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                    <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold">Patient Details</h3>
                      <p>Name: {patient?.name}</p>
                      <p>Age: {patient?.age} {patient?.gender}</p>
                      <p>ID: {patient?.id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Test Information</h3>
                      <p>Test: {currentTest.testName}</p>
                      <p>Collected By: {currentTest.collectedBy}</p>
                      <p>Collected At: {currentTest.collectedAt?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-b py-4 my-4">
                    <h3 className="font-semibold mb-2">Test Results</h3>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Parameter</th>
                          <th className="border p-2 text-left">Result</th>
                          <th className="border p-2 text-left">Unit</th>
                          <th className="border p-2 text-left">Reference Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testConfig?.fields?.map((field: any) => {
                          const param = Object.values(testParameters).find(p => p.id === field.id);
                          return (
                            <tr key={field.id} className="border-b">
                              <td className="border p-2">{field.label}</td>
                              <td className="border p-2">{param?.value || '-'}</td>
                              <td className="border p-2">{field.unit || '-'}</td>
                              <td className="border p-2">{field.refRange || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-600">
                    <p>Notes: {currentTest.notes || 'No additional notes'}</p>
                    <p className="mt-4">This is a computer-generated report and does not require a signature.</p>
                  </div>
                </div>
              </Letterhead>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPrintDialog(false)}
            >
              Close
            </Button>
            <Button 
              onClick={handlePrintFromDialog}
              className="bg-primary"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Patient not found state
  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Patient not found</CardTitle>
            <CardDescription>
              We couldn't find the patient you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[99vw] -mx-4">
      <div className="flex items-center justify-between px-4 py-1.5 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Sample Collection</h1>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          <span>{samples.filter(s => s.collected).length} of {samples.length} tests collected</span>
        </div>
      </div>

      {/* Patient Info */}
      <Card className="mb-4 mx-4 mt-2">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{patient.name}</CardTitle>
              <CardDescription>
                ID: {patient.hospitalId || patient.id} • {patient.age} years • {patient.gender}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 px-4 mt-2">
        {/* Test List */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ordered Tests</CardTitle>
              <CardDescription>Select a test to record results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {samples.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tests ordered</p>
                ) : (
                  samples.map((sample) => (
                    <div
                      key={sample.testId}
                      onClick={() => handleTestSelect(sample.testId)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTestId === sample.testId
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sample.testName}</p>
                          <p className="text-xs text-muted-foreground">
                            {sample.sampleType} • {sample.container}
                          </p>
                        </div>
                        {sample.collected ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Details */}
        <div className="xl:col-span-10 pb-4">
          {selectedTest ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedTest.testName}</CardTitle>
                <CardDescription>
                  {selectedTest.sampleType} • {selectedTest.container}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto w-full text-sm">
                  <TestParameterTable
                    parameters={parameters}
                    onParameterChange={(id, field, value) => {
                      setParameters(prev => ({
                        ...prev,
                        [id]: { ...prev[id], [field]: value }
                      }));
                    }}
                    className="compact-table"
                    rowHeight={32}
                    headerHeight={36}
                  />
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => toggleSampleCollected(selectedTest.testId)}
                    variant={selectedTest.collected ? 'outline' : 'default'}
                    className="flex-1"
                  >
                    {selectedTest.collected ? 'Mark as Not Collected' : 'Mark as Collected'}
                  </Button>
                  {selectedTest.collected && (
                    <Button
                      onClick={() => handleSaveAndPrint(selectedTest.testId)}
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Save & Print
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Test Selected</CardTitle>
                <CardDescription>Select a test from the list to view details</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>

      {/* Print content */}
      <div className="hidden">
        <div ref={printRef} className="print-content p-8">
          {/* Print content will be rendered by the PrintDialog component */}
          <h2 className="text-xl font-bold mb-4">Test Report</h2>
          <p><strong>Patient Name:</strong> {patient.name}</p>
          <p><strong>Patient ID:</strong> {patient.hospitalId || patient.id}</p>
          <p><strong>Age:</strong> {patient.age} years</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          
          {/* Add test results or other content here */}
        </div>
      </div>
    </div>
  );
};

export default SampleCollectionV2;
