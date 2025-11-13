import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MessageCircle, Users, Shield, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type UserType = 'user' | 'admin' | null;

interface LoginPageProps {
  onLogin: (userType: UserType) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedType, setSelectedType] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return emailRegex.test(value);
  };

  const isStrongPassword = (value: string) => {
    // At least 8 chars, 1 upper, 1 lower, 1 number, 1 special, no spaces
    const lengthOk = value.length >= 8;
    const upperOk = /[A-Z]/.test(value);
    const lowerOk = /[a-z]/.test(value);
    const numberOk = /[0-9]/.test(value);
    const specialOk = /[^A-Za-z0-9]/.test(value);
    const noSpaces = !/\s/.test(value);
    return lengthOk && upperOk && lowerOk && numberOk && specialOk && noSpaces;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (mode === 'register') {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match!');
        return;
      }
      if (!isStrongPassword(password)) {
        setError('Password must be 8+ chars with upper, lower, number, and special');
        return;
      }
      
      setLoading(true);
      try {
        await register({
          name,
          email,
          password,
          role: selectedType,
          department: selectedType === 'admin' ? 'Administration' : 'N/A'
        });
        // Login will be handled by AuthContext
        resetForm();
      } catch (err: any) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
      
      setLoading(true);
      try {
        await login(email, password);
        // Login will be handled by AuthContext
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero section */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Your voice matters
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage and track feedback with ease
            </p>
          </div>
          
          {/* Platform Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">98.5%</div>
                <div className="text-sm text-muted-foreground">Resolution Rate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/50 to-accent/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-foreground/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">2.4h</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">12.5K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Login forms */}
        <div className="space-y-6">
          {/* User type selection */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                selectedType === 'user' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedType('user')}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  selectedType === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">{mode === 'login' ? 'Login as User' : 'Register as User'}</h3>
                  <p className="text-sm text-muted-foreground">Submit and track complaints</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                selectedType === 'admin' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedType('admin')}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  selectedType === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">{mode === 'login' ? 'Login as Admin' : 'Register as Admin'}</h3>
                  <p className="text-sm text-muted-foreground">Manage complaints & users</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Login/Register form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedType === 'admin' ? <Shield className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'} as {selectedType === 'admin' ? 'Administrator' : 'User'}
              </CardTitle>
              <CardDescription>
                {mode === 'login' 
                  ? `Enter your credentials to access the ${selectedType} dashboard`
                  : `Create a new ${selectedType} account to get started`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={selectedType === 'admin' ? 'admin@demo.com' : 'user@demo.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'login' ? 'password' : 'Create a password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2 pt-2">
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </Button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      resetForm();
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {mode === 'login' 
                      ? "Don't have an account? Register here" 
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}