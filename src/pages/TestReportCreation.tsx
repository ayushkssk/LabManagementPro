import React, { useState } from 'react';
import { generateReportId, generateReportToken, saveReportData, getReportData, createShareableReportUrl } from '@/utils/reportStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestReportCreation: React.FC = () => {
  const [reportId, setReportId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [retrievedData, setRetrievedData] = useState<any>(null);

  const createTestReport = async () => {
    try {
      setStatus('Creating test report...');
      
      const newReportId = generateReportId();
      const newToken = generateReportToken();
      
      setReportId(newReportId);
      setToken(newToken);
      
      const testReportData = {
        reportId: newReportId,
        patientId: 'test-patient-123',
        testId: 'test-cbc',
        testName: 'Complete Blood Count',
        hospitalId: 'demo-hospital-1',
        patient: {
          id: 'test-patient-123',
          name: 'John Doe',
          age: 35,
          gender: 'Male'
        },
        parameters: {
          'hemoglobin': { value: '14.5' },
          'wbc': { value: '7500' },
          'platelets': { value: '250000' }
        },
        testConfig: {
          fields: [
            { id: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', refRange: '12-16' },
            { id: 'wbc', label: 'WBC Count', unit: '/μL', refRange: '4000-11000' },
            { id: 'platelets', label: 'Platelets', unit: '/μL', refRange: '150000-450000' }
          ]
        },
        collectedAt: new Date().toISOString(),
        token: newToken
      };

      console.log('Test report data:', testReportData);
      
      await saveReportData(testReportData);
      
      const url = createShareableReportUrl(newReportId, newToken);
      setShareableUrl(url);
      
      setStatus('Test report created successfully!');
      
    } catch (error) {
      console.error('Error creating test report:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const retrieveTestReport = async () => {
    if (!reportId) {
      setStatus('No report ID to retrieve');
      return;
    }

    try {
      setStatus('Retrieving test report...');
      
      const data = await getReportData(reportId, token);
      
      if (data) {
        setRetrievedData(data);
        setStatus('Report retrieved successfully!');
      } else {
        setStatus('Report not found or access denied');
      }
      
    } catch (error) {
      console.error('Error retrieving test report:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test Report Creation & Retrieval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={createTestReport}>Create Test Report</Button>
            <Button onClick={retrieveTestReport} disabled={!reportId}>
              Retrieve Test Report
            </Button>
          </div>
          
          {status && (
            <div className="p-3 bg-gray-100 rounded">
              <strong>Status:</strong> {status}
            </div>
          )}
          
          {reportId && (
            <div className="space-y-2">
              <div><strong>Report ID:</strong> {reportId}</div>
              <div><strong>Token:</strong> {token}</div>
              {shareableUrl && (
                <div>
                  <strong>Shareable URL:</strong> 
                  <a href={shareableUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">
                    {shareableUrl}
                  </a>
                </div>
              )}
            </div>
          )}
          
          {retrievedData && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Retrieved Data:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(retrievedData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReportCreation;
