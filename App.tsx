import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Role } from './types';
import { AuthPage } from './pages/AuthPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (user?.role === Role.ADMIN) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;