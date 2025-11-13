import React, { useState, useEffect } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search,
  Filter,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  Star,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { complaintsAPI, feedbackAPI } from '../../utils/api';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface UserTicketsProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface Ticket {
  id: string;
  type: 'complaint' | 'feedback';
  title: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'pending' | 'addressed';
  priority?: 'low' | 'medium' | 'high';
  rating?: number;
  date: string;
  lastUpdate: string;
  description: string;
  responses?: Array<{
    id: string;
    author: string;
    message: string;
    timestamp: string;
    isStaff: boolean;
  }>;
}

export function UserTickets({ currentUser, currentPage, onNavigate, onLogout }: UserTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const [complaints, feedback] = await Promise.all([
        complaintsAPI.getAll().catch(() => []),
        feedbackAPI.getAll().catch(() => [])
      ]);

      const allTickets: Ticket[] = [
        ...complaints.map((c: any) => ({
          id: c._id,
          type: 'complaint' as const,
          title: c.title,
          category: c.category,
          status: c.status,
          priority: c.priority,
          date: formatDate(c.created_at),
          lastUpdate: formatDate(c.updated_at),
          description: c.description,
          responses: []
        })),
        ...feedback.map((f: any) => ({
          id: f._id,
          type: 'feedback' as const,
          title: f.comments.substring(0, 100) + (f.comments.length > 100 ? '...' : ''),
          category: f.category,
          status: f.status,
          rating: f.rating,
          date: formatDate(f.created_at),
          lastUpdate: formatDate(f.updated_at),
          description: f.comments,
          responses: []
        }))
      ];

      setTickets(allTickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
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

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'complaints' && ticket.type === 'complaint') ||
                      (activeTab === 'feedback' && ticket.type === 'feedback');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      const newResponse = {
        id: Date.now().toString(),
        author: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleString(),
        isStaff: false
      };
      
      setSelectedTicket({
        ...selectedTicket,
        responses: [...(selectedTicket.responses || []), newResponse]
      });
      setNewMessage('');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Tickets & Feedback</h1>
            <p className="text-muted-foreground">
              Track your complaints and feedback submissions
            </p>
          </div>
          <Button onClick={() => onNavigate('submit')} className="bg-primary hover:bg-primary/90">
            <MessageSquare className="w-4 h-4 mr-2" />
            Submit New
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tickets..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="addressed">Addressed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
            <TabsTrigger value="complaints">
              Complaints ({tickets.filter(t => t.type === 'complaint').length})
            </TabsTrigger>
            <TabsTrigger value="feedback">
              Feedback ({tickets.filter(t => t.type === 'feedback').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t submitted any tickets yet'}
                  </p>
                  <Button onClick={() => onNavigate('submit')}>
                    Submit Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          ticket.type === 'complaint' 
                            ? 'bg-destructive/10' 
                            : 'bg-primary/10'
                        }`}>
                          {ticket.type === 'complaint' ? (
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                          ) : (
                            <Star className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-lg">{ticket.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {ticket.id}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground">
                            {ticket.description.substring(0, 120)}
                            {ticket.description.length > 120 && '...'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {ticket.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Updated {ticket.lastUpdate}
                            </div>
                            <span className="text-primary">{ticket.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {ticket.priority && getPriorityBadge(ticket.priority)}
                          {ticket.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              <span className="text-sm">{ticket.rating}</span>
                            </div>
                          )}
                          {getStatusBadge(ticket.status)}
                        </div>
                        {ticket.responses && ticket.responses.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        {selectedTicket.type === 'complaint' ? (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        ) : (
                          <Star className="w-5 h-5 text-primary" />
                        )}
                        {selectedTicket.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedTicket.id}</Badge>
                        <span className="text-sm text-muted-foreground">{selectedTicket.category}</span>
                        {selectedTicket.priority && getPriorityBadge(selectedTicket.priority)}
                        {selectedTicket.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm">{selectedTicket.rating}</span>
                          </div>
                        )}
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                    </div>
                  </div>
                  <DialogDescription className="text-left">
                    {selectedTicket.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Responses */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Conversation</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {selectedTicket.responses?.map((response) => (
                        <div 
                          key={response.id}
                          className={`flex gap-3 ${response.isStaff ? '' : 'flex-row-reverse'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            response.isStaff 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div className={`flex-1 space-y-1 ${
                            response.isStaff ? '' : 'text-right'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{response.author}</span>
                              <span className="text-xs text-muted-foreground">{response.timestamp}</span>
                            </div>
                            <div className={`p-3 rounded-lg ${
                              response.isStaff 
                                ? 'bg-primary/10 text-left' 
                                : 'bg-muted text-left'
                            }`}>
                              {response.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add response */}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'addressed' && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Add Response</h4>
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-20"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Send Message
                          </Button>
                          <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}