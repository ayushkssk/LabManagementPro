import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, ClipboardList, XCircle } from 'lucide-react';
import TestForm from '@/modules/tests/TestForm';
import { sampleTests as extSampleTests, testConfigurations as extTestConfigs, testConfigByTestId as extConfigMap } from '@/modules/tests/config';
import { Loader2 } from 'lucide-react';
import { getPatient, PatientData } from '@/services/patientService';

// Use shared tests meta from reusable module
const sampleTests = extSampleTests;

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

interface TestConfiguration {
  [key: string]: {
    fields: FieldConfig[];
  };
}

const SampleCollection = () => {
  // Hooks must be called unconditionally at the top level
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  // State hooks
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicianName, setTechnicianName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testValues, setTestValues] = useState<Record<string, string>>({});

  // Auto-select first test if none selected
  useEffect(() => {
    if (samples.length > 0 && !selectedTestId) {
      setSelectedTestId(samples[0].testId);
    }
  }, [samples, selectedTestId]);;

  // Derived state
  const selectedTest = selectedTestId ? samples.find(test => test.testId === selectedTestId) : null;
  const filteredSamples = searchQuery
    ? samples.filter(sample =>
      sample.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.sampleType.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : samples;

  // Type guards
  const isSelectField = (field: FieldConfig): field is SelectField => field.type === 'select';
  const isNumberField = (field: FieldConfig): field is NumberField => field.type === 'number';
  const isDateTimeField = (field: FieldConfig): field is DateTimeField => field.type === 'datetime-local';;

  // Real patient fetched from Firestore using the document ID in the route
  const [patient, setPatient] = useState<PatientData | null>(null);


  // Initialize samples from patient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!patientId) return;
        // Fetch patient by Firestore document ID
        const p = await getPatient(patientId);
        if (!p) {
          throw new Error('Patient not found');
        }
        setPatient(p);

        const selectedIds = p.tests || [];
        // Keep only tests that we have configurations/meta for
        const selectedTests = sampleTests.filter(test => selectedIds.includes(test.id));

        // Map to the required sample format
        const orderedSamples = selectedTests.map(test => ({
          testId: test.id,
          testName: test.name,
          sampleType: test.sampleType,
          container: test.container,
          instructions: test.instructions,
          collected: false,
          notes: ''
        }));

        setSamples(orderedSamples);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patient data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const toggleSampleCollected = (testId: string) => {
    setSamples(prevSamples =>
      prevSamples.map(sample =>
        sample.testId === testId
          ? {
            ...sample,
            collected: !sample.collected,
            collectedAt: !sample.collected ? new Date() : undefined,
            collectedBy: !sample.collected ? technicianName : undefined,
            notes: !sample.collected && !sample.notes ? 'Sample collected successfully' : sample.notes
          }
          : sample
      )
    );
  };

  const autoFillAllSamples = () => {
    // Set technician name if empty
    if (!technicianName) {
      setTechnicianName('Dr. Priya Patel');
    }

    // Mark all samples as collected with sample notes
    setSamples(prevSamples =>
      prevSamples.map((sample, index) => ({
        ...sample,
        collected: true,
        collectedAt: new Date(),
        collectedBy: technicianName || 'Dr. Priya Patel',
        notes: sample.notes || `Sample collected at ${new Date().toLocaleTimeString()}. ${index % 2 === 0 ? 'No issues during collection.' : 'Slight hemolysis noted.'}`
      }))
    );

    setIsAutoFilled(true);

    toast({
      title: 'Auto-Fill Complete',
      description: 'All samples have been marked as collected with sample data.',
      variant: 'default',
    });
  };

  const clearAllSamples = () => {
    setSamples(prevSamples =>
      prevSamples.map(sample => ({
        ...sample,
        collected: false,
        collectedAt: undefined,
        collectedBy: undefined,
        notes: ''
      }))
    );
    setIsAutoFilled(false);
  };

  const updateSampleNotes = (testId: string, notes: string) => {
    setSamples(prevSamples =>
      prevSamples.map(sample =>
        sample.testId === testId
          ? { ...sample, notes }
          : sample
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!technicianName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your name as the collecting technician.',
        variant: 'destructive',
      });
      return;
    }

    const collectedSamples = samples.filter(s => s.collected);
    if (collectedSamples.length === 0) {
      toast({
        title: 'No Samples Collected',
        description: 'Please mark at least one sample as collected.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would submit this data to your API
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: `Sample collection recorded for ${collectedSamples.length} test(s).`,
        variant: 'default',
      });

      // Navigate back to patient list or dashboard
      navigate('/lab/patients');

    } catch (error) {
      console.error('Error submitting sample collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sample collection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use shared test configurations from module
  const testConfigurations = extTestConfigs;

  // Map selected demo test IDs to the corresponding configuration keys above
  const testConfigByTestId = extConfigMap;

  // Get current test configuration using the mapping
  const currentTestConfig = selectedTest
    ? testConfigurations[testConfigByTestId[selectedTest.testId] as keyof typeof testConfigurations]
    : null;

  const handleTestValueChange = (fieldId: string, value: any) => {
    setTestValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSaveTest = () => {
    if (!selectedTest) return;

    // Mark test as collected
    toggleSampleCollected(selectedTest.testId);

    // Reset form
    setTestValues({});

    // Move to next test if available
    const currentIndex = samples.findIndex(test => test.testId === selectedTestId);
    if (currentIndex < samples.length - 1) {
      setSelectedTestId(samples[currentIndex + 1].testId);
    }

    toast({
      title: 'Test Saved',
      description: `Results for ${selectedTest.testName} have been saved.`,
      variant: 'default',
    });
  };

  return (
    <div className="mx-auto p-0 max-w-full space-y-4">
      {/* Patient Info Header */}
      <div className="bg-white shadow-sm rounded-none p-1.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{patient?.name || 'Patient'}</h3>
              <p className="text-sm text-muted-foreground">Patient ID: {patient?.hospitalId || patient?.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Age / Gender</p>
              <p className="font-medium">{patient?.age ?? '-'} years / {patient?.gender ?? '-'}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Referred By</p>
              <p className="font-medium">{(patient as any)?.doctor || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Sample Collection</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={clearAllSamples} disabled={isSubmitting}>
              <XCircle className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={autoFillAllSamples} disabled={isSubmitting || isAutoFilled}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Auto-Fill All
            </Button>
          </div>
        </div>

        {/* Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Left Sidebar - Test List - More compact */}
          <div className="lg:col-span-2 w-full">
            <Card className="w-full">
              <CardHeader className="p-1.5">
                <CardTitle className="text-xs">Ordered Tests</CardTitle>
                <CardDescription className="text-[10px] line-clamp-1">Select test</CardDescription>
              </CardHeader>
              <CardContent className="p-1.5">
                <div className="space-y-2">
                  {samples.map((sample) => (
                    <div
                      key={sample.testId}
                      onClick={() => setSelectedTestId(sample.testId)}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors text-xs ${selectedTestId === sample.testId
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-xs">{sample.testName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{sample.sampleType} • {sample.container}</p>
                        </div>
                        {sample.collected ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : selectedTestId === sample.testId ? (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Test Details - Larger Card */}
          <div className="lg:col-span-10 space-y-4">
            {selectedTest ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTest.testName}</CardTitle>
                  <CardDescription>
                    {selectedTest.sampleType} • {selectedTest.container}
                    {selectedTest.instructions && (
                      <span> • {selectedTest.instructions}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-1.5">
                  {currentTestConfig ? (
                    <div className="space-y-2">
                      <TestForm
                        fields={currentTestConfig.fields}
                        values={testValues}
                        onChange={handleTestValueChange}
                      />

                      <div className="pt-3 border-t mt-3">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          Additional Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={testValues.notes || ''}
                          onChange={(e) => handleTestValueChange('notes', e.target.value)}
                          placeholder="Add any additional notes or observations"
                          className="mt-2"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setTestValues({})}
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSaveTest}
                        >
                          {selectedTest.collected ? 'Update Results' : 'Save Results'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No configuration found for this test.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Test Selected</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Select a test from the list to view and record results.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleCollection;
