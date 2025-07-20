import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/SignUp';
import LandlordDashboard from './pages/LandlordDashboard';
import CreateListing from './pages/CreateListing';
import TenantDashboard from './pages/TenantDashboard'; // A placeholder for now
import PropertyDetails from './pages/PropertyDetails'; // A placeholder for now
import NotFound from './pages/NotFound'; // Placeholder for 404

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<TenantDashboard />} /> {/* Default landing for all users or a marketing page */}

            {/* Protected Routes - Landlord */}
            <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
              <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
              <Route path="/landlord/create-listing" element={<CreateListing />} />
            </Route>

            {/* Protected Routes - Tenant (for their specific dashboard if different from public search) */}
            <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            </Route>

            {/* Publicly accessible property details (Sprint 2) */}
            <Route path="/property/:id" element={<PropertyDetails />} />

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;