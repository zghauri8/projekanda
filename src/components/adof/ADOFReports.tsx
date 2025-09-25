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
  Download,
  PlayCircle,
  BookOpen,
  Video,
  FileQuestion,
  ChevronDown
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

  const handleDownloadReport = async () => {
    try {
      // Dynamically import jsPDF and autoTable
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 62, 80);
      doc.text('Candidate Assessment Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 20, 20, { align: 'right' });
      
      // Add candidate info section
      doc.setFontSize(14);
      doc.setTextColor(40, 62, 80);
      doc.text('Candidate Information', 14, 40);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${cvData.name}`, 14, 50);
      doc.text(`Email: ${cvData.email}`, 14, 57);
      doc.text(`Phone: ${cvData.phone}`, 14, 64);
      
      // Add job info section
      doc.setFontSize(14);
      doc.setTextColor(40, 62, 80);
      doc.text('Job Details', 14, 84);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Position: ${selectedJob.title}`, 14, 94);
      doc.text(`Company: ${selectedJob.company}`, 14, 101);
      
      // Add skills match section
      doc.setFontSize(14);
      doc.setTextColor(40, 62, 80);
      doc.text('Skills Match', 14, 121);
      
      // Skills match percentage
      doc.setFontSize(11);
      doc.text(`Match: ${skillMatchPercentage}%`, 14, 131);
      
      // Add matched skills
      const matchedSkills = skillMatch.join(', ');
      const splitText = doc.splitTextToSize(`Matched Skills: ${matchedSkills}`, pageWidth - 30);
      doc.text(splitText, 14, 138);
      
      // Add test results
      doc.setFontSize(14);
      doc.setTextColor(40, 62, 80);
      doc.text('Assessment Results', 14, 160);
      
      doc.setFontSize(11);
      // Get the percentage from the test results (it's a number, not a score property)
      const percentage = testResults.percentage || 0;
      doc.text(`Score: ${percentage}%`, 14, 170);
      doc.text(`Recommendation: ${getRecommendation(percentage).text}`, 14, 177);
      
      // Add a simple table for test results
      const headers = ['Section', 'Score'];
      const analysis = testResults.analysis || {};
      const data = [
        ['Technical Knowledge', `${analysis['technical'] || 0}%`],
        ['Problem Solving', `${analysis['problem_solving'] || 0}%`],
        ['Communication', `${analysis['communication'] || 0}%`]
      ];
      
      autoTable(doc, {
        startY: 190,
        head: [headers],
        body: data,
        theme: 'grid',
        headStyles: {
          fillColor: [40, 62, 80],
          textColor: 255,
          fontStyle: 'bold'
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 10 }
      });
      
      // Save the PDF
      doc.save(`ADOF_Report_${cvData.name.replace(/\s+/g, '_')}_${selectedJob.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to JSON download if PDF generation fails
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
    }
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

      {/* Recommended Courses Section - Only show if score is below 60% */}
      {percentage < 60 && (
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <GraduationCap className="w-5 h-5" />
              <span>Recommended Courses</span>
            </CardTitle>
            <CardDescription>
              Based on your assessment, we recommend these courses to improve your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course 1: Communication Skills */}
              <CourseCard 
                title="Effective Communication Masterclass"
                description="Master the art of professional communication in the workplace."
                icon={PlayCircle}
                lectures={[
                  { 
                    id: 'comm-1',
                    title: 'Introduction to Communication', 
                    duration: '15 min', 
                    type: 'video',
                    content: 'This lecture covers the fundamentals of effective communication in professional settings. You\'ll learn about the communication process, common barriers, and strategies for clear and concise messaging.',
                    resources: [
                      { name: 'Communication Basics PDF', type: 'pdf', url: '/resources/communication-basics.pdf' },
                      { name: 'Communication Styles Quiz', type: 'link', url: '/quizzes/communication-styles' }
                    ]
                  },
                  { 
                    id: 'comm-2',
                    title: 'Active Listening Techniques', 
                    duration: '20 min', 
                    type: 'video',
                    content: 'Learn how to become a better listener with proven active listening techniques. This module includes exercises to improve your listening skills in both one-on-one and group settings.',
                    resources: [
                      { name: 'Active Listening Worksheet', type: 'pdf', url: '/resources/active-listening-worksheet.pdf' },
                      { name: 'Listening Skills Assessment', type: 'link', url: '/assessments/listening-skills' }
                    ]
                  },
                  { 
                    id: 'comm-3',
                    title: 'Non-Verbal Communication', 
                    duration: '18 min', 
                    type: 'video',
                    content: 'Discover the power of body language, facial expressions, and tone of voice in professional communication. Learn to read and use non-verbal cues effectively.',
                    resources: [
                      { name: 'Body Language Guide', type: 'pdf', url: '/resources/body-language-guide.pdf' },
                      { name: 'Non-Verbal Communication Quiz', type: 'link', url: '/quizzes/non-verbal' }
                    ]
                  },
                  { 
                    id: 'comm-4',
                    title: 'Written Communication Skills', 
                    duration: '25 min', 
                    type: 'video',
                    content: 'Master the art of professional writing. Learn how to craft clear, concise, and effective emails, reports, and other business documents.',
                    resources: [
                      { name: 'Business Writing Templates', type: 'doc', url: '/resources/business-writing-templates.docx' },
                      { name: 'Email Etiquette Guide', type: 'pdf', url: '/resources/email-etiquette.pdf' }
                    ]
                  },
                  { 
                    id: 'comm-5',
                    title: 'Quiz: Test Your Knowledge', 
                    duration: '10 min', 
                    type: 'quiz',
                    content: 'Test your understanding of the communication concepts covered in this course. This quiz will help reinforce your learning and identify areas for improvement.'
                  }
                ]}
                progress={0}
              />

              {/* Course 2: Technical Writing */}
              <CourseCard 
                title="Technical Writing for Professionals"
                description="Learn to create clear and effective technical documentation."
                icon={BookOpen}
                lectures={[
                  { 
                    id: 'tech-1',
                    title: 'Basics of Technical Writing', 
                    duration: '20 min', 
                    type: 'video',
                    content: 'Introduction to technical writing principles, including audience analysis, document design, and writing style guidelines for technical content.',
                    resources: [
                      { name: 'Technical Writing Style Guide', type: 'pdf', url: '/resources/tech-writing-style.pdf' },
                      { name: 'Technical Writing Templates', type: 'doc', url: '/resources/tech-templates.docx' }
                    ]
                  },
                  { 
                    id: 'tech-2',
                    title: 'Document Structure & Organization', 
                    duration: '22 min', 
                    type: 'video',
                    content: 'Learn how to effectively structure technical documents for clarity and usability. Covers information architecture, headings, and document flow.',
                    resources: [
                      { name: 'Document Structure Examples', type: 'pdf', url: '/resources/document-structure.pdf' },
                      { name: 'Information Architecture Guide', type: 'link', url: '/guides/info-architecture' }
                    ]
                  },
                  { 
                    id: 'tech-3',
                    title: 'Writing Clear Instructions', 
                    duration: '18 min', 
                    type: 'video',
                    content: 'Master the art of writing step-by-step instructions that are easy to follow and understand. Includes best practices for clarity and precision.',
                    resources: [
                      { name: 'Instruction Writing Template', type: 'doc', url: '/resources/instruction-template.docx' },
                      { name: 'Instruction Writing Checklist', type: 'pdf', url: '/resources/instruction-checklist.pdf' }
                    ]
                  },
                  { 
                    id: 'tech-4',
                    title: 'Technical Report Writing', 
                    duration: '25 min', 
                    type: 'video',
                    content: 'Learn how to write comprehensive technical reports that effectively communicate complex information to various stakeholders.',
                    resources: [
                      { name: 'Technical Report Template', type: 'doc', url: '/resources/report-template.docx' },
                      { name: 'Report Writing Guide', type: 'pdf', url: '/resources/report-guide.pdf' }
                    ]
                  },
                  { 
                    id: 'tech-5',
                    title: 'Assignment: Write a Technical Guide', 
                    duration: '30 min', 
                    type: 'assignment',
                    content: 'Apply what you\'ve learned by creating a technical guide on a topic of your choice. Your assignment will be reviewed by our instructors.',
                    resources: [
                      { name: 'Assignment Guidelines', type: 'pdf', url: '/resources/assignment-guidelines.pdf' },
                      { name: 'Submission Portal', type: 'link', url: '/assignments/submit' }
                    ]
                  }
                ]}
                progress={0}
              />

              {/* Course 3: Presentation Skills */}
              <CourseCard 
                title="Powerful Presentation Skills"
                description="Deliver engaging and effective presentations with confidence."
                icon={Video}
                lectures={[
                  { 
                    id: 'pres-1',
                    title: 'Structuring Your Presentation', 
                    duration: '18 min', 
                    type: 'video',
                    content: 'Learn how to structure your presentation for maximum impact. Covers the 10-20-30 rule, storytelling techniques, and creating a compelling narrative.',
                    resources: [
                      { name: 'Presentation Structure Template', type: 'ppt', url: '/resources/presentation-structure.pptx' },
                      { name: 'Storytelling Guide', type: 'pdf', url: '/resources/storytelling-guide.pdf' }
                    ]
                  },
                  { 
                    id: 'pres-2',
                    title: 'Engaging Your Audience', 
                    duration: '20 min', 
                    type: 'video',
                    content: 'Discover techniques to capture and maintain your audience\'s attention. Includes interactive elements, questions, and audience participation strategies.',
                    resources: [
                      { name: 'Audience Engagement Techniques', type: 'pdf', url: '/resources/engagement-techniques.pdf' },
                      { name: 'Interactive Presentation Ideas', type: 'link', url: '/resources/interactive-ideas' }
                    ]
                  },
                  { 
                    id: 'pres-3',
                    title: 'Using Visual Aids Effectively', 
                    duration: '15 min', 
                    type: 'video',
                    content: 'Learn how to create and use visual aids that enhance rather than distract from your presentation. Covers slide design, charts, and multimedia elements.',
                    resources: [
                      { name: 'Visual Design Principles', type: 'pdf', url: '/resources/visual-design.pdf' },
                      { name: 'Slide Design Templates', type: 'ppt', url: '/resources/slide-templates.pptx' }
                    ]
                  },
                  { 
                    id: 'pres-4',
                    title: 'Handling Q&A Sessions', 
                    duration: '15 min', 
                    type: 'video',
                    content: 'Master the art of handling questions with confidence. Learn techniques for difficult questions, managing time, and staying in control of the session.',
                    resources: [
                      { name: 'Q&A Preparation Worksheet', type: 'pdf', url: '/resources/qa-worksheet.pdf' },
                      { name: 'Difficult Questions Guide', type: 'link', url: '/resources/difficult-qa' }
                    ]
                  },
                  { 
                    id: 'pres-5',
                    title: 'Final Presentation Project', 
                    duration: '45 min', 
                    type: 'project',
                    content: 'Create and deliver a 5-minute presentation incorporating all the skills you\'ve learned. You\'ll receive personalized feedback from our instructors.',
                    resources: [
                      { name: 'Project Guidelines', type: 'pdf', url: '/resources/presentation-guidelines.pdf' },
                      { name: 'Presentation Rubric', type: 'pdf', url: '/resources/presentation-rubric.pdf' },
                      { name: 'Submission Portal', type: 'link', url: '/projects/submit' }
                    ]
                  }
                ]}
                progress={0}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Course Card Component
const CourseCard = ({ 
  title, 
  description, 
  icon: Icon, 
  lectures, 
  progress 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
  lectures: Array<{
    id: string;
    title: string; 
    duration: string; 
    type: 'video' | 'quiz' | 'assignment' | 'project';
    content?: string;
    resources?: Array<{name: string; type: 'pdf' | 'doc' | 'link'; url: string}>;
  }>;
  progress: number;
}) => {
  const [expandedLecture, setExpandedLecture] = React.useState<string | null>(null);
  const [isCourseStarted, setIsCourseStarted] = React.useState(false);
  const [currentLecture, setCurrentLecture] = React.useState(0);

  const getLectureIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4 text-primary mr-2" />;
      case 'quiz': return <FileQuestion className="w-4 h-4 text-yellow-500 mr-2" />;
      case 'assignment': return <FileText className="w-4 h-4 text-blue-500 mr-2" />;
      case 'project': return <Award className="w-4 h-4 text-purple-500 mr-2" />;
      default: return <PlayCircle className="w-4 h-4 text-primary mr-2" />;
    }
  };

  const toggleLecture = (lectureId: string) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  const startCourse = () => {
    setIsCourseStarted(true);
    setCurrentLecture(0);
  };

  const nextLecture = () => {
    if (currentLecture < lectures.length - 1) {
      setCurrentLecture(currentLecture + 1);
      setExpandedLecture(lectures[currentLecture + 1].id);
    }
  };

  const prevLecture = () => {
    if (currentLecture > 0) {
      setCurrentLecture(currentLecture - 1);
      setExpandedLecture(lectures[currentLecture - 1].id);
    }
  };

  const renderLectureContent = (lecture: typeof lectures[0]) => {
    if (!isCourseStarted) return null;
    
    return (
      <div className="mt-4 p-4 bg-muted/20 rounded-md">
        <h4 className="font-medium mb-2">{lecture.title}</h4>
        {lecture.content && (
          <div className="prose prose-sm max-w-none mb-4">
            {lecture.content}
          </div>
        )}
        
        {lecture.resources && lecture.resources.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">Resources:</h5>
            <div className="space-y-2">
              {lecture.resources.map((resource, idx) => (
                <a 
                  key={idx} 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {resource.name}
                </a>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-4 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevLecture}
            disabled={currentLecture === 0}
          >
            Previous
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={nextLecture}
            disabled={currentLecture === lectures.length - 1}
          >
            {currentLecture === lectures.length - 1 ? 'Complete Course' : 'Next'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 bg-muted/50">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{lectures.length} modules</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </div>
      
      <div className="p-4 border-t flex-1 flex flex-col">
        <h4 className="text-sm font-medium mb-3">Course Content</h4>
        <div className="space-y-2">
          {lectures.map((lecture, index) => (
            <div key={lecture.id} className="border rounded-md overflow-hidden">
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleLecture(lecture.id)}
              >
                <div className="flex items-center">
                  {getLectureIcon(lecture.type)}
                  <span className="text-sm">{lecture.title}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground mr-2">{lecture.duration}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    expandedLecture === lecture.id ? 'transform rotate-180' : ''
                  }`} />
                </div>
              </div>
              {expandedLecture === lecture.id && (
                <div className="p-3 border-t text-sm">
                  {lecture.content && (
                    <p className="text-muted-foreground mb-2 line-clamp-2">
                      {lecture.content.substring(0, 100)}...
                    </p>
                  )}
                  {lecture.resources && lecture.resources.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {lecture.resources.length} resources available
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isCourseStarted ? (
          <Button className="mt-4 w-full" size="sm" onClick={startCourse}>
            Start Course
          </Button>
        ) : (
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">Current Lesson: {lectures[currentLecture].title}</h5>
            {renderLectureContent(lectures[currentLecture])}
          </div>
        )}
      </div>
    </div>
  );
};