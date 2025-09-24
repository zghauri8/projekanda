import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestResult } from '@/lib/api';
import { Trophy, BarChart3, ArrowLeft, RotateCcw } from 'lucide-react';

interface TestResultsProps {
  result: TestResult;
  onNewTest: () => void;
  onBackToDashboard: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ 
  result, 
  onNewTest, 
  onBackToDashboard 
}) => {
  const { data } = result;
  const { percentage, total_score, max_score, analysis } = data;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={getScoreBadgeVariant(percentage)} className="text-sm">
                {percentage}% Score
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Test Results</h1>
            <p className="text-muted-foreground">Your assessment has been completed successfully</p>
          </div>

          {/* Score Overview */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Overall Score</CardTitle>
              <CardDescription>Your performance summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
                  {percentage}%
                </div>
                <p className="text-muted-foreground">
                  {total_score} out of {max_score} points
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{total_score}/{max_score}</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Section */}
          {Object.keys(analysis).length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Detailed Analysis</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of your strengths and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(analysis).map(([trait, level]) => (
                    <div key={trait} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{trait}</h3>
                        <p className="text-sm text-muted-foreground">Assessment category</p>
                      </div>
                      <Badge 
                        variant={level === 'Strength' ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        {level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onNewTest}
              size="lg"
              className="px-8 py-6 text-lg font-medium"
            >
              <RotateCcw className="mr-3 h-5 w-5" />
              Take Another Test
            </Button>
            
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-medium"
            >
              <ArrowLeft className="mr-3 h-5 w-5" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};