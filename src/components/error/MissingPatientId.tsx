import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MissingPatientId() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Patient ID Missing</h2>
        <p className="text-gray-600 mb-4">
          The sample collection page requires a patient ID. Please navigate to this page from a patient's record.
        </p>
        <Button 
          onClick={() => navigate('/patients')}
          className="w-full"
        >
          Back to Patients
        </Button>
      </div>
    </div>
  );
}
