import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Upload, AlertCircle, Download, Database, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { deletePatient, getPatients } from '@/services/patientService';
import { getTests } from '@/services/testService';
import { doc, collection, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Check } from 'lucide-react';

const Administration: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'in-progress' | 'success' | 'error'>('idle');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [deleteSelections, setDeleteSelections] = useState({
    patients: false,
    tests: false,
    settings: false,
  });

  const handleDeleteSelectionChange = (key: keyof typeof deleteSelections) => {
    setDeleteSelections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isDeleteDisabled = !Object.values(deleteSelections).some(Boolean);

  const handleDeleteAllData = async () => {
    const selectedItems = Object.entries(deleteSelections)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);
      
    if (selectedItems.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one item to delete.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the selected ${selectedItems.join(', ')}? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const results = [];
      
      // Handle patient deletion
      if (deleteSelections.patients) {
        try {
          // Get all patients first
          const patients = await getPatients();
          let deletedCount = 0;
          
          // Delete each patient one by one
          for (const patient of patients) {
            if (patient.id) {
              await deletePatient(patient.id);
              deletedCount++;
            }
          }
          
          results.push(`Patients: ${deletedCount} records deleted`);
        } catch (error) {
          console.error('Error deleting patients:', error);
          results.push('Patients: Failed to delete patients');
        }
      }
      
      // Handle tests deletion
      if (deleteSelections.tests) {
        try {
          // Get all tests and delete them in batches
          const tests = await getTests();
          const batch = writeBatch(db);
          let deletedCount = 0;
          
          // Process in batches of 500 (Firestore limit)
          for (let i = 0; i < tests.length; i++) {
            if (tests[i].id) {
              const testRef = doc(collection(db, 'tests'), tests[i].id);
              batch.delete(testRef);
              deletedCount++;
              
              // Commit batch every 500 operations
              if (deletedCount % 500 === 0) {
                await batch.commit();
              }
            }
          }
          
          // Commit any remaining operations
          if (deletedCount % 500 !== 0) {
            await batch.commit();
          }
          
          results.push(`Tests: ${deletedCount} tests deleted`);
        } catch (error) {
          console.error('Error deleting tests:', error);
          results.push('Tests: Failed to delete tests');
        }
      }
      
      // Handle settings reset (placeholder for future implementation)
      if (deleteSelections.settings) {
        try {
          // Reset settings to default
          await updateDoc(doc(db, 'settings', 'general'), {
            theme: 'light',
            language: 'en',
            updatedAt: new Date().toISOString()
          });
          results.push('Settings: Reset to default values');
        } catch (error) {
          console.error('Error resetting settings:', error);
          results.push('Settings: Failed to reset settings');
        }
      }
      
      // Reset selections after successful deletion
      setDeleteSelections({
        patients: false,
        tests: false,
        settings: false,
      });
      
      toast({
        title: 'Deletion Complete',
        description: (
          <div className="space-y-1">
            {results.map((result, i) => (
              <div key={i} className="flex items-center">
                {result.includes('Failed') ? (
                  <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                ) : (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                )}
                <span>{result}</span>
              </div>
            ))}
          </div>
        ),
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackupData = async () => {
    setBackupStatus('in-progress');
    try {
      // Add your backup logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Create a JSON file with sample data (replace with actual data)
      const data = { message: 'This is a sample backup data' };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `labmanager-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setBackupStatus('success');
      toast({
        title: 'Success',
        description: 'Data backup completed successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error backing up data:', error);
      setBackupStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to create backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreData = async () => {
    if (!restoreFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a backup file to restore from.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to restore from this backup? This will overwrite existing data.')) {
      return;
    }

    try {
      // Add your restore logic here
      const fileContent = await restoreFile.text();
      const data = JSON.parse(fileContent);
      console.log('Restoring data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Success',
        description: 'Data restored successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error restoring data:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore data. The backup file might be corrupted.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Manage your application data</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Backup Data Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Save className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Backup Data</CardTitle>
            </div>
            <CardDescription>
              Create a backup of all your application data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a complete backup of your data for safekeeping.
            </p>
            <div className="flex justify-end">
              <Button 
                onClick={handleBackupData}
                disabled={backupStatus === 'in-progress'}
              >
                {backupStatus === 'in-progress' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Backing up...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Create Backup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restore Data Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                <Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg">Restore Data</CardTitle>
            </div>
            <CardDescription>
              Restore data from a previous backup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Select backup file
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                "
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleRestoreData}
                disabled={!restoreFile}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Restore
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete All Data Card */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Permanently delete all data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription className="text-xs space-y-3">
                <p>This action cannot be undone. Select the data you want to delete:</p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="delete-patients"
                      checked={deleteSelections.patients}
                      onChange={() => handleDeleteSelectionChange('patients')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="delete-patients" className="text-sm font-medium">Patients</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="delete-tests"
                      checked={deleteSelections.tests}
                      onChange={() => handleDeleteSelectionChange('tests')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="delete-tests" className="text-sm font-medium">Tests</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="delete-settings"
                      checked={deleteSelections.settings}
                      onChange={() => handleDeleteSelectionChange('settings')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="delete-settings" className="text-sm font-medium">Settings</label>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button 
                onClick={handleDeleteAllData}
                variant="destructive"
                disabled={isDeleting || isDeleteDisabled}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Administration;
