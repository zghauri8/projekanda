import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, BookOpen, Briefcase, FileText, ClipboardCheck, BarChart3 } from 'lucide-react';
import { JobSelection } from './adof/JobSelection';
import { CVCollection } from './adof/CVCollection';
import { ADOFTestDisplay } from './adof/ADOFTestDisplay';
import { ADOFReports } from './adof/ADOFReports';

type ADOFStep = 'jobs' | 'cv' | 'test' | 'report';

interface SelectedJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
}

interface CVData {
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  education: string;
  file?: File;
}

export const ADOFDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<ADOFStep>('jobs');
  const [selectedJob, setSelectedJob] = useState<SelectedJob | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const handleJobSelect = (job: SelectedJob) => {
    setSelectedJob(job);
    setCurrentStep('cv');
  };

  const handleCVSubmit = (data: CVData) => {
    setCvData(data);
    setCurrentStep('test');
  };

  const handleTestComplete = (results: any) => {
    setTestResults(results);
    setCurrentStep('report');
  };

  const handleBackToJobs = () => {
    setCurrentStep('jobs');
    setSelectedJob(null);
    setCvData(null);
    setTestResults(null);
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'jobs', label: 'Select Job', icon: Briefcase },
      { key: 'cv', label: 'Submit CV', icon: FileText },
      { key: 'test', label: 'Take Test', icon: ClipboardCheck },
      { key: 'report', label: 'View Report', icon: BarChart3 },
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = 
              (step.key === 'jobs' && selectedJob) ||
              (step.key === 'cv' && cvData) ||
              (step.key === 'test' && testResults) ||
              (step.key === 'report' && testResults);
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-border mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'jobs':
        return <JobSelection onJobSelect={handleJobSelect} />;
      case 'cv':
        return (
          <CVCollection 
            selectedJob={selectedJob!} 
            onCVSubmit={handleCVSubmit}
            onBack={() => setCurrentStep('jobs')}
          />
        );
      case 'test':
        return (
          <ADOFTestDisplay 
            selectedJob={selectedJob!}
            cvData={cvData!}
            userId={user?.id || ''}
            onTestComplete={handleTestComplete}
            onBack={() => setCurrentStep('cv')}
          />
        );
      case 'report':
        return (
          <ADOFReports 
            selectedJob={selectedJob!}
            cvData={cvData!}
            testResults={testResults}
            onBackToJobs={handleBackToJobs}
          />
        );
      default:
        return <JobSelection onJobSelect={handleJobSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">EduPlatform - ADOF</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              ADOF Assessment Portal
            </h2>
            <p className="text-muted-foreground">
              Adult Development and Occupational Framework - Complete your job assessment
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Current Step Content */}
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
};