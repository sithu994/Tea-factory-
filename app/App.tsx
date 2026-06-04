import { useState } from 'react';
import LoginPage from './components/login-page';
import StaffDashboard from './components/staff-dashboard';
import SupplierPortal from './components/supplier-portal';

type View = 'login' | 'staff' | 'supplier';
type UserRole = 'staff' | 'supplier' | null;

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: 'staff' | 'supplier') => {
    setUserRole(role);
    if (role === 'staff') {
      setCurrentView('staff');
    } else {
      setCurrentView('supplier');
    }
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserRole(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {currentView === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      {currentView === 'staff' && (
        <StaffDashboard onLogout={handleLogout} />
      )}
      {currentView === 'supplier' && (
        <SupplierPortal onLogout={handleLogout} />
      )}
    </div>
  );
}
