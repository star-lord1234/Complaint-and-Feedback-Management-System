import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Filter
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { complaintsAPI } from '../../utils/api';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface AdminTimelineProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface TimelineItem {
  _id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | string;
  status: 'open' | 'in-progress' | 'resolved' | string;
  assigned_to: string | null;
  customer?: string;
  created_at: string;
  estimated_resolution?: string;
  department: string | null;
  progress: number;
}

export function AdminTimeline({ currentUser, currentPage, onNavigate, onLogout }: AdminTimelineProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [items, setItems] = useState<TimelineItem[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const complaints = await complaintsAPI.getAll();
        setItems(complaints);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-destructive';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-destructive bg-destructive/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-muted-foreground bg-muted/10';
      default:
        return 'border-muted bg-muted/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-primary hover:bg-primary/90">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredItems = useMemo(() => items.filter(item => {
    const matchesDepartment = selectedDepartment === 'all' || (item.department || '') === selectedDepartment;
    const matchesPriority = selectedPriority === 'all' || (item.priority || '') === selectedPriority;
    return matchesDepartment && matchesPriority;
  }), [items, selectedDepartment, selectedPriority]);

  const groupedByDate = filteredItems.reduce((acc, item) => {
    const dateKey = new Date(item.created_at).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Layout 
      currentUser={currentUser}
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Timeline Planner</h1>
            <p className="text-muted-foreground">
              Track complaint resolution progress and timelines
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="space-y-6">
            {/* Timeline Legend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-destructive rounded"></div>
                    <span className="text-sm">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span className="text-sm">Resolved</span>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    Hover over items for detailed information
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <TooltipProvider>
              <div className="space-y-6">
                {sortedDates.map((date, dateIndex) => (
                  <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="font-medium">{new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</h3>
                      </div>
                      <Badge variant="outline">
                        {groupedByDate[date].length} ticket{groupedByDate[date].length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Timeline Line */}
                    {dateIndex < sortedDates.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-border z-0"></div>
                    )}

                    {/* Timeline Items */}
                    <div className="space-y-4 ml-8">
                      {groupedByDate[date].map((item, itemIndex) => (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <div className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getPriorityColor(item.priority)}`}>
                              {/* Timeline Dot */}
                              <div className={`absolute -left-10 top-6 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(item.status)}`}></div>
                              
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{item.title}</h4>
                                      <Badge variant="outline" className="text-xs">{String((item as any)._id).slice(-6)}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.category}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(String(item.status))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Customer:</span>
                                    <span>{item.customer || 'User'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Assigned:</span>
                                    <span className={!item.assigned_to ? 'italic text-muted-foreground' : ''}>
                                      {item.assigned_to || 'Unassigned'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Due:</span>
                                    <span>{item.estimated_resolution ? new Date(item.estimated_resolution).toLocaleDateString() : '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">{item.department || 'N/A'}</Badge>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span>{Number(item.progress) || 0}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all ${getStatusColor(item.status)}`}
                                      style={{ width: `${Number(item.progress) || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm">Category: {item.category}</p>
                              <p className="text-sm">Priority: {item.priority}</p>
                              <p className="text-sm">Department: {item.department}</p>
                              <p className="text-sm">Status: {item.status}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
        </div>
      </div>
    </Layout>
  );
}