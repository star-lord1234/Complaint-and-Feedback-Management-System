import React, { useState } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  Star,
  MessageSquare,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface UserSubmitProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function UserSubmit({ currentUser, currentPage, onNavigate, onLogout }: UserSubmitProps) {
  const [activeTab, setActiveTab] = useState('complaint');
  const [showModal, setShowModal] = useState(false);
  const [ticketId, setTicketId] = useState('');
  
  // Complaint form state
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    category: '',
    description: '',
    priority: '',
    anonymous: false
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    category: '',
    comments: ''
  });

  const handleComplaintSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(complaintForm)
      });

      if (!response.ok) {
        throw new Error('Failed to submit complaint');
      }

      const data = await response.json();
      setTicketId(data._id);
      setShowModal(true);
      
      // Reset form
      setComplaintForm({
        title: '',
        category: '',
        description: '',
        priority: '',
        anonymous: false
      });
    } catch (error) {
      alert('Failed to submit complaint. Please try again.');
      console.error(error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(feedbackForm)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      setTicketId(data._id);
      setShowModal(true);
      
      // Reset form
      setFeedbackForm({
        rating: 0,
        category: '',
        comments: ''
      });
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
      console.error(error);
    }
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating 
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Layout 
      currentUser={currentUser}
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Submit Complaint or Feedback</h1>
          <p className="text-muted-foreground">
            Let us know about your experience or report any issues
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="complaint" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Submit Complaint
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Give Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complaint" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Complaint Form
                </CardTitle>
                <CardDescription>
                  Please provide detailed information about your complaint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Complaint Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of your complaint"
                      value={complaintForm.title}
                      onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={complaintForm.category} 
                      onValueChange={(value) => setComplaintForm({...complaintForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Billing & Payment</SelectItem>
                        <SelectItem value="service">Service Quality</SelectItem>
                        <SelectItem value="delivery">Delivery Issues</SelectItem>
                        <SelectItem value="technical">Technical Problems</SelectItem>
                        <SelectItem value="staff">Staff Behavior</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select 
                    value={complaintForm.priority} 
                    onValueChange={(value) => setComplaintForm({...complaintForm, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Low</Badge>
                          <span>Minor issue, no urgent action needed</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>
                          <span>Important issue, needs attention</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">High</Badge>
                          <span>Urgent issue, immediate action required</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your complaint..."
                    className="min-h-32"
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label htmlFor="attachments" className="cursor-pointer">
                        Attachments
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Upload relevant files (images, documents, etc.)
                      </p>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Files
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="anonymous" 
                      checked={complaintForm.anonymous}
                      onCheckedChange={(checked) => setComplaintForm({...complaintForm, anonymous: checked})}
                    />
                    <Label htmlFor="anonymous">Submit anonymously</Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleComplaintSubmit}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!complaintForm.title || !complaintForm.category || !complaintForm.description || !complaintForm.priority}
                  >
                    Submit Complaint
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setComplaintForm({
                      title: '',
                      category: '',
                      description: '',
                      priority: '',
                      anonymous: false
                    })}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Feedback Form
                </CardTitle>
                <CardDescription>
                  Share your experience and help us improve our services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Overall Rating *</Label>
                  <div className="flex items-center gap-4">
                    <StarRating 
                      rating={feedbackForm.rating} 
                      onRatingChange={(rating) => setFeedbackForm({...feedbackForm, rating})} 
                    />
                    <span className="text-sm text-muted-foreground">
                      {feedbackForm.rating > 0 && (
                        feedbackForm.rating === 5 ? 'Excellent' :
                        feedbackForm.rating === 4 ? 'Good' :
                        feedbackForm.rating === 3 ? 'Average' :
                        feedbackForm.rating === 2 ? 'Poor' : 'Very Poor'
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback-category">Category *</Label>
                  <Select 
                    value={feedbackForm.category} 
                    onValueChange={(value) => setFeedbackForm({...feedbackForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What's your feedback about?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service Quality</SelectItem>
                      <SelectItem value="product">Product Quality</SelectItem>
                      <SelectItem value="website">Website/App Experience</SelectItem>
                      <SelectItem value="staff">Staff Performance</SelectItem>
                      <SelectItem value="delivery">Delivery Experience</SelectItem>
                      <SelectItem value="general">General Experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">Comments *</Label>
                  <Textarea
                    id="comments"
                    placeholder="Please share your detailed feedback..."
                    className="min-h-32"
                    value={feedbackForm.comments}
                    onChange={(e) => setFeedbackForm({...feedbackForm, comments: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label htmlFor="feedback-attachments" className="cursor-pointer">
                      Optional Attachments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Upload screenshots or other relevant files
                    </p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleFeedbackSubmit}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!feedbackForm.rating || !feedbackForm.category || !feedbackForm.comments}
                  >
                    Submit Feedback
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setFeedbackForm({
                      rating: 0,
                      category: '',
                      comments: ''
                    })}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Success Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center">
                {activeTab === 'complaint' ? 'Complaint Submitted!' : 'Feedback Submitted!'}
              </DialogTitle>
              <DialogDescription className="text-center">
                Your {activeTab} has been successfully submitted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'complaint' ? 'Ticket ID:' : 'Feedback ID:'}
                </p>
                <p className="font-mono font-semibold text-lg">{ticketId}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    onNavigate('tickets');
                  }}
                >
                  View {activeTab === 'complaint' ? 'Tickets' : 'Feedback'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}