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
import { ArrowLeft, CheckCircle, ClipboardList, XCircle, Printer } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { getPatient, PatientData } from '@/services/patientService';
import { Letterhead } from '@/components/letterhead/Letterhead';
import { useHospitalLetterhead } from '@/hooks/useHospitalLetterhead';

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
  const { hospital: hospitalData } = useHospitalLetterhead();

  // State hooks
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicianName, setTechnicianName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [showPrintView, setShowPrintView] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [hasSavedResults, setHasSavedResults] = useState(false);
  const [printWithLetterhead, setPrintWithLetterhead] = useState(true);

  // Auto-select first test if none selected
  useEffect(() => {
    if (samples.length > 0 && !selectedTestId) {
      setSelectedTestId(samples[0].testId);
    }
  }, [samples, selectedTestId]);

  // Derived state
  const selectedTest = selectedTestId ? samples.find(test => test.testId === selectedTestId) : null;
  const filteredSamples = searchQuery
    ? samples.filter(sample =>
      sample.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.sampleType.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : samples;

  // Initialize with empty samples - will be populated from patient data
  useEffect(() => {
    setIsLoading(false);
  }, []);
  const isSelectField = (field: FieldConfig): field is SelectField => field.type === 'select';
  const isNumberField = (field: FieldConfig): field is NumberField => field.type === 'number';
  const isDateTimeField = (field: FieldConfig): field is DateTimeField => field.type === 'datetime-local';

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

        // Build ordered samples for ALL selected IDs
        const testData = [
          {
            id: 'cbc',
            name: 'Complete Blood Count',
            sampleType: 'Blood',
            container: 'Lavender Top',
            instructions: 'Fasting required'
          },
          {
            id: 'bmp',
            name: 'Basic Metabolic Panel',
            sampleType: 'Serum',
            container: 'SST',
            instructions: 'Fasting required'
          },
          {
            id: 'lipid',
            name: 'Lipid Panel',
            sampleType: 'Serum',
            container: 'SST',
            instructions: '12-hour fasting required'
          }
        ];

        const orderedSamples = selectedIds.map(testId => {
          // Find test data by ID
          const test = testData.find(t => t.id === testId);
          if (test) {
            return {
              testId: test.id,
              testName: test.name,
              sampleType: test.sampleType,
              container: test.container,
              instructions: test.instructions,
              collected: false,
              notes: ''
            } as Sample;
          }
          
          // Fallback for unknown tests
          return {
            testId,
            testName: testId,
            sampleType: 'Unknown',
            container: 'N/A',
            instructions: 'Please collect sample',
            collected: false,
            notes: ''
          } as Sample;
        });

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

  const handlePrintReport = (withLetterhead: boolean) => {
    setPrintWithLetterhead(withLetterhead);
    setShowPrintView(true);
    setShowPrintOptions(false);
    
    // Trigger print after a small delay to ensure the content is rendered
    setTimeout(() => {
      window.print();
      // Reset print view after printing
      setTimeout(() => setShowPrintView(false), 1000);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Test configurations with type safety
  const testConfigurations: TestConfiguration = {
    // Add your test configurations here
    cbc: {
      fields: [
        {
          id: 'wbc',
          label: 'White Blood Cells',
          type: 'number',
          unit: 'x10^9/L',
          refRange: '4.5 - 11.0',
          required: true
        },
        {
          id: 'rbc',
          label: 'Red Blood Cells',
          type: 'number',
          unit: 'x10^12/L',
          refRange: '4.5 - 5.9',
          required: true
        }
      ]
    }
  };

  const configMap: Record<string, keyof typeof testConfigurations> = {
    '1': 'cbc',
    '2': 'cbc',
    '3': 'cbc'
  };

  // Build a generic fallback configuration
  const buildGenericConfig = (testName: string): { fields: FieldConfig[] } => ({
    fields: [
      {
        id: 'result',
        label: `${testName} Result`,
        type: 'select',
        options: ['Normal', 'Abnormal', 'Positive', 'Negative', 'Reactive', 'Non-Reactive'],
        required: false,
      },
      {
        id: 'value',
        label: 'Value',
        type: 'number',
        unit: '',
        refRange: '',
        required: false,
      },
      {
        id: 'sample_time',
        label: 'Sample Collection Time',
        type: 'datetime-local',
        required: false,
      },
    ],
  });

  // Get current test configuration using the mapping, or generic fallback
  const currentTestConfig = selectedTestId
    ? (testConfigurations[
        configMap[selectedTestId] as keyof typeof testConfigurations
      ] || buildGenericConfig(samples.find((s) => s.testId === selectedTestId)?.testName || ''))
    : null;

  const handleTestValueChange = (fieldId: string, value: any) => {
    setTestValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveTest = async () => {
    if (!selectedTestId) return;

    try {
      setIsSubmitting(true);

      // In a real app, you would submit this data to your API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save the test results
      toggleSampleCollected(selectedTestId);
      setTestValues({});
      setHasSavedResults(true);

      // Move to next test
      const currentIndex = samples.findIndex((test) => test.testId === selectedTestId);
      if (currentIndex < samples.length - 1) {
        setSelectedTestId(samples[currentIndex + 1].testId);
      }

      toast({
        title: 'Test Saved',
        description: `Results for ${samples.find((s) => s.testId === selectedTestId)?.testName} have been saved.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving test:', error);
      toast({
        title: 'Error',
        description: 'Failed to save test results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test form component
  const TestForm = ({ fields, values, onChange }: { fields: FieldConfig[]; values: Record<string, string>; onChange: (id: string, value: string) => void }) => (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>
            {field.label} {field.required && <span className="text-destructive">*</span>}
          </Label>
          {isSelectField(field) ? (
            <Select onValueChange={(value) => onChange(field.id, value)} value={values[field.id] || ''}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.id}
              type={field.type}
              value={values[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              min={isNumberField(field) ? field.min : undefined}
              max={isNumberField(field) ? field.max : undefined}
              step={isNumberField(field) ? field.step : undefined}
              required={field.required}
            />
          )}
          {field.unit && <p className="text-sm text-muted-foreground">Unit: {field.unit}</p>}
          {field.refRange && <p className="text-sm text-muted-foreground">Ref. Range: {field.refRange}</p>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto p-0 max-w-full space-y-4">
      {/* Print Options Dialog */}
      {showPrintOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Print Options</h3>
            <p className="text-sm text-muted-foreground mb-6">Choose how you want to print the report</p>

            <div className="space-y-3">
              <Button onClick={() => handlePrintReport(true)} className="w-full justify-start" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print with Letterhead
              </Button>

              <Button onClick={() => handlePrintReport(false)} className="w-full justify-start" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print without Letterhead
              </Button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowPrintOptions(false)} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print View */}
      {showPrintView && patient && hospitalData && (
        <div className="print-section">
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-section, .print-section * {
                  visibility: visible;
                }
                .print-section {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}
          </style>
          {printWithLetterhead ? (
            <Letterhead hospital={hospitalData} className="print-only">
              <div className="report-content">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                  <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
                </div>
                <ReportContent samples={samples} testValues={testValues} patient={patient} hospitalData={hospitalData} />
              </div>
            </Letterhead>
          ) : (
            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
              </div>
              <ReportContent samples={samples} testValues={testValues} patient={patient} hospitalData={hospitalData} />
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="no-print">
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
                      className={`p-1.5 rounded-md cursor-pointer transition-colors text-xs ${
                        selectedTestId === sample.testId
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
            {selectedTestId ? (
              <Card>
                <CardHeader>
                  <CardTitle>{samples.find((s) => s.testId === selectedTestId)?.testName}</CardTitle>
                  <CardDescription>
                    {samples.find((s) => s.testId === selectedTestId)?.sampleType} •{' '}
                    {samples.find((s) => s.testId === selectedTestId)?.container}
                    {samples.find((s) => s.testId === selectedTestId)?.instructions && (
                      <span> • {samples.find((s) => s.testId === selectedTestId)?.instructions}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-1.5">
                  {currentTestConfig ? (
                    <div className="space-y-2">
                      <TestForm fields={currentTestConfig.fields} values={testValues} onChange={handleTestValueChange} />

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
                        <Button type="button" variant="outline" onClick={() => setTestValues({})}>
                          Clear
                        </Button>
                        <Button type="button" onClick={handleSaveTest}>
                          {samples.find((s) => s.testId === selectedTestId)?.collected ? 'Update Results' : 'Save Results'}
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

  // Print styles
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-section, .print-section * {
        visibility: visible;
      }
      .print-section {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  return (
    <div className="mx-auto p-0 max-w-full space-y-4">
      {/* Print Options Dialog */}
      {showPrintOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Print Options</h3>
            <p className="text-sm text-muted-foreground mb-6">Choose how you want to print the report</p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handlePrintReport(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print with Letterhead
              </Button>
              
              <Button 
                onClick={() => handlePrintReport(false)}
                className="w-full justify-start"
                variant="outline"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print without Letterhead
              </Button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setShowPrintOptions(false)}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print View */}
      {showPrintView && patient && hospitalData && (
        <div className="print-section">
          <style>{printStyles}</style>
          {printWithLetterhead ? (
            <Letterhead 
              hospital={hospitalData}
              className="print-only"
            >
              <div className="report-content">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                  <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
                </div>
                <ReportContent 
                  samples={samples}
                  testValues={testValues}
                  patient={patient}
                  hospitalData={hospitalData}
                />
              </div>
            </Letterhead>
          ) : (
            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
              </div>
              <ReportContent 
                samples={samples}
                testValues={testValues}
                patient={patient}
                hospitalData={hospitalData}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="no-print">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Left Sidebar - Test List */}
          <div className="lg:col-span-2 w-full">
            {/* Test list content */}
          </div>
          
          {/* Right Side - Test Details */}
          <div className="lg:col-span-10 space-y-4">
            {/* Test details content */}
          </div>
        </div>
      </div>
    </div>
  );
};

// ReportContent component for displaying the test report
const ReportContent = ({ 
  samples, 
  testValues, 
  patient, 
  hospitalData 
}: {
  samples: Sample[];
  testValues: Record<string, string>;
  patient: PatientData | null;
  hospitalData: any;
}) => (
  <>
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div>
        <h2 className="text-lg font-semibold mb-2 border-b pb-1">Patient Details</h2>
        <div className="space-y-1">
          <p><span className="font-medium">Name:</span> {patient?.name}</p>
          <p><span className="font-medium">Patient ID:</span> {patient?.hospitalId || patient?.id}</p>
          <p><span className="font-medium">Age/Gender:</span> {patient?.age} years / {patient?.gender}</p>
          <p><span className="font-medium">Referred By:</span> {(patient as any)?.doctor || 'N/A'}</p>
          <p><span className="font-medium">Collection Date:</span> {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-2 border-b pb-1">Report Information</h2>
        <div className="space-y-1">
          <p><span className="font-medium">Report ID:</span> RPT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</p>
          <p><span className="font-medium">Collection Time:</span> {new Date().toLocaleTimeString()}</p>
          <p><span className="font-medium">Report Status:</span> Final</p>
          <p><span className="font-medium">Tests Performed:</span> {samples.filter(s => s.collected).length} of {samples.length}</p>
        </div>
      </div>
    </div>

    <div className="border rounded-lg overflow-hidden mb-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {samples.map((sample, index) => (
            <tr key={index} className={sample.collected ? '' : 'opacity-70'}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium">{sample.testName}</div>
                <div className="text-sm text-gray-500">{sample.sampleType} • {sample.container}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {sample.collected ? (testValues[`${sample.testId}_result`] || 'Pending') : 'Not Collected'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {testValues[`${sample.testId}_refRange`] || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${sample.collected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {sample.collected ? 'Completed' : 'Pending'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-8 pt-4 border-t">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">Technician:</p>
          <p className="mt-2">_______________________</p>
          <p className="text-sm text-muted-foreground">Signature & Stamp</p>
        </div>
        <div>
          <p className="font-medium">Authorized By:</p>
          <p className="mt-2">_______________________</p>
          <p className="text-sm text-muted-foreground">Lab Incharge</p>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>This is a computer generated report. No signature is required.</p>
        <p className="mt-1">© {new Date().getFullYear()} {hospitalData?.name || 'LabManagerPro'}. All rights reserved.</p>
      </div>
    </div>
  </>
);

export { ReportContent };
export default SampleCollection;
