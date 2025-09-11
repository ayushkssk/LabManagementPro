import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, ClipboardList, XCircle, Printer, Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getPatient, PatientData } from '@/services/patientService';
import { testConfigurations, testConfigByTestId, sampleTests as externalSampleTests } from '../../modules/tests/config';
import { TestParameterTable } from '@/components/tests/TestParameterTable';
import { demoTests } from '@/data/demoData';
import { Letterhead, letterheadStyles } from '@/components/letterhead/Letterhead';
import { useHospitalLetterhead } from '@/hooks/useHospitalLetterhead';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';
import { labReportService, LabReport, LabReportParameter, TestDraft } from '@/services/labReportService';

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
  const [showAddTestDropdown, setShowAddTestDropdown] = useState(false);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSavedData, setLastSavedData] = useState<Record<string, any>>({});
  const { hospital: hospitalData } = useHospitalLetterhead();
  const printRef = useRef<HTMLDivElement>(null);

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

  // Filter available tests based on search query
  const filteredAvailableTests = useMemo(() => {
    if (!testSearchQuery) return availableTests;
    return availableTests.filter(test => 
      test.name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(testSearchQuery.toLowerCase())
    );
  }, [availableTests, testSearchQuery]);

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
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 px-4 mt-2">
        {/* Test List */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Ordered Tests</CardTitle>
                  <CardDescription>Select a test to record results</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {samples.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tests ordered</p>
                ) : (
                  samples.map((sample) => (
                    <div
                      key={sample.testId}
                      className={`p-3 rounded-lg transition-colors ${
                        selectedTestId === sample.testId
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-medium">{sample.testName}</p>
                          <p className="text-xs text-muted-foreground">
                            {sample.sampleType} • {sample.container}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {sample.collected ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                          )}
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
                  <p>Test details would go here</p>
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
