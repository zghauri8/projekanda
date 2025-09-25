import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api, SignupData, SigninData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, GraduationCap } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as 'TVET' | 'ADOF' | '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
          throw new Error('Please fill in all fields');
        }
        
        const signupData: SignupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        
        await api.signup(signupData);
        
        toast({
          title: 'Account created successfully!',
          description: 'Please sign in with your credentials.',
        });
        
        // Clear form and switch to signin mode
        setFormData({
          name: '',
          email: '',
          password: '',
          role: '' as 'TVET' | 'ADOF' | '',
        });
        onToggleMode();
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        
        const signinData: SigninData = {
          email: formData.email,
          password: formData.password,
        };
        
        const response = await api.signin(signinData);
        
        // Handle the API response format: { message: "Login successful", user: {...} }
        const userData = response.user || {
          id: response.id || Date.now().toString(),
          name: response.name || 'User',
          email: formData.email,
          role: response.role || 'TVET',
        };
        
        login(userData);
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {mode === 'signin' 
                ? 'Sign in to your account to continue' 
                : 'Join our educational platform today'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">Role</Label>
                <Select onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="bg-input/50 border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TVET">TVET (Technical & Vocational Education)</SelectItem>
                    <SelectItem value="ADOF">ADOF (Administrative Officer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background hover:bg-accent/50"
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background hover:bg-accent/50"
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={onToggleMode}
              className="font-medium text-primary hover:underline"
              disabled={isLoading}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};