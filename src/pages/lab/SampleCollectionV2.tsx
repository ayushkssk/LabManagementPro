import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, ClipboardList, XCircle, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getPatient, PatientData } from '@/services/patientService';
import { testConfigurations, testConfigByTestId, sampleTests as externalSampleTests } from '../../modules/tests/config';
import { TestParameterTable } from '@/components/tests/TestParameterTable';
import { demoTests } from '@/data/demoData';
import { Letterhead, letterheadStyles } from '@/components/letterhead/Letterhead';
import { useHospitalLetterhead } from '@/hooks/useHospitalLetterhead';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';
import { labReportService, LabReport, LabReportParameter } from '@/services/labReportService';

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
  parameters?: { [key: string]: { value: string; notes?: string } };
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
  type?: string;
  options?: string[];
}

// Use shared tests meta from reusable module
const sampleTests = externalSampleTests;

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
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
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
    const configKey = testConfigByTestId[selectedTestId as keyof typeof testConfigByTestId];
    if (!configKey) return;
    
    // Get the configuration for this test
    const config = testConfigurations[configKey as keyof typeof testConfigurations];
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
          // First try to find in extSampleTests (modules/tests/config.ts)
          const testMeta = sampleTests.find(t => t.id === testId);
          if (testMeta) {
            return {
              testId: testMeta.id,
              testName: testMeta.name,
              sampleType: testMeta.sampleType,
              container: testMeta.container,
              instructions: testMeta.instructions,
              collected: false,
              notes: ''
            };
          }
          
          // Then try demoTests as fallback
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
    
    // Initialize parameters for the selected test
    const configKey = testConfigByTestId[testId];
    if (!testConfigByTestId[testId] || !testConfigurations[testConfigByTestId[testId]]) {
      const testConfig = testConfigurations[configKey];
      const initialParams: { [key: string]: TableParam } = {};
      
      testConfig.fields.forEach(field => {
        initialParams[field.id] = {
          id: field.id,
          name: field.label,
          unit: field.unit || '',
          normalRange: field.refRange || '',
          value: '',
          notes: '',
          type: field.type,
          options: field.type === 'select' ? field.options : undefined
        };
      });
      
      setParameters(initialParams);
    }
  }, [selectedTestId]);

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
              notes: !sample.collected && !sample.notes ? 'Sample collected' : sample.notes,
              // Save current parameters when marking as collected
              parameters: !sample.collected ? Object.fromEntries(
                Object.entries(parameters).map(([key, param]) => [
                  key, 
                  { value: param.value || '', notes: param.notes }
                ])
              ) : sample.parameters
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
        notes: 'Sample collected',
        parameters: Object.fromEntries(
          Object.entries(parameters).map(([key, param]) => [
            key, 
            { value: param.value || '', notes: param.notes }
          ])
        )
      });
      
      toast({
        title: 'Sample Collected',
        description: `${test.testName} has been marked as collected.`,
        variant: 'default',
      });
    }
  }, [samples, selectedTest, technicianName, parameters]);

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

  // Handle print with enhanced configuration
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Lab Report - ${patient?.name || 'Patient'} - ${currentTest?.testName || 'Test'}`,
    removeAfterPrint: false,
    pageStyle: `
      @page {
        size: A4;
        margin: 12mm;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          color: #000 !important;
          font-family: Arial, sans-serif !important;
          font-size: 11px !important;
          line-height: 1.3 !important;
        }
        .no-print, button, .print-hide {
          display: none !important;
        }
        .print-container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 8mm !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          page-break-inside: avoid !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 8px 0 !important;
          page-break-inside: avoid !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 4px 6px !important;
          text-align: left !important;
          background: transparent !important;
          font-size: 10px !important;
          vertical-align: top !important;
        }
        th {
          background: #f5f5f5 !important;
          font-weight: bold !important;
        }
        h1, h2, h3 {
          color: #000 !important;
          margin: 8px 0 !important;
          page-break-after: avoid !important;
        }
        .letterhead img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        .qr-code {
          width: 80px !important;
          height: 80px !important;
        }
        .signatures {
          margin-top: 20px !important;
          page-break-inside: avoid !important;
        }
        .footer {
          margin-top: 15px !important;
          font-size: 9px !important;
        }
      }
    `,
    onBeforeGetContent: () => {
      console.log('Preparing print content...');
      // Ensure all images are loaded
      const images = printRef.current?.querySelectorAll('img');
      if (images) {
        const imagePromises = Array.from(images).map(img => {
          return new Promise<void>(resolve => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          });
        });
        return Promise.all(imagePromises).then(() => {});
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('Print completed');
      setShowPrintDialog(false);
    },
    print: async (printIframe) => {
      // Custom print function to ensure proper handling
      return new Promise<void>((resolve) => {
        if (printIframe?.contentWindow) {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        }
        resolve();
      });
    }
  });
  
  // Function to handle the Save & Print action
  const handleSaveAndPrint = useCallback(async (testId: string) => {
    try {
      console.log('=== SAVE & PRINT DEBUG START ===');
      console.log('Save & Print clicked for test:', testId);
      console.log('Current parameters state:', parameters);
      console.log('Parameters keys:', Object.keys(parameters));
      console.log('Parameters values:', Object.values(parameters).map(p => ({ value: p?.value, notes: p?.notes })));
      
      const test = samples.find(s => s.testId === testId);
      if (!test || !patient) {
        console.error('Test or patient not found', { test: !!test, patient: !!patient });
        toast({
          title: 'Error',
          description: 'Test or patient information not found.',
          variant: 'destructive',
        });
        return;
      }

      // Get test configuration for parameter details
      const configKey = testConfigByTestId[testId];
      const testConfig = configKey ? testConfigurations[configKey] : null;
      
      if (!testConfig) {
        console.error('Test configuration not found for:', testId, 'Available configs:', Object.keys(testConfigurations));
        console.error('Config mapping:', testConfigByTestId);
        toast({
          title: 'Error',
          description: `Test configuration not found for ${testId}.`,
          variant: 'destructive',
        });
        return;
      }

      console.log('Test config found:', testConfig);
      console.log('Parameters to process:', Object.keys(parameters).length);

      // Convert parameters to lab report format - include all fields even if empty for now
      const reportParameters: LabReportParameter[] = testConfig.fields
        .map((field: any) => {
          const param = parameters[field.id];
          const value = param?.value || '';
          const isAbnormal = value && field.refRange && !isValueInRange(value, field.refRange);
          console.log(`Field ${field.id} (${field.label}): "${value}"`);
          
          return {
            id: field.id,
            label: field.label,
            value: value,
            unit: field.unit,
            refRange: field.refRange,
            isAbnormal,
            notes: param?.notes
          };
        });

      console.log('Report parameters created:', reportParameters.length);

      // Prepare lab report data
      const reportData = {
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age.toString(),
        patientGender: patient.gender,
        testId: test.testId,
        testName: test.testName,
        parameters: reportParameters,
        collectedAt: test.collectedAt || new Date(),
        reportedAt: new Date(),
        collectedBy: test.collectedBy || technicianName || 'System',
        technicianName: technicianName || 'System',
        status: 'completed' as const
      };

      console.log('About to save report data:', reportData);
      
      // Save to database
      const reportId = await labReportService.saveLabReport(reportData);
      console.log('Report saved with ID:', reportId);
      setSavedReportId(reportId);

      // Update the current test with the latest data
      const updatedTest = {
        ...test,
        collected: true,
        collectedAt: test.collectedAt || new Date(),
        collectedBy: test.collectedBy || technicianName || 'System',
        notes: test.notes || 'Sample collected',
        parameters: Object.fromEntries(
          Object.entries(parameters).map(([key, param]) => [
            key, 
            { value: param.value || '', notes: param.notes }
          ])
        )
      };

      console.log('Updated test with parameters:', updatedTest);
      setCurrentTest(updatedTest);
      
      // Update the samples array to keep it in sync
      setSamples(prevSamples => 
        prevSamples.map(s => 
          s.testId === test.testId ? updatedTest : s
        )
      );

      toast({
        title: 'Report Saved',
        description: 'Lab report has been saved to database successfully.',
        variant: 'default',
      });

      console.log('About to show print dialog');
      // Show print dialog after a brief delay to ensure state updates
      setTimeout(() => {
        console.log('Setting showPrintDialog to true');
        setShowPrintDialog(true);
      }, 100);
    } catch (error) {
      console.error('=== SAVE & PRINT ERROR ===');
      console.error('Error in save and print:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: 'Error',
        description: `Failed to save lab report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
    console.log('=== SAVE & PRINT DEBUG END ===');
  }, [samples, technicianName, patient, parameters]);
  
  // Function to handle the print button in the dialog
  const handlePrintFromDialog = useCallback(() => {
    console.log('Print button clicked');
    if (!printRef.current) {
      console.error('Print content not found');
      return;
    }
    
    try {
      // Get the print content HTML
      const printContent = printRef.current.innerHTML;
      
      // Create a new window/tab for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (!printWindow) {
        console.error('Failed to open print window');
        return;
      }

      // Write the complete HTML document to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lab Report - ${patient?.name || 'Patient'} - ${currentTest?.testName || 'Test'}</title>
          <style>
            @page {
              size: A4;
              margin: 12mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: #000 !important;
              font-family: Arial, sans-serif !important;
              font-size: 11px !important;
              line-height: 1.3 !important;
            }
            
            .print-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 8mm !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              page-break-inside: avoid !important;
            }
            
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 8px 0 !important;
              page-break-inside: avoid !important;
            }
            
            th, td {
              border: 1px solid #000 !important;
              padding: 4px 6px !important;
              text-align: left !important;
              background: transparent !important;
              font-size: 10px !important;
              vertical-align: top !important;
            }
            
            th {
              background: #f5f5f5 !important;
              font-weight: bold !important;
            }
            
            h1, h2, h3 {
              color: #000 !important;
              margin: 8px 0 !important;
              page-break-after: avoid !important;
            }
            
            .letterhead img {
              max-width: 100% !important;
              height: auto !important;
              display: block !important;
            }
            
            .qr-code {
              width: 80px !important;
              height: 80px !important;
            }
            
            .signatures {
              margin-top: 20px !important;
              page-break-inside: avoid !important;
            }
            
            .footer {
              margin-top: 15px !important;
              font-size: 9px !important;
            }
            
            /* Hide any buttons or non-print elements */
            .no-print, button, .print-hide {
              display: none !important;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
          <script>
            // Wait for images to load, then trigger print
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close the window after printing (optional)
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
    } catch (error) {
      console.error('Print error:', error);
    }
  }, [patient, currentTest]);

  // Test configurations are imported directly

  // Helper function to check if value is in range
  const isValueInRange = (value: string, range: string): boolean => {
    if (!value || !range) return true;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return true;
    
    // Handle ranges like "21-40", "0.6-1.1", "2.4-5.7", etc.
    const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      return numValue >= min && numValue <= max;
    }
    
    return true;
  };
  
  // Print dialog component
  const PrintDialog = () => {
    if (!showPrintDialog || !currentTest) return null;

    // Get the current test configuration using the mapping
    const configMap = testConfigByTestId;
    const configKey = configMap[currentTest.testId];
    const testConfig = configKey ? testConfigurations[configKey] : null;
    
    // Get the actual collected test data from samples array
    const collectedTest = samples.find(s => s.testId === currentTest.testId);
    const testParameters = collectedTest?.parameters || parameters;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div ref={printRef} className="print-container">
            <style>{`
              @media print {
                @page {
                  size: A4;
                  margin: 0.5in;
                }
                .print-container {
                  width: 100% !important;
                  max-width: none !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  border-radius: 0 !important;
                }
                .no-print {
                  display: none !important;
                }
                .print-content {
                  font-size: 11px !important;
                  line-height: 1.3 !important;
                  page-break-inside: avoid;
                }
                .print-header img {
                  max-height: 80px !important;
                  width: auto !important;
                }
                .print-table {
                  font-size: 10px !important;
                  border-collapse: collapse !important;
                  width: 100% !important;
                  margin: 8px 0 !important;
                }
                .print-table th,
                .print-table td {
                  padding: 4px 6px !important;
                  border: 1px solid #333 !important;
                }
                .print-footer {
                  margin-top: 12px !important;
                  font-size: 9px !important;
                }
                .print-signatures {
                  margin-top: 16px !important;
                  font-size: 10px !important;
                }
                .print-notes {
                  margin-top: 8px !important;
                  font-size: 9px !important;
                  padding: 6px !important;
                }
                .qr-code {
                  width: 50px !important;
                  height: 50px !important;
                }
                .patient-info {
                  font-size: 10px !important;
                  margin-bottom: 8px !important;
                }
                .test-title {
                  font-size: 12px !important;
                  margin: 8px 0 !important;
                  text-align: center !important;
                  font-weight: bold !important;
                }
              }
            `}</style>
            <div className="p-6 no-print">
              <Button 
                variant="ghost" 
                size="icon" 
                className="float-right"
                onClick={() => setShowPrintDialog(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 print-content">
              <div className="space-y-4">
                {/* Hospital Header */}
                <div className="text-center border-b-2 border-blue-600 pb-4 mb-6 print-header">
                  <div className="w-full mb-4">
                    <img 
                      src="/letetrheadheader.png" 
                      alt="Hospital Letterhead" 
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="bg-blue-600 text-white py-2 px-4 rounded">
                    <h2 className="text-lg font-bold tracking-wider">REPORT</h2>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-3 gap-6 mb-6 text-sm patient-info">
                  <div className="space-y-1">
                    <p><span className="font-semibold">Name:</span> {patient?.name || 'N/A'}</p>
                    <p><span className="font-semibold">Age:</span> {patient?.age || 'N/A'} Year</p>
                    <p><span className="font-semibold">Referred By:</span> {'Dr. SWATI HOSPITAL'}</p>
                  </div>
                  <div className="flex flex-col items-center justify-start">
                    <div>
                      <QRCode
                        value={`https://swatihospital.com/verify-report/${currentTest?.testId || 'unknown'}-${Date.now()}`}
                        size={60}
                        level="M"
                        className="qr-code"
                      />
                    </div>
                    <p className="text-xs font-semibold text-center">SCAN QR FOR VERIFICATION</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p><span className="font-semibold">Sex:</span> {patient?.gender || 'N/A'}</p>
                    <p><span className="font-semibold">Received On:</span> {currentTest?.collectedAt ? new Date(currentTest.collectedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</p>
                    <p><span className="font-semibold">Reported On:</span> {new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                {/* Test Name */}
                <div className="text-center mb-4 test-title">
                  <h3 className="text-lg font-bold text-gray-800">{currentTest.testName?.toUpperCase() || 'LABORATORY TEST'}</h3>
                </div>
                
                {/* Test Results Table */}
                <div className="mb-6">
                  <table className="w-full border-collapse text-sm print-table">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 p-2 text-left font-semibold">Investigation</th>
                        <th className="border border-gray-400 p-2 text-center font-semibold">Result</th>
                        <th className="border border-gray-400 p-2 text-center font-semibold">Units</th>
                        <th className="border border-gray-400 p-2 text-center font-semibold">Ref. Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testConfig?.fields?.filter((field: any) => {
                        // Only show parameters that have values entered
                        const param = testParameters[field.id];
                        return param?.value && param.value.trim() !== '';
                      }).map((field: any) => {
                        const param = testParameters[field.id];
                        const isAbnormal = param?.value && field.refRange && !isValueInRange(param.value, field.refRange);
                        
                        return (
                          <tr key={field.id}>
                            <td className="border border-gray-400 p-2">{field.label}</td>
                            <td className={`border border-gray-400 p-2 text-center font-semibold ${isAbnormal ? 'text-red-600' : ''}`}>
                              {param?.value || '-'} {isAbnormal && (parseFloat(param?.value || '0') > parseFloat(field.refRange?.split('-')[1] || '0') ? '↑' : '↓')}
                            </td>
                            <td className="border border-gray-400 p-2 text-center">{field.unit || '-'}</td>
                            <td className="border border-gray-400 p-2 text-center">{field.refRange || '-'}</td>
                          </tr>
                        );
                      })}
                      {/* Show message if no parameters have values */}
                      {(!testConfig?.fields?.some((field: any) => testParameters[field.id]?.value?.trim())) && (
                        <tr>
                          <td colSpan={4} className="border border-gray-400 p-4 text-center text-gray-500">
                            No test results entered yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="mt-8 flex justify-center items-end text-sm print-signatures">
                  <div className="flex justify-between w-full max-w-4xl">
                    <div className="text-center">
                      <p className="font-bold text-base">Vinit Gaurav</p>
                      <p className="text-xs">DMLT</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-base">Dr Amar Kumar</p>
                      <p className="text-xs">MBBS</p>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="mt-12 bg-blue-50 p-3 text-xs print-notes">
                  <p className="font-semibold mb-1">• Clinical Correlation is essential for Final Diagnosis.</p>
                  <p>• Report for Medico Legal Purpose.</p>
                  <p>• If test results are unexpected, please contact the laboratory</p>
                </div>

                {/* Footer Image */}
                <div className="w-full mt-6 print-footer">
                  <img 
                    src="/letetrheadfooter.png" 
                    alt="Hospital Footer" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
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
                      onClick={() => {
                        console.log('Save & Print button clicked!');
                        console.log('Selected test ID:', selectedTest.testId);
                        handleSaveAndPrint(selectedTest.testId);
                      }}
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

      {/* Print Dialog */}
      <PrintDialog />

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
