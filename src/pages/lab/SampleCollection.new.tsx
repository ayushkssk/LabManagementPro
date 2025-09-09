import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, ClipboardList, Printer, Loader2 } from 'lucide-react';
import { sampleTests, testConfigurations } from '@/modules/tests/config';
import { getPatient } from '@/services/patientService';
import { TestParameterTable } from '@/components/tests/TestParameterTable';
import { useReactToPrint } from 'react-to-print';

// Types
interface SampleTest {
  id: string;
  name: string;
  category: string;
  sampleType: string;
  container: string;
  instructions?: string;
}

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  hospitalId?: string;
}

interface TestParameter {
  [key: string]: string | number | boolean;
}

interface TestEntry {
  testId: string;
  testName: string;
  parameters: TestParameter;
  collected: boolean;
  notes?: string;
}

interface SampleFormData {
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  referringDoctor: string;
  tests: TestEntry[];
}

const initialFormData: SampleFormData = {
  patientId: '',
  patientName: '',
  age: '',
  gender: '',
  phone: '',
  referringDoctor: '',
  tests: [],
};

const SampleCollection: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<SampleFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [activeTestIndex, setActiveTestIndex] = useState<number | null>(null);
  const [patientTests, setPatientTests] = useState<SampleTest[]>([]);

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      
      try {
        const patient = await getPatient(patientId);
        
        // Get the list of test IDs from patient data
        const patientTestIds = patient.tests || [];
        
        // Map test IDs to test details
        const patientTestDetails = patientTestIds
          .map(testId => sampleTests.find(test => test.id === testId))
          .filter((test): test is SampleTest => test !== undefined);
        
        setPatientTests(patientTestDetails);
        
        // Pre-select these tests
        setSelectedTests(patientTestDetails.map(test => test.id));
        
        // Initialize form data with patient details
        setFormData(prev => ({
          ...prev,
          patientId: (patient as any).hospitalId || patient.id || '',
          patientName: patient.name || 'Unknown',
          age: patient.age?.toString() || '',
          gender: patient.gender || '',
          phone: patient.phone || 'Not provided',
          // Initialize test entries for selected tests
          tests: patientTestDetails.map(test => ({
            testId: test.id,
            testName: test.name,
            parameters: {},
            collected: false
          }))
        }));
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patient data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleCollectSample = () => {
    const testsToAdd = sampleTests
      .filter(test => selectedTests.includes(test.id))
      .map(test => ({
        testId: test.id,
        testName: test.name,
        parameters: {},
        collected: false,
      }));

    setFormData(prev => ({
      ...prev,
      tests: [...prev.tests, ...testsToAdd],
    }));
    
    setSelectedTests([]);
    setActiveTestIndex(0);
  };

  const handleParameterChange = (testIndex: number, fieldId: string, value: string) => {
    setFormData(prev => {
      const updatedTests = [...prev.tests];
      const test = { ...updatedTests[testIndex] };
      
      if (!test.parameters) {
        test.parameters = {};
      }
      
      // Update the specific parameter value
      test.parameters[fieldId] = value;
      
      updatedTests[testIndex] = test;
      return { ...prev, tests: updatedTests };
    });
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    pageStyle: `
      @page { 
        size: A4;
        margin: 1cm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    documentTitle: 'SampleCollection',
    onAfterPrint: () => console.log('Printed successfully')
  });

  const handleSubmit = () => {
    // Here you would typically save the data to your backend
    console.log('Submitting form data:', formData);
    toast({
      title: 'Success',
      description: 'Test results saved successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Selected Tests */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-base">Selected Tests</CardTitle>
              <div className="text-xs text-muted-foreground">
                {patientTests.length} test{patientTests.length !== 1 ? 's' : ''} selected
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto px-3 pb-3">
                {patientTests.length > 0 ? (
                  patientTests.map((test, index) => (
                    <div 
                      key={test.id}
                      className={`p-2 rounded border text-sm ${activeTestIndex === index ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
                      onClick={() => setActiveTestIndex(index)}
                    >
                      <div className="font-medium truncate">{test.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {test.sampleType}
                        </span>
                        <span className="truncate">{test.container}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No tests selected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Patient ID</Label>
                <Input value={formData.patientId} disabled />
              </div>
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input value={formData.patientName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input value={formData.age} disabled />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={formData.gender} disabled />
              </div>
              <div className="space-y-2">
                <Label>Referring Doctor</Label>
                <Input 
                  value={formData.referringDoctor}
                  onChange={(e) => setFormData(prev => ({...prev, referringDoctor: e.target.value}))}
                  placeholder="Dr. Smith"
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Selection */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Select Tests</CardTitle>
                <Button 
                  onClick={handleCollectSample}
                  disabled={selectedTests.length === 0}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Collect Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sampleTests.map((test) => (
                <div key={test.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`test-${test.id}`} 
                    checked={selectedTests.includes(test.id) || formData.tests.some(t => t.testId === test.id)}
                    onCheckedChange={() => handleTestToggle(test.id)}
                    disabled={formData.tests.some(t => t.testId === test.id)}
                  />
                  <Label htmlFor={`test-${test.id}`} className="font-normal">
                    {test.name} ({test.sampleType})
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Test Parameters */}
          {formData.tests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                  {formData.tests.map((test, index) => (
                    <Button
                      key={index}
                      variant={activeTestIndex === index ? 'default' : 'outline'}
                      onClick={() => setActiveTestIndex(index)}
                      className="shrink-0"
                    >
                      {test.testName}
                      {test.collected && (
                        <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  ))}
                </div>

            {activeTestIndex !== null && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {formData.tests[activeTestIndex].testName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`collected-${activeTestIndex}`}
                      checked={formData.tests[activeTestIndex].collected}
                      onCheckedChange={(checked) => {
                        const updatedTests = [...formData.tests];
                        updatedTests[activeTestIndex].collected = Boolean(checked);
                        setFormData(prev => ({...prev, tests: updatedTests}));
                      }}
                    />
                    <Label htmlFor={`collected-${activeTestIndex}`} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Sample Collected
                    </Label>
                  </div>
                </div>

                <TestParameterTable
                  parameters={Object.entries(formData.tests[activeTestIndex].parameters || {}).reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: {
                      id: key,
                      name: key,
                      value: String(value),
                      unit: '',
                      normalRange: ''
                    }
                  }), {})}
                  onParameterChange={(id, field, value) => {
                    if (field === 'value') {
                      handleParameterChange(activeTestIndex, id, String(value));
                    }
                  }}
                  onNotesChange={(id, notes) => {
                    const updatedTests = [...formData.tests];
                    updatedTests[activeTestIndex] = {
                      ...updatedTests[activeTestIndex],
                      notes
                    };
                    setFormData(prev => ({ ...prev, tests: updatedTests }));
                  }}
                />

                <div className="space-y-2">
                  <Label htmlFor={`notes-${activeTestIndex}`}>Notes</Label>
                  <Textarea
                    id={`notes-${activeTestIndex}`}
                    value={formData.tests[activeTestIndex].notes || ''}
                    onChange={(e) => {
                      const updatedTests = [...formData.tests];
                      updatedTests[activeTestIndex].notes = e.target.value;
                      setFormData(prev => ({...prev, tests: updatedTests}));
                    }}
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={formData.tests.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={formData.tests.length === 0}
            >
              Save Results
            </Button>
          </div>

          {/* Hidden Report for Printing */}
          <div className="hidden">
            <div ref={reportRef} className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Patient Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Patient ID:</strong> {formData.patientId}</div>
                  <div><strong>Name:</strong> {formData.patientName}</div>
                  <div><strong>Age:</strong> {formData.age}</div>
                  <div><strong>Gender:</strong> {formData.gender}</div>
                  <div><strong>Mobile:</strong> {formData.phone}</div>
                  <div><strong>Referring Doctor:</strong> {formData.referringDoctor}</div>
                </div>
              </div>

              {formData.tests.map((test, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-lg font-semibold mb-2">{test.testName}</h2>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Parameter</th>
                        <th className="border p-2 text-left">Result</th>
                        <th className="border p-2 text-left">Reference Range</th>
                        <th className="border p-2 text-left">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testConfigurations[test.testId]?.fields?.map((field) => (
                        <tr key={field.id}>
                          <td className="border p-2">{field.label}</td>
                          <td className="border p-2">{test.parameters?.[field.id] || '-'}</td>
                          <td className="border p-2">{field.refRange || 'N/A'}</td>
                          <td className="border p-2">{field.unit || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {test.notes && (
                    <div className="mt-2">
                      <p className="font-medium">Notes:</p>
                      <p className="whitespace-pre-line">{test.notes}</p>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-12 flex justify-between">
                <div className="text-center">
                  <div className="border-t-2 border-black w-32 mx-auto"></div>
                  <p>Lab Technician</p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-black w-32 mx-auto"></div>
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleCollection;
