import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import { SuperAdminLayout } from "./pages/super-admin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import { Overview } from "./pages/super-admin/Overview";
import { Unauthorized } from "./pages/Unauthorized";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
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

  // Check if user has required role
  if (requiredRole && !requiredRole.some(role => user.role === role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Use SuperAdminLayout for super-admin, default Layout for others
  if (user.role === 'super-admin') {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }
  
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={
        user ? (
          user.role === 'super-admin' ? 
            <Navigate to="/super-admin/overview" replace /> : 
            <Navigate to={user.role === 'admin' ? '/admin' : '/lab'} replace />
        ) : (
          <LoginForm />
        )
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Admin Routes */}
      {/* Super Admin Routes */}
      <Route path="/super-admin/*" element={
        <ProtectedRoute requiredRole={['super-admin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute requiredRole={['admin']}>
          <HospitalProfile />
        </ProtectedRoute>
      } />
      <Route path="/admin/tests" element={
        <ProtectedRoute requiredRole={['admin']}>
          <TestManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Lab Technician Routes */}
      <Route path="/lab" element={
        <ProtectedRoute requiredRole={['admin', 'technician']}>
          <LabDashboard />
        </ProtectedRoute>
      } />
      <Route path="/lab/register" element={
        <ProtectedRoute requiredRole={['admin', 'technician']}>
          <PatientRegistration />
        </ProtectedRoute>
      } />
      <Route path="/lab/patients" element={
        <ProtectedRoute requiredRole={['admin', 'technician']}>
          <Patients />
        </ProtectedRoute>
      } />
      <Route path="/lab/sample-collection/:patientId" element={
        <ProtectedRoute requiredRole={['admin', 'technician']}>
          <SampleCollection />
        </ProtectedRoute>
      } />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
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
