import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, Archive, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeletePatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPatients: Array<{
    id: string;
    name: string;
    hospitalId?: string;
    isDeleted?: boolean;
  }>;
  onSoftDelete: (patientIds: string[]) => Promise<void>;
  onPermanentDelete: (patientIds: string[]) => Promise<void>;
  onRestore: (patientIds: string[]) => Promise<void>;
}

export const DeletePatientsModal: React.FC<DeletePatientsModalProps> = ({
  isOpen,
  onClose,
  selectedPatients,
  onSoftDelete,
  onPermanentDelete,
  onRestore,
}) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'soft' | 'permanent' | 'restore' | null>(null);

  const deletedPatients = selectedPatients.filter(p => p.isDeleted);
  const activePatients = selectedPatients.filter(p => !p.isDeleted);

  const handleAction = async (actionType: 'soft' | 'permanent' | 'restore') => {
    setAction(actionType);
    setLoading(true);

    try {
      const patientIds = selectedPatients.map(p => p.id);

      switch (actionType) {
        case 'soft':
          await onSoftDelete(patientIds);
          break;
        case 'permanent':
          await onPermanentDelete(patientIds);
          break;
        case 'restore':
          await onRestore(patientIds);
          break;
      }

      onClose();
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Manage Selected Patients</span>
          </DialogTitle>
          <DialogDescription>
            You have selected {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''}. 
            Choose an action below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Patients List */}
          <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            {selectedPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{patient.name}</span>
                  {patient.hospitalId && (
                    <span className="text-xs text-slate-500 font-mono">
                      ({patient.hospitalId})
                    </span>
                  )}
                </div>
                {patient.isDeleted && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                    Deleted
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Restore Option (only for deleted patients) */}
            {deletedPatients.length > 0 && (
              <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-start space-x-3">
                  <RotateCcw className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 dark:text-green-300">
                      Restore Patients
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Restore {deletedPatients.length} deleted patient{deletedPatients.length !== 1 ? 's' : ''} 
                      back to active status.
                    </p>
                    <Button
                      onClick={() => handleAction('restore')}
                      disabled={loading}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {loading && action === 'restore' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RotateCcw className="w-4 h-4 mr-2" />
                      )}
                      Restore {deletedPatients.length} Patient{deletedPatients.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Soft Delete Option (only for active patients) */}
            {activePatients.length > 0 && (
              <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-start space-x-3">
                  <Archive className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">
                      Archive Patients (Soft Delete)
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Hide {activePatients.length} patient{activePatients.length !== 1 ? 's' : ''} from the main list. 
                      You can restore them later if needed.
                    </p>
                    <Button
                      onClick={() => handleAction('soft')}
                      disabled={loading}
                      variant="outline"
                      className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                      size="sm"
                    >
                      {loading && action === 'soft' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Archive className="w-4 h-4 mr-2" />
                      )}
                      Archive {activePatients.length} Patient{activePatients.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Permanent Delete Option */}
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start space-x-3">
                <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 dark:text-red-300">
                    Permanently Delete
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    <strong>Warning:</strong> This will permanently remove {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''} 
                    and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    onClick={() => handleAction('permanent')}
                    disabled={loading}
                    variant="destructive"
                    className="mt-3"
                    size="sm"
                  >
                    {loading && action === 'permanent' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Permanently
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
