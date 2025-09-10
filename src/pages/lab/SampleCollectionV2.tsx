import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [printWithLetterhead, setPrintWithLetterhead] = useState(true);
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
    setSamples(prevSamples =>
      prevSamples.map(sample =>
        sample.testId === testId
          ? {
              ...sample,
              collected: !sample.collected,
              collectedAt: !sample.collected ? new Date() : undefined,
              collectedBy: !sample.collected ? technicianName : undefined,
              notes: !sample.collected && !sample.notes ? 'Sample collected' : sample.notes
            }
          : sample
      )
    );
    
    // If marking as collected, show a success message
    const test = samples.find(s => s.testId === testId);
    if (test && !test.collected) {
      toast({
        title: 'Sample Collected',
        description: `${test.testName} has been marked as collected.`,
        variant: 'default',
      });
    }
  }, [technicianName, samples]);

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
            <Button variant="outline" size="sm">
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
                    onNotesChange={(id, notes) => {
                      setParameters(prev => ({
                        ...prev,
                        [id]: { ...prev[id], notes }
                      }));
                    }}
                    className="compact-table"
                    rowHeight={32}
                    headerHeight={36}
                  />
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => toggleSampleCollected(selectedTest.testId)}
                    variant={selectedTest.collected ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {selectedTest.collected ? 'Mark as Not Collected' : 'Mark as Collected'}
                  </Button>
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
    </div>
  );
};

export default SampleCollectionV2;
