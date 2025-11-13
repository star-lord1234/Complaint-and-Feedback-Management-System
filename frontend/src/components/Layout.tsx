import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Layout({ children, currentUser, currentPage, onNavigate, onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}