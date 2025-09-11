import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, RotateCcw, Trash, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHospitals } from '@/context/HospitalContext';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const Hospitals = () => {
  const { hospitals, deletedHospitals, deleteHospital, restoreHospital, permanentlyDeleteHospital } = useHospitals();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<string | null>(null);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [hospitalToPermanentlyDelete, setHospitalToPermanentlyDelete] = useState<string | null>(null);

  const handleDeleteClick = (hospitalId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHospitalToDelete(hospitalId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (hospitalToDelete) {
      try {
        await deleteHospital(hospitalToDelete);
        toast.success('Hospital moved to recycle bin');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete hospital');
      }
    }
    setDeleteDialogOpen(false);
    setHospitalToDelete(null);
  };

  const handleRestoreClick = async (hospitalId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await restoreHospital(hospitalId);
      toast.success('Hospital restored successfully');
    } catch (error) {
      toast.error('Failed to restore hospital');
    }
  };

  const handlePermanentDeleteClick = (hospitalId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHospitalToPermanentlyDelete(hospitalId);
    setPermanentDeleteDialogOpen(true);
  };

  const handleConfirmPermanentDelete = async () => {
    if (hospitalToPermanentlyDelete) {
      try {
        await permanentlyDeleteHospital(hospitalToPermanentlyDelete);
        toast.success('Hospital permanently deleted');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to permanently delete hospital');
      }
    }
    setPermanentDeleteDialogOpen(false);
    setHospitalToPermanentlyDelete(null);
  };
  const renderHospitalCard = (hospital: any, isDeleted = false) => (
    <Card key={hospital.id} className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary">
      <Link to={`/super-admin/hospitals/${hospital.id}`} className="block">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={hospital.logoUrl} alt={hospital.name} />
            <AvatarFallback className={`bg-primary/10 text-primary text-sm ${hospital.isDemo ? 'bg-demo' : ''}`}>
              {hospital.isDemo ? 'D' : hospital.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <CardTitle className="text-base">{hospital.name}</CardTitle>
            <CardDescription className="flex items-center flex-wrap gap-1">
              <Badge variant={hospital.isDemo ? 'outline' : isDeleted ? 'destructive' : 'secondary'} className={`ml-2 ${hospital.isDemo ? 'bg-yellow-100 text-yellow-800' : isDeleted ? 'bg-red-100 text-red-800' : ''}`}>
                {hospital.isDemo ? 'Demo' : isDeleted ? 'Deleted' : hospital.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-xs">{new Date(hospital.registrationDate).toLocaleDateString()}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5 h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
              >
                <path d="M4 22h16a2 2 0 0 0 2-2V7.5L17.5 2H6a2 2 0 0 0-2 2v4" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
              {hospital.email}
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5 h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {hospital.phoneNumbers[0]}
            </div>
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5 h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-ellipsis line-clamp-2">
                {hospital.address.street}, {hospital.address.city}, {hospital.address.state} {hospital.address.pincode}
              </span>
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-1.5">
            {!isDeleted ? (
              <>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {!hospital.isDemo && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleDeleteClick(hospital.id, e)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={(e) => handleRestoreClick(hospital.id, e)}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restore
                </Button>
                {!hospital.isDemo && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handlePermanentDeleteClick(hospital.id, e)}
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Delete Forever
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="w-full max-w-full pl-6 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hospital Management</h1>
          <p className="text-muted-foreground text-sm">Manage all hospitals in the system</p>
        </div>
        <Button asChild>
          <Link to="/super-admin/hospitals/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Hospital
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active">Active Hospitals ({hospitals.length})</TabsTrigger>
          <TabsTrigger value="deleted">Recycle Bin ({deletedHospitals.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hospitals.map((hospital) => renderHospitalCard(hospital, false))}
          </div>
          {hospitals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active hospitals found.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="deleted" className="mt-6">
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deletedHospitals.map((hospital) => renderHospitalCard(hospital, true))}
          </div>
          {deletedHospitals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No deleted hospitals found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Hospital"
        description="Are you sure you want to delete this hospital? This action will move the hospital to the recycle bin. All related data (users, patients, reports) will be preserved and can be restored later."
        confirmText="Delete Hospital"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />

      <ConfirmationDialog
        open={permanentDeleteDialogOpen}
        onOpenChange={setPermanentDeleteDialogOpen}
        title="Permanently Delete Hospital"
        description="Are you sure you want to permanently delete this hospital? This action cannot be undone and will remove all related data including users, patients, and reports."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handleConfirmPermanentDelete}
        variant="destructive"
      />
    </div>
  );
};

export default Hospitals;
