import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Reports: React.FC = () => {
  const mockReports = [
    { id: 'RPT-1001', hospital: 'City General Hospital', date: '2025-09-10', count: 124 },
    { id: 'RPT-1002', hospital: 'Sunshine Medical Center', date: '2025-09-10', count: 87 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Total Reports</CardTitle><CardDescription>Across all hospitals</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">4,562</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Today</CardTitle><CardDescription>Generated today</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">146</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending Sign-offs</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">23</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Abnormal Flags</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">12</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest report generation by hospital</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.hospital}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="text-right">{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
