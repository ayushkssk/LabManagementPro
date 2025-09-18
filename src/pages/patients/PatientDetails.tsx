import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Calendar, Phone, User, TestTube2, ExternalLink, FileText } from 'lucide-react';
import { getPatient, type PatientData } from '@/services/patientService';
import { labReportService, type LabReport } from '@/services/labReportService';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [reports, setReports] = useState<LabReport[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [p, r] = await Promise.all([
          getPatient(id),
          labReportService.getPatientLabReports(id)
        ]);
        if (p) setPatient(p);
        setReports(r || []);
      } catch (e) {
        console.error('Failed to load patient details', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const ageGender = useMemo(() => {
    if (!patient) return '';
    const age = typeof patient.age === 'number' ? patient.age : Number(patient.age || 0);
    return `${age || 0} yrs • ${patient.gender}`;
  }, [patient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Patient not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card px-3 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="text-lg font-semibold">Patient Details</div>
            <div className="text-xs text-muted-foreground">View visits, tests and reports</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(`/lab/sample-collection/${patient.id}`)}>
            <TestTube2 className="mr-2 h-4 w-4" /> Collect Sample
          </Button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{patient.name}</span>
              </div>
              <Badge variant="secondary">{ageGender}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span>Registered: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium'}).format(new Date(patient.registrationDate))}</span>
                <span className="text-xs text-muted-foreground">Last Visit: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium'}).format(new Date(patient.lastVisit))}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="font-medium">{patient.address}, {patient.city}, {patient.state} {patient.pincode}</div>
            </div>
            {patient.doctor && (
              <div>
                <div className="text-xs text-muted-foreground">Referred By</div>
                <div className="font-medium">{patient.doctor}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Visits & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reports found for this patient.</div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-start justify-between rounded-md border p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{r.testName}</div>
                        <div className="text-xs text-muted-foreground">
                          Collected: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium'}).format(new Date(r.collectedAt))} • Reported: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium'}).format(new Date(r.reportedAt))}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant={r.status === 'completed' ? 'default' : 'secondary'}>{r.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/public-report/${r.id}${r.token ? `?token=${r.token}` : ''}`)}>
                        <ExternalLink className="mr-2 h-3 w-3" /> View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetails;
