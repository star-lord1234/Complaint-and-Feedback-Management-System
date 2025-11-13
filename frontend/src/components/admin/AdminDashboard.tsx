import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users,
  TrendingUp,
  MessageSquare,
  Star,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI, complaintsAPI, feedbackAPI } from '../../utils/api';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface AdminDashboardProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function AdminDashboard({ currentUser, currentPage, onNavigate, onLogout }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalTickets: 0,
    avgResolutionTime: '0 hours',
    highPriorityAlerts: 0,
    customerSatisfaction: 0
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, complaints, feedback] = await Promise.all([
        adminAPI.getStats().catch(() => ({})),
        complaintsAPI.getAll().catch(() => []),
        feedbackAPI.getAll().catch(() => [])
      ]);

      // Set KPIs
      setKpiData({
        totalTickets: stats.total_tickets || 0,
        avgResolutionTime: stats.avg_resolution_time || '0 hours',
        highPriorityAlerts: stats.high_priority_alerts || 0,
        customerSatisfaction: stats.customer_satisfaction || 0
      });

      // Category distribution
      const categoryMap: any = {};
      complaints.forEach((c: any) => {
        const cat = c.category || 'Other';
        categoryMap[cat] = categoryMap[cat] || { complaints: 0, feedback: 0 };
        categoryMap[cat].complaints++;
      });
      feedback.forEach((f: any) => {
        const cat = f.category || 'Other';
        categoryMap[cat] = categoryMap[cat] || { complaints: 0, feedback: 0 };
        categoryMap[cat].feedback++;
      });

      const categoryArray = Object.entries(categoryMap).map(([category, data]: any) => ({
        category,
        ...data
      }));
      setCategoryData(categoryArray);

      // Recent activity
      const activities: any[] = [];
      complaints.slice(0, 3).forEach((c: any) => {
        activities.push({
          id: c._id.substring(0, 8),
          type: 'complaint',
          title: c.title,
          customer: 'Customer',
          priority: c.priority,
          status: c.status,
          timestamp: formatDate(c.created_at)
        });
      });
      feedback.slice(0, 1).forEach((f: any) => {
        activities.push({
          id: f._id.substring(0, 8),
          type: 'feedback',
          title: f.comments.substring(0, 50),
          customer: 'Customer',
          rating: f.rating,
          status: f.status,
          timestamp: formatDate(f.created_at)
        });
      });

      setRecentActivity(activities);

    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor complaints, feedback, and system performance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-semibold">{kpiData.totalTickets}</p>
                  <p className="text-xs text-primary">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                  <p className="text-2xl font-semibold">{kpiData.avgResolutionTime}</p>
                  <p className="text-xs text-primary">-8% improvement</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority Alerts</p>
                  <p className="text-2xl font-semibold">{kpiData.highPriorityAlerts}</p>
                  <p className="text-xs text-destructive">Needs attention</p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-semibold">{kpiData.customerSatisfaction}</p>
                    <Star className="w-5 h-5 fill-primary text-primary" />
                  </div>
                  <p className="text-xs text-primary">+0.3 from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints by Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Category</CardTitle>
              <CardDescription>
                Distribution of complaints and feedback across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="complaints" fill="#FF4C61" name="Complaints" />
                  <Bar dataKey="feedback" fill="#00C49A" name="Feedback" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest complaints and feedback submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('tickets')}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'complaint' 
                        ? 'bg-destructive/10' 
                        : 'bg-primary/10'
                    }`}>
                      {activity.type === 'complaint' ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <Star className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{activity.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {activity.customer}
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {activity.priority && getPriorityBadge(activity.priority)}
                      {activity.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="text-xs">{activity.rating}</span>
                        </div>
                      )}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolution Rate</span>
                  <span className="text-sm font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="text-sm font-medium">84%</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}