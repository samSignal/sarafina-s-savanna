import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
}

export default function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin/Super Admin bypass logic matching AdminLayout
  // Check for admin/staff role
  const role = (user.role || "").toLowerCase();
  const roleName = (user.role_name || "").toLowerCase();

  const isAdmin = 
      role === 'admin' || 
      role === 'super_admin' ||
      roleName === 'administrator';

  if (isAdmin) {
    return <>{children}</>;
  }

  const isStaff = 
      (roleName && !['customer', 'client'].includes(roleName)) ||
      (role && !['customer', 'client'].includes(role));

  if (!isStaff) {
    return <Navigate to="/account" replace />;
  }

  // Check specific permission
  // If permission is '*', allow everything (super admin equivalent)
  const hasPermission = user.permissions?.includes(permission) || user.permissions?.includes('*');

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-8 text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 max-w-md mb-4">
          You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="text-xs text-gray-400 border-t pt-2">
            <p>Role: {user.role_name || user.role}</p>
            <p>Required: {permission}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
