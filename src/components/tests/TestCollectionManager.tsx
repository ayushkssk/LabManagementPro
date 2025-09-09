import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { TestData } from '@/services/testService';

interface TestCollectionManagerProps {
  testId: string;
  onBack: () => void;
  onSave: (test: TestData, notes: string, collected: boolean) => Promise<void>;
}

export const TestCollectionManager: React.FC<TestCollectionManagerProps> = ({
  testId,
  onBack,
  onSave,
}) => {
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [collected, setCollected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load test details
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError(null);
        // Replace with your actual test fetching logic
        // const testData = await getTest(testId);
        // setTest(testData);
      } catch (err) {
        console.error('Error loading test:', err);
        setError('Failed to load test details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadTest();
    }
  }, [testId]);

  const handleSave = async () => {
    if (!test) return;
    
    try {
      setSaving(true);
      setSaveStatus(null);
      await onSave(test, notes, collected);
      setSaveStatus({
        type: 'success',
        message: 'Test status updated successfully!',
      });
    } catch (err) {
      console.error('Error saving test:', err);
      setSaveStatus({
        type: 'error',
        message: 'Failed to update test status. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!test) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Test Not Found</AlertTitle>
        <AlertDescription>
          The requested test could not be found. It may have been removed or you may not have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back to list
        </Button>
        <div className="flex items-center space-x-2">
          <Badge variant={collected ? 'default' : 'secondary'} className="capitalize">
            {collected ? 'Collected' : 'Pending'}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{test.name}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{test.category}</span>
            <span>•</span>
            <span>ID: {test.id}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {test.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{test.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Collection Status</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant={collected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCollected(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Collected
                </Button>
                <Button
                  variant={!collected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCollected(false)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Not Collected
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this sample collection..."
              />
            </div>
          </div>

          {saveStatus && (
            <Alert variant={saveStatus.type === 'success' ? 'default' : 'destructive'}>
              {saveStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {saveStatus.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>{saveStatus.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onBack} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
