import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, ClipboardList } from 'lucide-react';
import { getPatient, PatientData } from '@/services/patientService';
import { getTest, TestData } from '@/services/testService';
import { TestCollectionManager } from '@/components/tests/TestCollectionManager';

export const TestCollectionPage: React.FC = () => {
  const { patientId, testId } = useParams<{ patientId: string; testId?: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(testId || null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(testId ? 'detail' : 'list');

  // Load patient data
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        setError(null);
        const patientData = await getPatient(patientId);
        setPatient(patientData);
      } catch (err) {
        console.error('Error loading patient:', err);
        setError('Failed to load patient data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  // Update URL when selected test changes
  useEffect(() => {
    if (selectedTestId) {
      navigate(`/patients/${patientId}/tests/${selectedTestId}`, { replace: true });
      setViewMode('detail');
    } else {
      navigate(`/patients/${patientId}/tests`, { replace: true });
      setViewMode('list');
    }
  }, [selectedTestId, patientId, navigate]);

  const handleTestSelect = (testId: string) => {
    setSelectedTestId(testId);
  };

  const handleBackToList = () => {
    setSelectedTestId(null);
  };

  const handleSaveTest = async (test: TestData, notes: string, collected: boolean) => {
    // Implement your save logic here
    console.log('Saving test:', { test, notes, collected });
    // Example: await updateTestStatus(patientId, test.id, { notes, collected });
    
    // After saving, you might want to update the local state or refetch data
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Test status updated');
        resolve();
      }, 1000);
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient Not Found</AlertTitle>
          <AlertDescription>
            The requested patient could not be found. Please check the patient ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Test Collection</h1>
          <p className="text-sm text-muted-foreground">
            {patient.name} • {patient.hospitalId || 'No ID'}
          </p>
        </div>
      </div>

      {viewMode === 'detail' && selectedTestId ? (
        <TestCollectionManager
          testId={selectedTestId}
          onBack={handleBackToList}
          onSave={handleSaveTest}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Tests</CardTitle>
              <CardDescription>
                Select a test to view details and update collection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patient.tests && patient.tests.length > 0 ? (
                <div className="space-y-2">
                  {patient.tests.map((testId) => (
                    <div
                      key={testId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleTestSelect(testId)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">Test ID: {testId}</p>
                        <p className="text-sm text-muted-foreground">
                          Click to view details
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No tests assigned</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This patient doesn't have any tests assigned yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TestCollectionPage;
