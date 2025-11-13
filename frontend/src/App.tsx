import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/user/UserDashboard';
import { UserSubmit } from './components/user/UserSubmit';
import { UserTickets } from './components/user/UserTickets';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTickets } from './components/admin/AdminTickets';
import { AdminInsights } from './components/admin/AdminInsights';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminTimeline } from './components/admin/AdminTimeline';
import { AuthProvider, useAuth } from './context/AuthContext';

type UserType = 'user' | 'admin' | null;
type Page = 'login' | 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');

  React.useEffect(() => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const currentUser: UserType = user?.role || null;

  if (currentPage === 'login' || !currentUser) {
    return <LoginPage onLogin={() => {}} />;
  }

  const commonProps = {
    currentUser,
    currentPage,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
  };

  switch (currentPage) {
    case 'dashboard':
      return currentUser === 'admin' ? 
        <AdminDashboard {...commonProps} /> : 
        <UserDashboard {...commonProps} />;
    case 'submit':
      return <UserSubmit {...commonProps} />;
    case 'tickets':
      return currentUser === 'admin' ? 
        <AdminTickets {...commonProps} /> : 
        <UserTickets {...commonProps} />;
    case 'insights':
      return <AdminInsights {...commonProps} />;
    case 'users':
      return <AdminUsers {...commonProps} />;
    case 'timeline':
      return <AdminTimeline {...commonProps} />;
    default:
      return currentUser === 'admin' ? 
        <AdminDashboard {...commonProps} /> : 
        <UserDashboard {...commonProps} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}