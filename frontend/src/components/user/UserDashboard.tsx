import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  FileText,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { complaintsAPI, feedbackAPI } from '../../utils/api';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface UserDashboardProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface ActivityItem {
  id: string;
  type: 'complaint' | 'feedback';
  title: string;
  status: string;
  date: string;
  priority?: string;
  rating?: number;
}

export function UserDashboard({ currentUser, currentPage, onNavigate, onLogout }: UserDashboardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    complaints: { open: 0, inProgress: 0, resolved: 0 },
    feedback: { pending: 0, addressed: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [complaints, feedback] = await Promise.all([
        complaintsAPI.getAll().catch(() => []),
        feedbackAPI.getAll().catch(() => [])
      ]);

      // Calculate stats
      const complaintStats = {
        open: complaints.filter((c: any) => c.status === 'open').length,
        inProgress: complaints.filter((c: any) => c.status === 'in-progress').length,
        resolved: complaints.filter((c: any) => c.status === 'resolved').length
      };

      const feedbackStats = {
        pending: feedback.filter((f: any) => f.status === 'pending').length,
        addressed: feedback.filter((f: any) => f.status === 'addressed').length
      };

      setStats({
        complaints: complaintStats,
        feedback: feedbackStats
      });

      // Create recent activity
      const activities: ActivityItem[] = [];
      
      complaints.forEach((complaint: any) => {
        activities.push({
          id: complaint._id.substring(0, 8),
          type: 'complaint',
          title: complaint.title,
          status: complaint.status,
          date: formatDate(complaint.created_at),
          priority: complaint.priority
        });
      });

      feedback.forEach((fb: any) => {
        activities.push({
          id: fb._id.substring(0, 8),
          type: 'feedback',
          title: fb.comments.substring(0, 50) + (fb.comments.length > 50 ? '...' : ''),
          status: fb.status,
          date: formatDate(fb.created_at),
          rating: fb.rating
        });
      });

      // Sort by date and take latest 5
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-primary hover:bg-primary/90">Resolved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'addressed':
        return <Badge className="bg-primary hover:bg-primary/90">Addressed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout 
      currentUser={currentUser}
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Here's your complaint and feedback overview
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => onNavigate('submit')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigate('tickets')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.complaints.open}</p>
                  <p className="text-sm text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.complaints.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.complaints.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.feedback.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.feedback.addressed}</p>
                  <p className="text-sm text-muted-foreground">Addressed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest complaints and feedback submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.type === 'complaint' 
                        ? 'bg-destructive/10' 
                        : 'bg-primary/10'
                    }`}>
                      {item.type === 'complaint' ? (
                        <AlertCircle className={`w-5 h-5 ${
                          item.type === 'complaint' ? 'text-destructive' : 'text-primary'
                        }`} />
                      ) : (
                        <Star className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.priority && getPriorityBadge(item.priority)}
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    )}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}