import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api, GenerateTestResponse } from '@/lib/api';
import { LogOut, User, BookOpen, FileText, Loader2, CheckCircle, TrendingUp, Users, Award, Clock } from 'lucide-react';
import { TestDisplay } from './TestDisplay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTest, setGeneratedTest] = useState<GenerateTestResponse | null>(null);

  const handleGenerateTest = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      // First generate the test
      console.log('Step 1: Generating test...');
      const testData = await api.generateTest(user.id);
      console.log('Generated test data:', testData);
      
      // Then try to get MCQs from database (this might be required for submit to work)
      console.log('Step 2: Getting MCQs from database...');
      try {
        const mcqsData = await api.getMcqs(user.id);
        console.log('MCQs data from database:', mcqsData);
        
        // Use MCQs data if it has questions, otherwise use generated test data
        if (mcqsData.questions && mcqsData.questions.length > 0) {
          console.log('Using MCQs from database');
          setGeneratedTest({
            ...testData,
            ...mcqsData,
            mcqs_id: mcqsData.mcqs_id || mcqsData.document_id || testData.mcqs_id
          });
        } else {
          console.log('Using generated test data');
          setGeneratedTest(testData);
        }
      } catch (mcqError) {
        console.warn('Could not get MCQs from database, using generated test:', mcqError);
        setGeneratedTest(testData);
      }
      
      toast({
        title: 'Test Generated Successfully!',
        description: 'Your personalized test is ready.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate test',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewTest = () => {
    setGeneratedTest(null);
  };

  // Mock data for charts
  const performanceData = [
    { name: 'Week 1', score: 75 },
    { name: 'Week 2', score: 82 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 88 },
  ];

  const skillsData = [
    { name: 'Communication', value: 85, color: 'hsl(var(--primary))' },
    { name: 'Technical Skills', value: 72, color: 'hsl(var(--secondary))' },
    { name: 'Problem Solving', value: 78, color: 'hsl(var(--accent))' },
    { name: 'Leadership', value: 65, color: 'hsl(var(--muted))' },
  ];

  const activityData = [
    { name: 'Mon', tests: 2 },
    { name: 'Tue', tests: 1 },
    { name: 'Wed', tests: 3 },
    { name: 'Thu', tests: 2 },
    { name: 'Fri', tests: 4 },
    { name: 'Sat', tests: 1 },
    { name: 'Sun', tests: 0 },
  ];

  if (generatedTest) {
    if (!user?.id) {
      console.error('User ID is missing:', user);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Error: User ID is missing. Please log in again.</p>
              <Button onClick={logout} className="mt-4">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <TestDisplay testData={generatedTest} onNewTest={handleNewTest} userId={user.id} />;
  }

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
              <h1 className="text-xl font-bold text-foreground">EduPlatform</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Hero Section with Test Generation */}
          <div className="text-center mb-16">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border border-primary/30 rounded-3xl p-12 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50"></div>
              <div className="relative">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-xl">
                    <FileText className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
                  Welcome back, {user?.name}!
                </h2>
                <h3 className="text-3xl font-bold text-foreground mb-6">
                  Generate Your Test
                </h3>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                  Ready to challenge yourself? Create a personalized assessment tailored to your role and expertise level. 
                  Our AI-powered system generates questions specifically designed for your learning journey.
                </p>
                
                <Button
                  onClick={handleGenerateTest}
                  disabled={isGenerating}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-12 py-8 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-4 h-7 w-7 animate-spin" />
                      Generating Your Test...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-4 h-7 w-7" />
                      Start Assessment
                    </>
                  )}
                </Button>
                
                {isGenerating && (
                  <div className="mt-8 p-6 bg-card/50 rounded-xl border border-border/50 max-w-md mx-auto">
                    <p className="text-base text-muted-foreground">
                      Creating your personalized assessment... This may take a few moments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tests Taken</CardTitle>
                  <Award className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">12</div>
                <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">82%</div>
                <p className="text-xs text-muted-foreground mt-1">+5% improvement</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Study Time</CardTitle>
                  <Clock className="w-5 h-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">24h</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rank</CardTitle>
                  <Users className="w-5 h-5 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">#15</div>
                <p className="text-xs text-muted-foreground mt-1">Top 20%</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Performance Chart */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Performance Trends</CardTitle>
                <CardDescription>Your test scores over the last 4 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Skills Breakdown */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Skills Breakdown</CardTitle>
                <CardDescription>Your proficiency across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {skillsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card className="bg-card/50 border-border/50 mb-12">
            <CardHeader>
              <CardTitle className="text-xl">Weekly Activity</CardTitle>
              <CardDescription>Number of tests taken each day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Bar dataKey="tests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};