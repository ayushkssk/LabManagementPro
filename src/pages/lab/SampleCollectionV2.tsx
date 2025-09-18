import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, ClipboardList, Printer, Plus, Search, Beaker, BadgeCheck, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getPatient, PatientData, addTestToPatient, removeTestFromPatient, markPatientReportPrinted } from '@/services/patientService';
import { testConfigurations, testConfigByTestId, sampleTests as externalSampleTests } from '../../modules/tests/config';
import { TestParameterTable } from '@/components/tests/TestParameterTable';
import { demoTests } from '@/data/demoData';
import { Letterhead, letterheadStyles } from '@/components/letterhead/Letterhead';
import { useHospitalLetterhead } from '@/hooks/useHospitalLetterhead';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';
import { labReportService, LabReport, LabReportParameter, TestDraft } from '@/services/labReportService';
import { useAuth } from '@/context/AuthContext';
import { useHospitals } from '@/context/HospitalContext';
import { generateReportId, generateReportToken, saveReportData, createShareableReportUrl } from '@/utils/reportStorage';
import { LabReportShared, LabReportParameterItem } from '@/components/print/LabReportShared';

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
  const [savedReportToken, setSavedReportToken] = useState<string | null>(null);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [showAddTestDropdown, setShowAddTestDropdown] = useState(false);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  // Recently added tests priority for dropdown ordering
  const recentTestPriority: string[] = [
    'test-bgt-typt-dot',
    'test-stool-routine',
    'test-hb-bg-rbs',
    'test-bsf-bspp',
    'test-hba1c',
    'test-bsf',
    'test-bspp',
    'test-lipid-profile',
    'test-culture-antibiotic-sensitivity',
    'test-urine-routine',
  ];
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSavedData, setLastSavedData] = useState<Record<string, any>>({});
  const { hospital: hospitalData } = useHospitalLetterhead();
  const { user } = useAuth();
  const { hospitals } = useHospitals();
  const hospital = hospitals[0]; // Use first hospital for demo

  // Derived state
  const selectedTest = useMemo(
    () => selectedTestId ? samples.find(test => test.testId === selectedTestId) : null,
    [selectedTestId, samples]
  );

  // Get available tests that are not already added
  const availableTests = useMemo(() => {
    const currentTestIds = samples.map(s => s.testId);
    return sampleTests.filter(test => !currentTestIds.includes(test.id));
  }, [samples]);

  // Sidebar filter for existing samples
  const filteredSamples = useMemo(() => {
    const q = (sidebarSearch || '').trim().toLowerCase();
    if (!q) return samples;
    return samples.filter(s => s.testName.toLowerCase().includes(q));
  }, [samples, sidebarSearch]);

  // Filter available tests based on search query
  const filteredAvailableTests = useMemo(() => {
    const q = (testSearchQuery || '').trim().toLowerCase();
    const base = q
      ? availableTests.filter(test =>
        test.name.toLowerCase().includes(q) ||
        test.category.toLowerCase().includes(q) ||
        test.id.toLowerCase().includes(q)
      )
      : availableTests.slice();
    return base.sort((a, b) => {
      const ia = recentTestPriority.indexOf(a.id);
      const ib = recentTestPriority.indexOf(b.id);
      const aPr = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
      const bPr = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
      if (aPr !== bPr) return aPr - bPr;
      return a.name.localeCompare(b.name);
    });
  }, [availableTests, testSearchQuery]);

  // Load test configuration when selected test changes
  useEffect(() => {
    if (!selectedTestId || !patient) return;

    // Get the test configuration key from the mapping
    const configKey = testConfigByTestId[selectedTestId as keyof typeof testConfigByTestId];
    if (!configKey) return;

    // Get the configuration for this test
    const config = testConfigurations[configKey as keyof typeof testConfigurations];
    if (!config) return;

    // Load saved draft data for this test
    const loadDraftData = async () => {
      try {
        const draft = await labReportService.getTestDraft(patient.id, selectedTestId);

        // Convert the configuration to table parameters
        const params: Record<string, TableParam> = {};
        config.fields.forEach((field: any) => {
          const savedParam = draft?.parameters?.[field.id];
          const defaultVal = field?.defaultValue ?? (field.type === 'select' && Array.isArray(field.options) && field.options.includes('Negative') ? 'Negative' : '');
          params[field.id] = {
            id: field.id,
            name: field.label,
            unit: field.unit || '',
            normalRange: field.refRange || '',
            value: savedParam?.value ?? defaultVal,
            notes: savedParam?.notes || '',
            type: field.type,
            options: field.type === 'select' ? field.options : undefined,
          };
        });

        setParameters(params);

        // Update sample collection status if draft exists
        if (draft && draft.collected) {
          setSamples(prevSamples =>
            prevSamples.map(sample =>
              sample.testId === selectedTestId
                ? {
                  ...sample,
                  collected: draft.collected,
                  collectedAt: draft.collectedAt,
                  collectedBy: draft.collectedBy,
                  notes: draft.notes || sample.notes
                }
                : sample
            )
          );
        }
      } catch (error) {
        console.error('Error loading draft data:', error);
        // Fallback to empty parameters if draft loading fails
        const params: Record<string, TableParam> = {};
        config.fields.forEach((field: any) => {
          const defaultVal = field?.defaultValue ?? (field.type === 'select' && Array.isArray(field.options) && field.options.includes('Negative') ? 'Negative' : '');
          params[field.id] = {
            id: field.id,
            name: field.label,
            unit: field.unit || '',
            normalRange: field.refRange || '',
            value: defaultVal,
            notes: '',
            type: field.type,
            options: field.type === 'select' ? field.options : undefined
          };
        });
        setParameters(params);
      }
    };

    loadDraftData();
  }, [selectedTestId, patient]);

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
    const wasCollected = samples.find(s => s.testId === testId)?.collected || false;

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
          // Auto-save when collection status changes
          if (patient) {
            autoSaveTestData(testId, parameters, updatedTest);
          }
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

  // Add new test to samples
  const handleAddTest = useCallback(async (testId: string) => {
    const testMeta = sampleTests.find(t => t.id === testId);
    if (!testMeta) return;

    const newSample: Sample = {
      testId: testMeta.id,
      testName: testMeta.name,
      sampleType: testMeta.sampleType,
      container: testMeta.container,
      instructions: testMeta.instructions,
      collected: false,
      notes: ''
    };

    setSamples(prevSamples => [...prevSamples, newSample]);

    // Persist in Firestore
    try {
      if (patient?.id) {
        await addTestToPatient(patient.id, testId);
        // Reflect in local patient state
        setPatient(prev => prev ? { ...prev, tests: [...(prev.tests || []), testId] } : prev);
      }
    } catch (err) {
      console.error('Failed to add test to patient in Firestore:', err);
      toast({ title: 'Sync Error', description: 'Could not sync added test to database.', variant: 'destructive' });
    }

    // Auto-select the newly added test
    setSelectedTestId(testId);

    // Close dropdown and reset search
    setShowAddTestDropdown(false);
    setTestSearchQuery('');

    toast({
      title: 'Test Added',
      description: `${testMeta.name} has been added to the collection.`,
      variant: 'default',
    });
  }, [patient]);

  // Remove test from samples with confirmation
  const handleRemoveTest = useCallback(async (testId: string) => {
    const testToRemove = samples.find(s => s.testId === testId);
    if (!testToRemove) return;

    // Don't allow removal if test is already collected
    if (testToRemove.collected) {
      toast({
        title: 'Cannot Remove',
        description: 'Cannot remove a test that has already been collected.',
        variant: 'destructive',
      });
      return;
    }

    setSamples(prevSamples => prevSamples.filter(s => s.testId !== testId));
    // Persist removal to Firestore
    try {
      if (patient?.id) {
        await removeTestFromPatient(patient.id, testId);
        setPatient(prev => prev ? { ...prev, tests: (prev.tests || []).filter(t => t !== testId) } : prev);
      }
    } catch (err) {
      console.error('Failed to remove test from patient in Firestore:', err);
      toast({ title: 'Sync Error', description: 'Could not sync removed test to database.', variant: 'destructive' });
    }

    // If the removed test was selected, select another one or clear selection
    if (selectedTestId === testId) {
      const remainingSamples = samples.filter(s => s.testId !== testId);
      if (remainingSamples.length > 0) {
        setSelectedTestId(remainingSamples[0].testId);
      } else {
        setSelectedTestId(null);
      }
    }

    toast({
      title: 'Test Removed',
      description: `${testToRemove.testName} has been removed from the collection.`,
      variant: 'default',
    });

    // Clear the test to delete state
    setTestToDelete(null);
  }, [samples, selectedTestId, patient]);

  // Auto-save functionality with debouncing
  const autoSaveTestData = useCallback(async (testId: string, parametersData: Record<string, TableParam>, sampleData: Sample) => {
    if (!patient || !testId) return;

    try {
      // Clean and validate parameters data
      const cleanedParameters = Object.fromEntries(
        Object.entries(parametersData)
          .filter(([key, param]) => key && param) // Remove undefined entries
          .map(([key, param]) => [
            key,
            {
              value: param.value || '',
              notes: param.notes || ''
            }
          ])
      );

      const draftData: Omit<TestDraft, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId: patient.id,
        testId: testId,
        parameters: cleanedParameters,
        collected: Boolean(sampleData.collected),
        collectedAt: sampleData.collectedAt || undefined,
        collectedBy: sampleData.collectedBy || undefined,
        notes: sampleData.notes || undefined
      };

      console.log('Preparing to auto-save draft data:', draftData);

      // Only save if data has changed
      const dataKey = `${testId}-${JSON.stringify(draftData)}`;
      if (lastSavedData[testId] !== dataKey) {
        await labReportService.saveTestDraft(draftData);
        setLastSavedData(prev => ({ ...prev, [testId]: dataKey }));
        console.log('Auto-saved test data for:', testId);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't throw error to prevent UI disruption
    }
  }, [patient, lastSavedData]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!selectedTestId || !patient) return;

    const currentSample = samples.find(s => s.testId === selectedTestId);
    if (!currentSample) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (1 second delay)
    const timeout = setTimeout(() => {
      autoSaveTestData(selectedTestId, parameters, currentSample);
    }, 1000);

    setAutoSaveTimeout(timeout);

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [parameters, samples, selectedTestId, patient, autoSaveTestData]);

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
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-sizing: border-box !important;
        }
        html, body {
          width: 210mm;
          height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, sans-serif !important;
        }
        .print-content {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          position: relative !important;
        }
        .print-header {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-header img {
          width: 100% !important;
          height: auto !important;
          max-height: 60mm !important;
          display: block !important;
        }
        .print-body {
          padding: 5mm 10mm 60mm 10mm !important;
        }
        .patient-info {
          font-size: 10px !important;
          font-weight: 600 !important;
          margin-bottom: 4px !important;
          display: flex !important;
          justify-content: space-between !important;
          line-height: 1.1 !important;
        }
        .print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 3mm 0 !important;
          font-size: 11px !important;
          table-layout: fixed !important;
          border: none !important;
        }
        .print-table th:nth-child(1), .print-table td:nth-child(1) { width: 30% !important; }
        .print-table th:nth-child(2), .print-table td:nth-child(2) { width: 25% !important; }
        .print-table th:nth-child(3), .print-table td:nth-child(3) { width: 15% !important; }
        .print-table th:nth-child(4), .print-table td:nth-child(4) { width: 30% !important; }
        .print-table th, .print-table td {
          border: none !important;
          padding: 1.5mm 3mm !important;
          text-align: left !important;
          background: transparent !important;
          vertical-align: top !important;
          line-height: 1.1 !important;
        }
        .print-table th {
          background-color: #f5f5f5 !important;
          font-weight: bold !important;
        }
        .print-table td.result-cell {
          font-size: 12px !important;
          font-weight: bold !important;
        }
        .print-notes-fixed {
          position: absolute !important;
          left: 10mm !important;
          right: 10mm !important;
          bottom: 15mm !important;
          text-align: center !important;
          font-size: 8px !important;
        }
        .print-footer {
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
        }
        .print-footer img {
          width: 100% !important;
          height: auto !important;
          max-height: 25mm !important;
          display: block !important;
        }
        .qr-code {
          width: 15mm !important;
          height: 15mm !important;
        }
        h1, h2, h3 {
          color: #000 !important;
          margin: 2mm 0 !important;
          page-break-after: avoid !important;
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
        return Promise.all(imagePromises).then(() => { });
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('Print completed');
      setShowPrintDialog(false);
      // Mark patient as Report Printed
      if (patient?.id) {
        markPatientReportPrinted(patient.id).catch(err => {
          console.error('Failed to mark Report Printed:', err);
        });
      }
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

      // Validate that the test is collected before proceeding
      if (!test.collected) {
        toast({
          title: 'Test Not Collected',
          description: 'Please mark the test as collected before saving and printing.',
          variant: 'destructive',
        });
        return;
      }

      // Validate that at least some parameters have values
      const hasValues = Object.values(parameters).some(param => param?.value && param.value.trim() !== '');
      if (!hasValues) {
        toast({
          title: 'No Data Entered',
          description: 'Please enter at least one test parameter value before saving.',
          variant: 'destructive',
        });
        return;
      }

      // Convert parameters to lab report format - only include fields with values
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
            unit: field.unit || '',
            refRange: field.refRange || '',
            isAbnormal,
            notes: param?.notes || ''
          };
        })
        .filter(param => param.value.trim() !== ''); // Only include parameters with values

      console.log('Report parameters created:', reportParameters.length);

      // Ensure we have parameters to save
      if (reportParameters.length === 0) {
        toast({
          title: 'No Data to Save',
          description: 'Please enter at least one test parameter value.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare lab report data with proper validation
      const reportData = {
        patientId: patient.id || '',
        patientName: patient.name || 'Unknown Patient',
        patientAge: (patient.age || 0).toString(),
        patientGender: patient.gender || 'Unknown',
        testId: test.testId || '',
        testName: test.testName || 'Unknown Test',
        parameters: reportParameters,
        collectedAt: test.collectedAt || new Date(),
        reportedAt: new Date(),
        collectedBy: test.collectedBy || technicianName || 'System',
        technicianName: technicianName || 'System',
        status: 'completed' as const
      };

      console.log('About to save report data:', reportData);

      // Save the lab report and get the report ID + token
      const { reportId, token } = await labReportService.saveLabReport(reportData);
      setSavedReportId(reportId);
      setSavedReportToken(token);

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
              border: none !important; /* remove grid */
              padding: 4px 6px !important;
              text-align: left !important;
              background: transparent !important;
              font-size: 10px !important;
              vertical-align: top !important;
            }
            
            th {
              background-color: #f5f5f5 !important;
              font-weight: bold !important;
            }
            /* Make the first column (Investigation) bold in print */
            tbody td:nth-child(1) {
              font-weight: 700 !important;
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

  const handleSaveTest = async () => {
    if (!currentTest || !patient || !hospital) {
      toast({
        title: "Error",
        description: "Missing test, patient, or hospital information",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one parameter has a value
    const hasValues = Object.values(parameters).some(param => param.value && param.value.trim() !== '');
    if (!hasValues) {
      toast({
        title: "Error",
        description: "Please enter at least one test result before saving",
        variant: "destructive",
      });
      return;
    }

    setIsSavingReport(true);

    try {
      // Generate unique report ID and token
      const reportId = generateReportId();
      const reportToken = generateReportToken();

      // Get test configuration
      const configMap = testConfigByTestId;
      const configKey = configMap[currentTest.testId];
      const testConfig = configKey ? testConfigurations[configKey] : null;

      if (!testConfig) {
        throw new Error('Test configuration not found');
      }

      // Prepare report data for storage
      const reportData = {
        reportId,
        patientId: patient.id,
        testId: currentTest.testId,
        testName: currentTest.testName,
        hospitalId: hospital?.id || '',
        patient: {
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender
        },
        parameters: Object.fromEntries(
          Object.entries(parameters).map(([key, param]) => [
            key,
            { value: param.value || '' }
          ])
        ),
        testConfig: {
          fields: testConfig.fields
        },
        collectedAt: typeof currentTest.collectedAt === 'string' ? currentTest.collectedAt : new Date().toISOString(),
        token: reportToken
      };

      // Save report to Firebase
      await saveReportData(reportData);

      // Store report ID and token for QR code
      setSavedReportId(reportId);
      setSavedReportToken(reportToken);

      // Create the sample data
      const sampleData: Sample = {
        testId: currentTest.testId,
        testName: currentTest.testName,
        sampleType: 'Blood', // Default sample type
        container: 'EDTA Tube', // Default container
        instructions: 'Standard collection procedure',
        collected: true,
        collectedAt: new Date(currentTest.collectedAt || new Date().toISOString())
      };

      // Add to samples array
      const updatedSamples = [...samples, sampleData];
      setSamples(updatedSamples);

      // Clear current test and parameters
      setCurrentTest(null);
      setParameters({});

      toast({
        title: "Success",
        description: `Test results saved successfully. Report ID: ${reportId}`,
      });
    } catch (error) {
      console.error('Error saving test:', error);
      toast({
        title: "Error",
        description: "Failed to save test results",
        variant: "destructive",
      });
    } finally {
      setIsSavingReport(false);
    }
  };

  // Print dialog component (shared preview + print)
  const PrintDialog = () => {
    if (!showPrintDialog || !currentTest) return null;

    const configKey = testConfigByTestId[currentTest.testId];
    const testConfig = configKey ? testConfigurations[configKey] : null;

    const collectedTest = samples.find((s) => s.testId === currentTest.testId);
    const testParameters = collectedTest?.parameters || parameters;

    // Optional backdate controls (date-only). When set, they override the dates shown on print.
    const [backdateReceivedOn, setBackdateReceivedOn] = useState<string>('');
    const [backdateReportedOn, setBackdateReportedOn] = useState<string>('');

    const receivedOnDate = backdateReceivedOn
      ? new Date(`${backdateReceivedOn}T00:00:00`)
      : (currentTest.collectedAt || new Date());

    const reportedOnDate = backdateReportedOn
      ? new Date(`${backdateReportedOn}T00:00:00`)
      : new Date();

    const sharedParams: LabReportParameterItem[] = (testConfig?.fields || [])
      .map((field: any) => {
        const p = testParameters[field.id];
        return {
          label: field.label,
          value: p?.value ?? '',
          unit: field.unit || '',
          refRange: field.refRange || '',
        } as LabReportParameterItem;
      })
      .filter((p) => (p.value || '').toString().trim() !== '');

    const qrUrl = savedReportId
      ? `${location.origin}/public-report/${savedReportId}${savedReportToken ? `?token=${savedReportToken}` : ''}`
      : `${location.origin}/public-report/pending`;

    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex h-full w-full items-stretch">
          {/* Left: Full preview */}
          <div className="flex-1 min-w-0 overflow-auto flex items-center justify-center p-4 bg-muted/30">
            <div ref={printRef} className="print-preview">
              <LabReportShared
                patient={{
                  name: patient?.name || 'N/A',
                  age: patient?.age || 'N/A',
                  gender: patient?.gender || 'N/A',
                  referredBy: (patient as any)?.doctor || (currentTest as any)?.doctor || ''
                }}
                testName={currentTest.testName || 'Laboratory Test'}
                collectedAt={receivedOnDate}
                reportedOn={reportedOnDate}
                parameters={sharedParams}
                qrUrl={qrUrl}
                headerSrc="/letetrheadheader.png"
                footerSrc="/letetrheadfooter.png"
                watermarkSrc="/watermark.png"
              />
            </div>
          </div>
          {/* Right: Settings panel */}
          <div className="w-full max-w-md h-full overflow-auto border-l bg-card flex flex-col">
            <div className="p-4 border-b">
              <div className="text-lg font-semibold">Print Settings</div>
              <div className="text-xs text-muted-foreground mt-1">Left side shows the exact print layout. Adjust settings here.</div>
            </div>
            <div className="p-4 space-y-4 flex-1">
              <div className="space-y-2">
                <div className="text-sm font-medium">Backdate Received On</div>
                <Input
                  type="date"
                  value={backdateReceivedOn}
                  onChange={(e) => setBackdateReceivedOn(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Backdate Reported On</div>
                <Input
                  type="date"
                  value={backdateReportedOn}
                  onChange={(e) => setBackdateReportedOn(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Button
                  variant="ghost"
                  onClick={() => { setBackdateReceivedOn(''); setBackdateReportedOn(''); }}
                  className="text-xs"
                >
                  Reset Dates
                </Button>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-between gap-2">
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const content = printRef.current;
                    if (!content) return;
                    const win = window.open('', '_blank');
                    if (!win) return;
                    const styleTag = content.querySelector('style')?.outerHTML || '';
                    const pageHtml = content.querySelector('.print-content')?.outerHTML || content.innerHTML;
                    win.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${patient?.name || 'Patient'}</title><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />${styleTag}<style>@page{size:A4;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;font-family:Arial,sans-serif;width:210mm;height:297mm}img{display:block;max-width:100%}body *{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}</style></head><body>${pageHtml}</body></html>`);
                    win.document.close();
                    win.focus();
                  }}
                >
                  Open in New Tab
                </Button>
                <Button
                  onClick={() => {
                    const content = printRef.current;
                    if (!content) return;
                    const win = window.open('', '_blank');
                    if (!win) return;
                    const styleTag = content.querySelector('style')?.outerHTML || '';
                    const pageHtml = content.querySelector('.print-content')?.outerHTML || content.innerHTML;
                    win.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${patient?.name || 'Patient'}</title><meta charSet="utf-8" />${styleTag}<style>@page{size:A4;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;}*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;font-family:Arial,sans-serif;width:210mm;height:297mm}img{display:block;max-width:100%}body *{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}</style></head><body>${pageHtml}</body></html>`);
                    win.document.close();
                    win.focus();
                    setTimeout(() => { win.print(); win.close(); }, 250);
                  }}
                  className="bg-primary"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
              </div>
            </div>
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
    <div className="w-full">
      {/* Page Header */}
      <div className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent" />
        <div className="relative px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Beaker className="h-4 w-4 text-primary" />
              Sample Collection
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>{samples.filter(s => s.collected).length} of {samples.length} tests collected</span>
            </div>
            {availableTests.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {availableTests.length} more tests available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 px-2 mt-1">
        {/* Test List */}
        <div className="xl:col-span-3">
          {/* Compact Patient Info above Ordered Tests */}
          <Card className="shadow-card">
            <CardHeader className="py-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {patient.name?.charAt(0) || 'P'}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base leading-tight truncate">{patient.name}</CardTitle>
                  <CardDescription className="mt-0.5 truncate">{patient.age} years • {patient.gender}</CardDescription>
                  <div className="mt-1 text-[10px] text-muted-foreground inline-flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-full bg-muted">ID: {patient.hospitalId || patient.id}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Walk-in</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Ordered Tests</CardTitle>
                  <CardDescription>Select a test to record results</CardDescription>
                </div>
                <Popover open={showAddTestDropdown} onOpenChange={setShowAddTestDropdown}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <Command>
                      <CommandInput 
                        placeholder="Search tests..." 
                        value={testSearchQuery}
                        onValueChange={setTestSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No tests found.</CommandEmpty>
                        <CommandGroup>
                          {filteredAvailableTests.map((test) => (
                            <CommandItem
                              key={test.id}
                              value={test.name}
                              onSelect={() => handleAddTest(test.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{test.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {test.category} • {test.sampleType} • {test.container}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-3 relative">
                <Input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter ordered tests..."
                  className="pl-9 h-9"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredSamples.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tests ordered</p>
                ) : (
                  filteredSamples.map((sample) => (
                    <div
                      key={sample.testId}
                      className={`p - 3 rounded - lg border transition - all ${
  selectedTestId === sample.testId
    ? 'bg-primary/10 border-primary/30 shadow-sm'
    : 'hover:bg-muted/50 border-transparent'
} `}
                    >
                      <div 
                        onClick={() => handleTestSelect(sample.testId)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                            <Beaker className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-medium">{sample.testName}</p>
                            <p className="text-xs text-muted-foreground">
                              {sample.sampleType} • {sample.container}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sample.collected ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs border border-emerald-200">
                              <BadgeCheck className="h-3.5 w-3.5" /> Collected
                            </span>
                          ) : (
                            !sample.collected && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    {/* <XCircle className="h-4 w-4" /> */}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Test</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{sample.testName}" from the collection? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveTest(sample.testId)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Details */}
        <div className="xl:col-span-9 pb-4">
          {selectedTest ? (
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <CardTitle className="tracking-tight">{selectedTest.testName}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{selectedTest.sampleType}</span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{selectedTest.container}</span>
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedTest.collected ? 'Collected' : 'Pending'}
                  </div>
                </div>
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
                      // Trigger auto-save when parameter changes
                      if (selectedTest && patient) {
                        // Clear existing timeout
                        if (autoSaveTimeout) {
                          clearTimeout(autoSaveTimeout);
                        }
                        // Set new timeout for auto-save (1 second delay)
                        const timeout = setTimeout(() => {
                          const updatedParams = {
                            ...parameters,
                            [id]: { ...parameters[id], [field]: value }
                          };
                          // Ensure we have valid data before auto-saving
                          if (selectedTest && selectedTest.testId && patient) {
                            autoSaveTestData(selectedTest.testId, updatedParams, selectedTest);
                          }
                        }, 1000);
                        setAutoSaveTimeout(timeout);
                      }
                    }}
                    className="compact-table"
                    rowHeight={32}
                    headerHeight={36}
                  />
                </div>
                {/* Sticky in-card action bar */}
                <div className="sticky bottom-0 mt-6 -mx-6 border-t bg-card/80 backdrop-blur px-6 py-3">
                  <div className="flex flex-col sm:flex-row gap-2">
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
                          // Validate that parameters have been entered
                          const hasValues = Object.values(parameters).some(param => param?.value && param.value.trim() !== '');
                          if (!hasValues) {
                            toast({
                              title: 'No Data Entered',
                              description: 'Please enter test parameter values before saving and printing.',
                              variant: 'destructive',
                            });
                            return;
                          }
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
