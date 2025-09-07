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
import { Loader2 } from 'lucide-react';
import { getPatient } from '@/services/patientService';
import { demoPatients } from '@/data/demoData';
import type { Patient } from '@/types';
import type { PatientData } from '@/services/patientService';

// Define our local patient state
interface PatientState {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  doctor: string;
  address?: string;
  tests: string[];
}

// Import test data from demo data
const sampleTests = [
  {
    id: 'test-1',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Lavender Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-2',
    name: 'Differential Leukocyte Count (DLC)',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Lavender Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-3',
    name: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Lavender Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-4',
    name: 'Peripheral Smear Examination',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Lavender Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-5',
    name: 'Absolute Eosinophil Count (AEC)',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Lavender Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-6',
    name: 'Reticulocyte Count',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Lavender Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-7',
    name: 'Coagulation Profile',
    category: 'Hematology',
    sampleType: 'Blood',
    container: 'Blue Top',
    instructions: 'Fasting not required'
  },
  {
    id: 'test-8',
    name: 'Blood Sugar Tests',
    category: 'Biochemistry',
    sampleType: 'Blood',
    container: 'Gray Top',
    instructions: 'Fasting required (8-12 hours)'
  },
  {
    id: 'test-9',
    name: 'Kidney Function Test (KFT)',
    category: 'Biochemistry',
    sampleType: 'Blood',
    container: 'Red Top',
    instructions: 'Fasting required (8-12 hours)'
  },
  {
    id: 'test-10',
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    sampleType: 'Blood',
    container: 'Red Top',
    instructions: 'Fasting required (8-12 hours)'
  }
];

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
  const isDateTimeField = (field: FieldConfig): field is DateTimeField => field.type === 'datetime-local';

  // Initialize patient state with default values
  const [patient, setPatient] = useState<PatientState>({
    id: patientId || 'demo-patient',
    name: '',
    age: 0,
    gender: 'Male',
    phone: '',
    address: '',
    doctor: '',
    tests: []
  });

  // Initialize samples from patient data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!patientId) {
          throw new Error('No patient ID provided');
        }

        // First try to find in demo data
        const demoPatient = demoPatients.find(p => p.id === patientId);
        
        // If we have a demo patient, use their data
        if (demoPatient) {
          const selectedTestIds = demoPatient.testsSelected || [];
          
          if (selectedTestIds.length === 0) {
            toast({
              title: 'No Tests Found',
              description: 'No tests were found for this patient.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }

          // Filter sample tests to only include the ones selected for this patient
          const selectedTests = sampleTests.filter(test => 
            selectedTestIds.includes(test.id)
          );

          if (selectedTests.length === 0) {
            toast({
              title: 'Test Data Mismatch',
              description: 'The tests ordered for this patient could not be found in the system.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }

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
          setPatient({
            id: demoPatient.id,
            name: demoPatient.name,
            age: demoPatient.age,
            gender: demoPatient.gender,
            phone: demoPatient.phone,
            doctor: demoPatient.doctor || '',
            tests: selectedTestIds,
            address: ''
          });
          setIsLoading(false);
          return;
        }

        // If no demo patient, try to get from Firestore
        try {
          const patientData = await getPatient(patientId);
          
          if (!patientData) {
            throw new Error('Patient not found in database');
          }
          
          const selectedTestIds = patientData.tests || [];
          
          if (selectedTestIds.length === 0) {
            toast({
              title: 'No Tests Found',
              description: 'No tests were found for this patient in the database.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }

          // Filter sample tests to only include the ones selected for this patient
          const selectedTests = sampleTests.filter(test => 
            selectedTestIds.includes(test.id)
          );

          if (selectedTests.length === 0) {
            toast({
              title: 'Test Data Mismatch',
              description: 'The tests ordered for this patient could not be found in the system.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
          }

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
          setPatient({
            id: demoPatient.id,
            name: demoPatient.name,
            age: demoPatient.age,
            gender: demoPatient.gender,
            phone: demoPatient.phone,
            doctor: demoPatient.doctor,
            address: '',
            tests: demoPatient.testsSelected
          });
          return;
        }

        // If we have patient data from Firestore
        const selectedTestIds = patientData.tests || [];

        if (selectedTestIds.length === 0) {
          toast({
            title: 'No Tests Found',
            description: 'No tests were found for this patient.',
            variant: 'destructive',
          });
          return;
        }

        // Filter sample tests to only include the ones selected for this patient
        const selectedTests = sampleTests.filter(test => 
          selectedTestIds.includes(test.id)
        );

        if (selectedTests.length === 0) {
          toast({
            title: 'Test Data Mismatch',
            description: 'The tests ordered for this patient could not be found in the system.',
            variant: 'destructive',
          });
          return;
        }

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
        setPatient({
          id: patientData.id || patientId || 'unknown',
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
          phone: patientData.phone,
          address: '',
          doctor: '',
          tests: selectedTestIds
        });
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId, navigate]);

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

  // Test configuration with required fields
  const testConfigurations: TestConfiguration = {
    blood_cbc: {
      fields: [
        { id: 'hemoglobin', label: 'Hemoglobin', type: 'number', unit: 'g/dL', refRange: '12.0 - 17.5', required: true },
        { id: 'rbc', label: 'RBC Count', type: 'number', unit: 'million/μL', refRange: '4.5 - 5.9', required: true },
        { id: 'wbc', label: 'WBC Count', type: 'number', unit: 'cells/μL', refRange: '4,000 - 11,000', required: true },
        { id: 'platelets', label: 'Platelet Count', type: 'number', unit: 'lakhs/μL', refRange: '1.5 - 4.5', required: true },
        { id: 'hct', label: 'Hematocrit', type: 'number', unit: '%', refRange: '36 - 48', required: false },
        { id: 'mcv', label: 'MCV', type: 'number', unit: 'fL', refRange: '80 - 100', required: false },
      ]
    },
    blood_glucose: {
      fields: [
        { id: 'glucose', label: 'Glucose Level', type: 'number', unit: 'mg/dL', refRange: 'Fasting: 70-100\nPost Prandial: <140', required: true },
        { id: 'fasting', label: 'Fasting Status', type: 'select', options: ['Fasting', 'Non-Fasting'], required: true },
        { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: true },
      ]
    },
    lipid_profile: {
      fields: [
        { id: 'total_cholesterol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', refRange: '< 200', required: true },
        { id: 'hdl', label: 'HDL', type: 'number', unit: 'mg/dL', refRange: '> 40 (Men)\n> 50 (Women)', required: true },
        { id: 'ldl', label: 'LDL', type: 'number', unit: 'mg/dL', refRange: '< 100 (Optimal)', required: true },
        { id: 'triglycerides', label: 'Triglycerides', type: 'number', unit: 'mg/dL', refRange: '< 150', required: true },
        { id: 'fasting', label: 'Fasting Status', type: 'select', options: ['Fasting', 'Non-Fasting'], required: true },
      ]
    },
    urine_analysis: {
      fields: [
        { id: 'color', label: 'Color', type: 'select', options: ['Yellow', 'Pale Yellow', 'Dark Yellow', 'Amber', 'Other'], required: true },
        { id: 'appearance', label: 'Appearance', type: 'select', options: ['Clear', 'Slightly Cloudy', 'Cloudy', 'Turbid'], required: true },
        { id: 'specific_gravity', label: 'Specific Gravity', type: 'number', step: '0.001', min: '1.000', max: '1.050', refRange: '1.005 - 1.030', required: true },
        { id: 'ph', label: 'pH', type: 'number', step: '0.1', min: '4.5', max: '8.0', refRange: '4.5 - 8.0', required: true },
        { id: 'glucose', label: 'Glucose', type: 'number', unit: 'mg/dL', refRange: 'Negative', required: false },
        { id: 'protein', label: 'Protein', type: 'number', unit: 'mg/dL', refRange: 'Negative', required: false },
      ]
    },
    thyroid_tsh: {
      fields: [
        { id: 'tsh', label: 'TSH', type: 'number', unit: 'μIU/mL', refRange: '0.4 - 4.0', step: '0.01', required: true },
        { id: 'free_t3', label: 'Free T3', type: 'number', unit: 'pg/mL', refRange: '2.3 - 4.2', step: '0.01', required: false },
        { id: 'free_t4', label: 'Free T4', type: 'number', unit: 'ng/dL', refRange: '0.8 - 1.8', step: '0.01', required: false },
        { id: 'sample_time', label: 'Sample Collection Time', type: 'datetime-local', required: true },
      ]
    }
  } as const;

  // Get current test configuration
  const currentTestConfig = selectedTest ? testConfigurations[selectedTest.testId as keyof typeof testConfigurations] : null;

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
              <h3 className="text-lg font-semibold">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">Patient ID: {patient.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Age / Gender</p>
              <p className="font-medium">{patient.age} years / {patient.gender}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Referred By</p>
              <p className="font-medium">{patient.doctor}</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentTestConfig.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <div className="flex items-baseline justify-between">
                              <Label htmlFor={field.id}>
                                {field.label}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                              </Label>
                              {field.unit && (
                                <span className="text-xs text-muted-foreground">
                                  Unit: {field.unit}
                                </span>
                              )}
                            </div>
                            {field.refRange && (
                              <div className="text-xs text-muted-foreground mb-2">
                                <span className="font-medium">Ref. Range: </span>
                                <span className="whitespace-pre-line">{field.refRange}</span>
                              </div>
                            )}
                            {isSelectField(field) ? (
                              <Select
                                value={testValues[field.id] || ''}
                                onValueChange={(value) => handleTestValueChange(field.id, value)}
                                required={field.required}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : isNumberField(field) ? (
                              <Input
                                id={field.id}
                                type="number"
                                value={testValues[field.id] || ''}
                                onChange={(e) => handleTestValueChange(field.id, e.target.value)}
                                required={field.required}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                              />
                            ) : isDateTimeField(field) ? (
                              <Input
                                id={field.id}
                                type="datetime-local"
                                value={testValues[field.id] || ''}
                                onChange={(e) => handleTestValueChange(field.id, e.target.value)}
                                required={field.required}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>

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
