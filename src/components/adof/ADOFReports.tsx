import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestResult } from '@/lib/api';
import { 
  Trophy, 
  BarChart3, 
  ArrowLeft, 
  RotateCcw, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  GraduationCap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  FileText,
  Download
} from 'lucide-react';

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

interface ADOFReportsProps {
  selectedJob: SelectedJob;
  cvData: CVData;
  testResults: TestResult;
  onBackToJobs: () => void;
}

export const ADOFReports: React.FC<ADOFReportsProps> = ({ 
  selectedJob, 
  cvData, 
  testResults, 
  onBackToJobs 
}) => {
  const { data } = testResults;
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

  const getRecommendation = (percentage: number) => {
    if (percentage >= 80) {
      return {
        status: 'Highly Recommended',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Excellent fit for this position with strong alignment across key competencies.'
      };
    } else if (percentage >= 60) {
      return {
        status: 'Recommended with Development',
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        description: 'Good potential with some areas for development and training.'
      };
    } else {
      return {
        status: 'Not Recommended',
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Significant gaps identified that may require extensive development.'
      };
    }
  };

  const recommendation = getRecommendation(percentage);
  const RecommendationIcon = recommendation.icon;

  // Calculate skill match
  const skillMatch = cvData.skills.filter(skill => 
    selectedJob.skills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  const skillMatchPercentage = selectedJob.skills.length > 0 
    ? Math.round((skillMatch.length / selectedJob.skills.length) * 100)
    : 0;

  const handleDownloadReport = () => {
    // In a real application, this would generate and download a PDF report
    const reportData = {
      candidate: cvData,
      job: selectedJob,
      testResults: testResults,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ADOF_Report_${cvData.name.replace(/\s+/g, '_')}_${selectedJob.title.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Trophy className="w-6 h-6" />
            <span>ADOF Assessment Report</span>
          </CardTitle>
          <CardDescription className="text-base">
            Comprehensive evaluation results for job fit assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Candidate Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{cvData.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{cvData.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{cvData.phone}</span>
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Position Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{selectedJob.title}</div>
                <div className="text-muted-foreground">{selectedJob.company}</div>
                <div className="text-xs text-muted-foreground">
                  Assessment Date: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className={`${recommendation.bgColor} ${recommendation.borderColor} border-2`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <RecommendationIcon className={`w-6 h-6 ${recommendation.color}`} />
            <span>Overall Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(percentage)} mb-2`}>
              {percentage}%
            </div>
            <Badge variant={getScoreBadgeVariant(percentage)} className="text-lg px-4 py-2 mb-2">
              {recommendation.status}
            </Badge>
            <p className="text-muted-foreground max-w-md mx-auto">
              {recommendation.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Assessment Score</span>
              <span>{total_score}/{max_score} points</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Analysis */}
        {Object.keys(analysis).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Competency Analysis</span>
              </CardTitle>
              <CardDescription>
                Assessment of key traits and competencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analysis).map(([trait, level]) => (
                  <div key={trait} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">{trait}</h4>
                        <p className="text-xs text-muted-foreground">Behavioral trait</p>
                      </div>
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

        {/* Skills Match Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Skills Match Analysis</span>
            </CardTitle>
            <CardDescription>
              Alignment between candidate skills and job requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {skillMatchPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">
                Skills alignment with job requirements
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Matching Skills</span>
                <span>{skillMatch.length}/{selectedJob.skills.length}</span>
              </div>
              <Progress value={skillMatchPercentage} className="h-2" />
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-green-600 mb-2">Matching Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {skillMatch.length > 0 ? skillMatch.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {skill}
                    </Badge>
                  )) : (
                    <span className="text-xs text-muted-foreground">No direct matches found</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Additional Candidate Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {cvData.skills.filter(skill => !skillMatch.includes(skill)).slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {cvData.skills.filter(skill => !skillMatch.includes(skill)).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{cvData.skills.filter(skill => !skillMatch.includes(skill)).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Candidate Profile Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Experience</h4>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {cvData.experience}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Education</h4>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {cvData.education}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Skills Portfolio</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant={skillMatch.includes(skill) ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {skill}
                  {skillMatch.includes(skill) && <CheckCircle className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownloadReport}
          size="lg"
          variant="outline"
          className="px-8 py-6 text-lg font-medium"
        >
          <Download className="mr-3 h-5 w-5" />
          Download Report
        </Button>
        
        <Button
          onClick={onBackToJobs}
          size="lg"
          className="px-8 py-6 text-lg font-medium"
        >
          <RotateCcw className="mr-3 h-5 w-5" />
          New Assessment
        </Button>
      </div>
    </div>
  );
};