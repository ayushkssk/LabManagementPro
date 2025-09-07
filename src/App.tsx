import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import Layout from "@/components/layout/Layout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import HospitalProfile from "@/pages/admin/HospitalProfile";
import TestManagement from "@/pages/admin/TestManagement";
import LabDashboard from "@/pages/lab/LabDashboard";
import PatientRegistration from "@/pages/lab/PatientRegistration";
import SampleCollection from "@/pages/lab/SampleCollection";
import Patients from "@/pages/patients/Patients";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/lab'} replace /> : <LoginForm />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute>
          <HospitalProfile />
        </ProtectedRoute>
      } />
      <Route path="/admin/tests" element={
        <ProtectedRoute>
          <TestManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Lab Technician Routes */}
      <Route path="/lab" element={
        <ProtectedRoute>
          <LabDashboard />
        </ProtectedRoute>
      } />
      <Route path="/lab/register" element={
        <ProtectedRoute>
          <PatientRegistration />
        </ProtectedRoute>
      } />
      <Route path="/lab/patients" element={
        <ProtectedRoute>
          <Patients />
        </ProtectedRoute>
      } />
      <Route path="/lab/sample-collection/:patientId" element={
        <ProtectedRoute>
          <SampleCollection />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
