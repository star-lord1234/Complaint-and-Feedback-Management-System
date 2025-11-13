import React from 'react';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Users, 
  Clock,
  Shield,
  MessageCircle
} from 'lucide-react';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface SidebarProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavItem {
  page: Page;
  label: string | ((userType: UserType) => string);
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const navItems: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'submit', label: 'Submit', icon: MessageSquare, userOnly: true },
  { page: 'tickets', label: (currentUser) => currentUser === 'admin' ? 'Complaint Center' : 'My Tickets', icon: FileText },
  { page: 'insights', label: 'Feedback Insights', icon: BarChart3, adminOnly: true },
  { page: 'users', label: 'User Management', icon: Users, adminOnly: true },
  { page: 'timeline', label: 'Timeline Planner', icon: Clock, adminOnly: true },
];

export function Sidebar({ currentUser, currentPage, onNavigate }: SidebarProps) {
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && currentUser !== 'admin') return false;
    if (item.userOnly && currentUser !== 'user') return false;
    return true;
  });

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            {currentUser === 'admin' ? (
              <Shield className="w-6 h-6 text-primary-foreground" />
            ) : (
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {currentUser === 'admin' ? 'Admin Panel' : 'User Portal'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Complaint & Feedback
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          const label = typeof item.label === 'function' ? item.label(currentUser) : item.label;
          
          return (
            <Button
              key={item.page}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => onNavigate(item.page)}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Logged in as {currentUser}
        </div>
      </div>
    </aside>
  );
}