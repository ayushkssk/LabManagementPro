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
import TestForm from '@/modules/tests/TestForm';
import { sampleTests as extSampleTests, testConfigurations as extTestConfigs, testConfigByTestId as extConfigMap } from '@/modules/tests/config';
import { Loader2 } from 'lucide-react';
import { getPatient, PatientData } from '@/services/patientService';
import { demoTests } from '@/data/demoData';
import { Letterhead, letterheadStyles } from '@/components/letterhead/Letterhead';
import { useHospitalLetterhead } from '@/hooks/useHospitalLetterhead';

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
  const [showPrintView, setShowPrintView] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [lastSavedTest, setLastSavedTest] = useState<Sample | null>(null);
  const [printWithLetterhead, setPrintWithLetterhead] = useState<boolean>(true);
  const { hospital: hospitalData } = useHospitalLetterhead();

  // Read letterhead enabled flag from saved profile (as set in HospitalProfile)
  const letterheadEnabled = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('hospitalProfile');
      if (!saved) return true; // default enabled
      const s = JSON.parse(saved);
      return s?.settings?.letterHeadEnabled !== false;
    } catch {
      return true;
    }
  }, []);

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

        // Build ordered samples for ALL selected IDs.
        const orderedSamples = selectedIds.map(testId => {
          // Try to find rich meta first (with sampleType/container/instructions)
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
            } as Sample;
          }

          // Fallback: find in demoTests to at least get the name
          const fallback = demoTests.find(t => t.id === testId);
          return {
            testId,
            testName: fallback?.name || `Test ${testId}`,
            sampleType: 'Blood',
            container: 'Standard',
            instructions: '',
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

  // Build a generic fallback configuration if a test does not have a specific config mapping
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
    ] as FieldConfig[],
  });

  // Get current test configuration using the mapping, or generic fallback
  const currentTestConfig = selectedTest
    ? (testConfigurations[
        testConfigByTestId[selectedTest.testId] as keyof typeof testConfigurations
      ] || buildGenericConfig(selectedTest.testName))
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
    setLastSavedTest(selectedTest);

    // Reset form
    setTestValues({});

    // Show print options
    setShowPrintOptions(true);

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

  const handlePrintReport = (e: React.MouseEvent, withLetterhead: boolean = true) => {
    e.preventDefault();
    const finalWithLetterhead = withLetterhead && letterheadEnabled && !!hospitalData;
    setPrintWithLetterhead(finalWithLetterhead);
    setShowPrintView(true);
    setShowPrintOptions(false);
    
    // Add a small delay to ensure the print view is rendered
    setTimeout(() => {
      window.print();
      // Reset after a short delay to allow print dialog to appear
      setTimeout(() => setShowPrintView(false), 1000);
    }, 100);
  };

  // Print styles
  const printStyles = `
    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
      }
      
      body * {
        visibility: hidden;
      }
      
      .print-section,
      .print-section * {
        visibility: visible;
      }
      
      .print-section {
        position: relative;
        width: 100%;
        max-width: 210mm;
        margin: 0 auto;
        padding: 0;
        background: white;
        box-shadow: none;
      }
      
      .print-only {
        display: block !important;
      }
      
      .no-print {
        display: none !important;
      }
      
      .report-content {
        padding: 10mm;
        margin: 0 auto;
        max-width: 180mm;
      }
      
      h1 {
        font-size: 18pt !important;
        margin: 5mm 0 3mm 0 !important;
        color: #1a1a1a;
        text-align: center;
      }
      
      h2 {
        font-size: 14pt !important;
        margin: 4mm 0 3mm 0 !important;
        color: #2c3e50;
        border-bottom: 1px solid #eee;
        padding-bottom: 2mm;
      }
      
      p, td, th, span, div {
        font-size: 10pt !important;
        color: #333;
      }
      
      table {
        width: 100% !important;
        margin: 3mm 0 !important;
        border-collapse: collapse;
        page-break-inside: avoid;
      }
      
      th, td {
        padding: 2mm 3mm !important;
        border: 1px solid #ddd !important;
        vertical-align: top;
      }
      
      th {
        background-color: #f8f9fa !important;
        font-weight: 600;
        text-align: left;
      }
      
      .signature-section {
        margin-top: 10mm;
        page-break-inside: avoid;
        display: flex;
        justify-content: space-between;
      }
      
      .signature-box {
        width: 45%;
        margin-top: 15mm;
        text-align: center;
      }
      
      .signature-line {
        border-top: 1px solid #000;
        width: 80%;
        margin: 15mm auto 2mm;
        text-align: center;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      @page :first {
        margin-top: 0;
      }
      
      @media print {
        html, body {
          height: 99%;
        }
      }
    }
    
    ${letterheadStyles}
  `;

  return (
    <div className="mx-auto p-0 max-w-full space-y-4">
      {/* Print Options Modal */}
      {showPrintOptions && lastSavedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Print Options</h3>
              <button 
                onClick={() => setShowPrintOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-4">How would you like to print the report for <strong>{lastSavedTest.testName}</strong>?</p>
            <div className="space-y-3">
              <button
                onClick={(e) => handlePrintReport(e, true)}
                disabled={!letterheadEnabled || !hospitalData}
                className={`w-full py-2 px-4 rounded transition-colors ${(!letterheadEnabled || !hospitalData)
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                title={!letterheadEnabled ? 'Letterhead is disabled in settings' : (!hospitalData ? 'No letterhead data available' : 'Print with Letterhead')}
              >
                Print with Letterhead
              </button>
              <button
                onClick={(e) => handlePrintReport(e, false)}
                className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
              >
                Print without Letterhead
              </button>
              <button
                onClick={() => setShowPrintOptions(false)}
                className="w-full text-gray-600 py-2 px-4 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View */}
      {showPrintView && patient && (
        <div className="print-section">
          <style>{printStyles}</style>
          {printWithLetterhead && hospitalData ? (
            <Letterhead 
              hospital={hospitalData}
              className="print-only"
            >
              <div className="report-content">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                  <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 border-b pb-1">Patient Details</h2>
                    <div className="space-y-1">
                      <p><span className="font-medium">Name:</span> {patient.name}</p>
                      <p><span className="font-medium">Patient ID:</span> {patient.hospitalId || patient.id}</p>
                      <p><span className="font-medium">Age/Gender:</span> {patient.age} years / {patient.gender}</p>
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
                  <p className="mt-1">© {new Date().getFullYear()} {hospitalData?.name || 'Laboratory'}. All rights reserved.</p>
                </div>
              </div>
            </Letterhead>
          ) : (
            <div className="print-only">
              <div className="report-content">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Laboratory Test Report</h1>
                  <p className="text-muted-foreground">Report Date: {new Date().toLocaleDateString()}</p>
                </div>
                {/* Rest of the report content without letterhead */}
                {patient && (
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <h2 className="text-lg font-semibold mb-2 border-b pb-1">Patient Details</h2>
                      <div className="space-y-1">
                        <p><span className="font-medium">Name:</span> {patient.name}</p>
                        <p><span className="font-medium">Patient ID:</span> {patient.hospitalId || patient.id}</p>
                        <p><span className="font-medium">Age/Gender:</span> {patient.age} years / {patient.gender}</p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold mb-2 border-b pb-1">Report Information</h2>
                      <div className="space-y-1">
                        <p><span className="font-medium">Report ID:</span> RPT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</p>
                        <p><span className="font-medium">Collection Time:</span> {new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Add the rest of the report content here */}
              </div>
            </div>
          )}
        </div>
      )}
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
            <Button 
              onClick={autoFillAllSamples} 
              disabled={isSubmitting || isAutoFilled}
              className="no-print"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Auto-Fill All
            </Button>
            <Button 
              onClick={handlePrintReport}
              disabled={samples.every(s => !s.collected)}
              variant="outline"
              className="no-print"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Report
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
