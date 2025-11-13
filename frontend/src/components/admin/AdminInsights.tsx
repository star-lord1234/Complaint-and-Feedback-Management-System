import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Download,
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Clock,
  FileText
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { adminAPI, complaintsAPI, feedbackAPI } from '../../utils/api';

type UserType = 'user' | 'admin';
type Page = 'dashboard' | 'submit' | 'tickets' | 'insights' | 'users' | 'timeline';

interface AdminInsightsProps {
  currentUser: UserType;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function AdminInsights({ currentUser, currentPage, onNavigate, onLogout }: AdminInsightsProps) {
  const [timeFilter, setTimeFilter] = useState('30');
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<any>(null);

  const feedbackCategoriesData = useMemo(() => {
    const feedback = insightsData?.category_distribution?.feedback || [];
    const palette = ['#00C49A', '#FF4C61', '#FFBB28', '#0088FE', '#8884D8', '#A78BFA'];
    return feedback.map((c: any, idx: number) => ({ name: c._id || 'Uncategorized', value: c.count || 0, color: palette[idx % palette.length] }));
  }, [insightsData]);

  const sentimentData = useMemo(() => ([
    { name: 'Positive', value: insightsData?.sentiment?.positive || 0, color: '#00C49A' },
    { name: 'Neutral', value: insightsData?.sentiment?.neutral || 0, color: '#FFBB28' },
    { name: 'Negative', value: insightsData?.sentiment?.negative || 0, color: '#FF4C61' }
  ]), [insightsData]);

  const responseTimeData = [
    { month: 'Jul', avgTime: 3.2 },
    { month: 'Aug', avgTime: 2.8 },
    { month: 'Sep', avgTime: 2.5 },
    { month: 'Oct', avgTime: 2.3 },
    { month: 'Nov', avgTime: 2.1 },
    { month: 'Dec', avgTime: 2.4 },
    { month: 'Jan', avgTime: 2.0 }
  ];

  const satisfactionTrendData = [
    { month: 'Jul', rating: 3.8 },
    { month: 'Aug', rating: 4.0 },
    { month: 'Sep', rating: 4.1 },
    { month: 'Oct', rating: 4.2 },
    { month: 'Nov', rating: 4.3 },
    { month: 'Dec', rating: 4.1 },
    { month: 'Jan', rating: 4.2 }
  ];

  const topIssuesData = useMemo(() => {
    const complaints = insightsData?.category_distribution?.complaints || [];
    return complaints.map((c: any) => ({ issue: c._id || 'Uncategorized', count: c.count || 0, trend: 'stable' }));
  }, [insightsData]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-primary" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminAPI.getInsights();
        setInsightsData(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const exportCSV = () => {
    const flat = {
      total_feedback: insightsData?.total_feedback || 0,
      positive: insightsData?.sentiment?.positive || 0,
      neutral: insightsData?.sentiment?.neutral || 0,
      negative: insightsData?.sentiment?.negative || 0,
    };
    const lines = [Object.keys(flat).join(','), Object.values(flat).join(',')].join('\n');
    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'insights.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printContents = document.getElementById('insights-root')?.innerHTML || '';
    const popup = window.open('', '_blank', 'width=1024,height=768');
    if (!popup) return;
    popup.document.open();
    popup.document.write(`<!doctype html><html><head><title>Insights Report</title></head><body>${printContents}</body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
    popup.close();
  };

  return (
    <Layout 
      currentUser={currentUser}
      currentPage={currentPage}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6" id="insights-root">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Feedback Insights</h1>
            <p className="text-muted-foreground">
              Analyze customer feedback trends and satisfaction metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary hover:bg-primary/90" onClick={exportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                  <p className="text-2xl font-semibold">{insightsData?.total_feedback ?? '-'}</p>
                  <p className="text-xs text-primary">&nbsp;</p>
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
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-semibold">2.0h</p>
                  <p className="text-xs text-primary">-17% improvement</p>
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
                  <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-semibold">{insightsData ? (insightsData.customer_satisfaction || 0).toFixed(1) : '-'}</p>
                    <Star className="w-5 h-5 fill-primary text-primary" />
                  </div>
                  <p className="text-xs text-primary">&nbsp;</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Positive Feedback</p>
                  <p className="text-2xl font-semibold">65%</p>
                  <p className="text-xs text-primary">+3% improvement</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Categories Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
              <CardDescription>
                Distribution of feedback across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={feedbackCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feedbackCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Sentiment</CardTitle>
              <CardDescription>
                Positive vs Negative feedback ratio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Response Time Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Average Response Time Trend</CardTitle>
              <CardDescription>
                Monthly trend of average response time in hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#00C49A" 
                    strokeWidth={3}
                    dot={{ fill: '#00C49A', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Satisfaction Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction Trend</CardTitle>
              <CardDescription>
                Monthly average customer satisfaction rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={satisfactionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[3.5, 4.5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#FF4C61" 
                    strokeWidth={3}
                    dot={{ fill: '#FF4C61', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Top Issues & Trends</CardTitle>
            <CardDescription>
              Most frequently reported issues and their trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topIssuesData.map((issue, index) => (
                <div 
                  key={issue.issue}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{issue.issue}</h4>
                      <p className="text-sm text-muted-foreground">{issue.count} reports this month</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(issue.trend)}
                    <Badge variant="outline">{issue.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Download detailed reports in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2" onClick={exportCSV}>
                <FileText className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={exportPDF}>
                <FileText className="w-4 h-4" />
                Export PDF Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Raw Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}