import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { ADOFDashboard } from '@/components/ADOFDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Role-based routing after login
    if (user.role === 'ADOF') {
      return <ADOFDashboard />;
    } else {
      // Default to Dashboard for TVET role or any other role
      return <Dashboard />;
    }
  }

  return (
    <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
  );
};

export default Index;
