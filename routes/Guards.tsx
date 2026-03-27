
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { UserRole } from '../types';

interface GuardProps {
  allowedRoles?: UserRole[];
}

/**
 * Route guard that handles both authentication and clinic subscription status.
 * This file is the primary source for Route Guards to resolve casing conflicts.
 */
export const PrivateRoute: React.FC<GuardProps> = ({ allowedRoles }) => {
  const user = api.getCurrentUser();
  const location = useLocation();
  const [isCheckingSub, setIsCheckingSub] = useState(true);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  useEffect(() => {
    const checkSub = async () => {
      if (user?.role === 'admin' && user.clinicId) {
        try {
          const active = await api.checkSubscription(user.clinicId);
          setHasActiveSub(active);
        } catch (err) {
          setHasActiveSub(false);
        }
      } else {
        // Staff members are not blocked by the subscription check here (handled at the clinic level)
        setHasActiveSub(true);
      }
      setIsCheckingSub(false);
    };
    checkSub();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isCheckingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user.clinicId && location.pathname !== '/invitations') {
    return <Navigate to="/invitations" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-access" replace />;
  }

  return <Outlet />;
};
