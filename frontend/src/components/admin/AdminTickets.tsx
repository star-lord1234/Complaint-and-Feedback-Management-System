import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  ArrowUpDown,
  FileText,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { complaintsAPI, adminAPI } from '../../utils/api';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface AdminTicketsProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Ticket {
  _id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved' | string;
  assigned_to: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
  progress: number;
}

interface ProgressLog {
  id: string;
  timestamp: string;
  message: string;
  author: string;
  type: 'update' | 'status_change' | 'assignment';
}

export function AdminTickets({ currentUser, currentPage, onNavigate, onLogout }: AdminTicketsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedTicketForProgress, setSelectedTicketForProgress] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedTicketForAction, setSelectedTicketForAction] = useState<string | null>(null);
  const [assignToUserId, setAssignToUserId] = useState<string>('');
  const [assignDepartment, setAssignDepartment] = useState<string>('');
  const [statusValue, setStatusValue] = useState<'open' | 'in-progress' | 'resolved'>('open');
  const [priorityValue, setPriorityValue] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState<boolean>(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [complaints, allUsers] = await Promise.all([
          complaintsAPI.getAll(),
          adminAPI.getAllUsers().catch(() => []),
        ]);
        setTickets(complaints);
        setUsers(allUsers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTickets = useMemo(() => {
    const list = tickets || [];
    return list.filter((t) => {
      const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t._id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (t.status || '') === statusFilter;
      const matchesPriority = priorityFilter === 'all' || (t.priority || '') === priorityFilter;
      const matchesDepartment = departmentFilter === 'all' || (t.department || '') === departmentFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, departmentFilter]);

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const refreshTickets = async () => {
    try {
      const data = await complaintsAPI.getAll();
      setTickets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(filteredTickets.map(ticket => ticket._id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets(prev => [...prev, ticketId]);
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId));
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      await Promise.all(selectedTickets.map((id) => {
        switch (action) {
          case 'assign':
            return complaintsAPI.update(id, { assigned_to: assignToUserId || null, department: assignDepartment || null });
          case 'status-progress':
            return complaintsAPI.update(id, { status: 'in-progress' });
          case 'status-resolved':
            return complaintsAPI.update(id, { status: 'resolved', progress: 100 });
          case 'priority-high':
            return complaintsAPI.update(id, { priority: 'high' });
          default:
            return Promise.resolve();
        }
      }));
      setSelectedTickets([]);
      refreshTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogProgress = (ticketId: string, currentProgress: number) => {
    setSelectedTicketForProgress(ticketId);
    setProgressValue(currentProgress || 0);
    setProgressDialogOpen(true);
  };

  const handleSubmitProgress = async () => {
    if (selectedTicketForProgress != null) {
      try {
        await complaintsAPI.update(selectedTicketForProgress, { progress: Math.max(0, Math.min(100, Number(progressValue) || 0)) });
        setProgressDialogOpen(false);
        setSelectedTicketForProgress(null);
        refreshTickets();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenAssign = (ticketId: string) => {
    setSelectedTicketForAction(ticketId);
    setAssignDialogOpen(true);
  };

  const handleOpenStatus = (ticketId: string, currentStatus: any) => {
    setSelectedTicketForAction(ticketId);
    setStatusValue((currentStatus as any) || 'open');
    setStatusDialogOpen(true);
  };

  const handleOpenPriority = (ticketId: string, currentPriority: any) => {
    setSelectedTicketForAction(ticketId);
    setPriorityValue((currentPriority as any) || 'medium');
    setPriorityDialogOpen(true);
  };

  const submitAssign = async () => {
    if (!selectedTicketForAction) return;
    try {
      await complaintsAPI.update(selectedTicketForAction, { assigned_to: assignToUserId || null, department: assignDepartment || null });
      setAssignDialogOpen(false);
      setSelectedTicketForAction(null);
      setAssignToUserId('');
      setAssignDepartment('');
      refreshTickets();
    } catch (e) { console.error(e); }
  };

  const submitStatus = async () => {
    if (!selectedTicketForAction) return;
    try {
      const payload: any = { status: statusValue };
      if (statusValue === 'resolved') payload.progress = 100;
      await complaintsAPI.update(selectedTicketForAction, payload);
      setStatusDialogOpen(false);
      setSelectedTicketForAction(null);
      refreshTickets();
    } catch (e) { console.error(e); }
  };

  const submitPriority = async () => {
    if (!selectedTicketForAction) return;
    try {
      await complaintsAPI.update(selectedTicketForAction, { priority: priorityValue });
      setPriorityDialogOpen(false);
      setSelectedTicketForAction(null);
      refreshTickets();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Delete this complaint?')) return;
    try {
      await complaintsAPI.delete(ticketId);
      refreshTickets();
    } catch (e) { console.error(e); }
  };

  const exportCSV = () => {
    const rows = filteredTickets.map(t => ({
      id: t._id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      assigned_to: t.assigned_to || '',
      department: t.department || '',
      created_at: t.created_at,
      updated_at: t.updated_at,
      progress: t.progress,
    }));
    const header = Object.keys(rows[0] || { id: '', title: '' });
    const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'complaints.csv';
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Complaint Center</h1>
            <p className="text-muted-foreground">
              Manage and resolve customer complaints
            </p>
          </div>
          <div className="flex gap-2">
            {selectedTickets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedTickets.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('assign')}>
                    Assign to Staff
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status-progress')}>
                    Change Status to In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status-resolved')}>
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('priority-high')}>
                    Set Priority to High
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button className="bg-primary hover:bg-primary/90" onClick={exportCSV}>
              Export Data
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
            <CardDescription>
              All customer complaints and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="h-auto p-0 font-medium">
                      Ticket ID
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedTickets.includes((ticket as any)._id)}
                        onCheckedChange={(checked) => handleSelectTicket((ticket as any)._id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{(ticket as any)._id?.slice(-6) || ''}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">{ticket.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                          <User className="w-3 h-3" />
                        </div>
                        User
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(String(ticket.status))}</TableCell>
                    <TableCell>
                      <span className={!ticket.assigned_to ? 'text-muted-foreground italic' : ''}>
                        {ticket.assigned_to || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.department || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(ticket.created_at).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">Updated {new Date(ticket.updated_at).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenAssign((ticket as any)._id)}>Assign Staff</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenStatus((ticket as any)._id, ticket.status)}>Change Status</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenPriority((ticket as any)._id, ticket.priority)}>Set Priority</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLogProgress((ticket as any)._id, ticket.progress)}>
                            Log Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete((ticket as any)._id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Progress Logging Dialog */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Progress</DialogTitle>
              <DialogDescription>
                Update progress for ticket {selectedTicketForProgress}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="progress-value">Progress Percentage</Label>
                <Input
                  id="progress-value"
                  type="number"
                  min={0}
                  max={100}
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setProgressDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitProgress}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Staff Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Staff</DialogTitle>
              <DialogDescription>
                Assign a staff member and optionally set department.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Staff</Label>
                <Select value={assignToUserId} onValueChange={setAssignToUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id || u._id} value={(u.id || u._id) as string}>
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={assignDepartment} onValueChange={setAssignDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={submitAssign} disabled={!assignToUserId && !assignDepartment}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Status Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusValue} onValueChange={(v: any) => setStatusValue(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={submitStatus}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set Priority Dialog */}
        <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Priority</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityValue} onValueChange={(v: any) => setPriorityValue(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={submitPriority}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}