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
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};