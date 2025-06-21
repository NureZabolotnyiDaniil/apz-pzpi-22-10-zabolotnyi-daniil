import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import LanternList from './pages/Lanterns/LanternList';
import LanternForm from './pages/Lanterns/LanternForm';
import ParkList from './pages/Parks/ParkList';
import ParkForm from './pages/Parks/ParkForm';
import Statistics from './pages/Statistics/Statistics';
import UserManagement from './pages/Admin/UserManagement';
import DataManagement from './pages/Admin/DataManagement';
import AdminProfile from './pages/Admin/AdminProfile';
import BreakdownList from './pages/Breakdowns/BreakdownList';
import BreakdownForm from './pages/Breakdowns/BreakdownForm';
import RenovationList from './pages/Renovations/RenovationList';
import RenovationForm from './pages/Renovations/RenovationForm';
import CompanyList from './pages/Companies/CompanyList';
import CompanyForm from './pages/Companies/CompanyForm';
import RepairmanList from './pages/Repairmen/RepairmanList';
import RepairmanForm from './pages/Repairmen/RepairmanForm';

import ParkMap from './pages/Parks/ParkMap';
import LoadingSpinner from './components/UI/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Lantern routes */}
        <Route path="lanterns" element={<LanternList />} />
        <Route path="lanterns/new" element={<LanternForm />} />
        <Route path="lanterns/:id/edit" element={<LanternForm />} />
        
        {/* Park routes */}
        <Route path="parks" element={<ParkList />} />
        <Route path="parks/new" element={<ParkForm />} />
        <Route path="parks/:id/edit" element={<ParkForm />} />
        <Route path="parks/:parkId/map" element={<ParkMap />} />
        
        {/* Statistics */}
        <Route path="statistics" element={<Statistics />} />
        
        {/* Breakdown routes */}
        <Route path="breakdowns" element={<BreakdownList />} />
        <Route path="breakdowns/new" element={<BreakdownForm />} />
        <Route path="breakdowns/:id/edit" element={<BreakdownForm />} />
        
        {/* Renovation routes */}
        <Route path="renovations" element={<RenovationList />} />
        <Route path="renovations/new" element={<RenovationForm />} />
        <Route path="renovations/:id/edit" element={<RenovationForm />} />
        
        {/* Company routes */}
        <Route path="companies" element={<CompanyList />} />
        <Route path="companies/new" element={<CompanyForm />} />
        <Route path="companies/:id/edit" element={<CompanyForm />} />
        
        {/* Repairman routes */}
        <Route path="repairmen" element={<RepairmanList />} />
        <Route path="repairmen/new" element={<RepairmanForm />} />
        <Route path="repairmen/:id/edit" element={<RepairmanForm />} />
        
        {/* Admin routes */}
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/data" element={<DataManagement />} />
        <Route path="admin/profile" element={<AdminProfile />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MapProvider>
          <Router>
            <div className="App">
              <AppRoutes />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    marginTop: '70px', // Below header
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </MapProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App; 