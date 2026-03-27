
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppointmentDetails from './features/appointments/pages/AppointmentDetails';
import CalendarView from './features/appointments/pages/CalendarView';
import BookingLanding from './features/publicBooking/pages/BookingLanding';
import BookingSuccess from './features/publicBooking/pages/BookingSuccess';
import Home from './features/dashboard/pages/Home';
import ClinicSettings from './features/clinic/pages/ClinicSettings';
import MembersList from './features/members/pages/MembersList';
import ServicesList from './features/services/pages/ServicesList';

// Fix: Updated import to uppercase 'Guards' to resolve casing conflict with guards.tsx
import { PrivateRoute } from './routes/Guards';
import ProvidersList from './features/providers/pages/ProvidersList';
import ClinicsManagement from './features/clinic/pages/ClinicsManagement';
import ChoosePlan from './features/billing/pages/ChoosePlan';
import NoAccess from './pages/NoAccess';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import Invitations from './features/auth/pages/Invitations';
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';
import { useAuthStore } from './store/auth.store';

const App: React.FC = () => {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/choose-plan" element={<ChoosePlan />} />
        
        {/* Public Booking Flow */}
        <Route element={<PublicLayout />}>
          <Route path="/booking" element={<BookingLanding />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/booking/flow" element={<Navigate to="/booking" replace />} />
        </Route>

        <Route path="/no-access" element={<NoAccess />} />
        
        {/* Dashboard Features Protected by Auth and Subscription Guard */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'collaborator', 'colaborador', 'administrador']} />}>
          <Route path="/invitations" element={<Invitations />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<CalendarView />} />
            <Route path="/history" element={<Home />} />
            <Route path="/settings" element={<ClinicSettings />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/services" element={<ServicesList />} />
            <Route path="/providers" element={<ProvidersList />} />
            <Route path="/units" element={<ClinicsManagement />} />
            <Route path="/appointment/:id" element={<AppointmentDetails />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
