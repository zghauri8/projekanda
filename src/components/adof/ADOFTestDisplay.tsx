import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api, GenerateTestResponse, TestResult } from '@/lib/api';
import { ArrowLeft, CheckCircle, FileText, ChevronLeft, ChevronRight, Loader2, User, Briefcase, ClipboardCheck } from 'lucide-react';

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

interface ADOFTestDisplayProps {
  selectedJob: SelectedJob;
  cvData: CVData;
  userId: string;
  onTestComplete: (results: TestResult) => void;
  onBack: () => void;
}

export const ADOFTestDisplay: React.FC<ADOFTestDisplayProps> = ({ 
  selectedJob, 
  cvData, 
  userId, 
  onTestComplete, 
  onBack 
}) => {
  const { toast } = useToast();
  const [testData, setTestData] = useState<GenerateTestResponse | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateTest();
  }, [userId]);

  const generateTest = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to generate test.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingTest(true);
    try {
      const response = await api.generateTest(userId);
      setTestData(response);
      toast({
        title: 'Test Generated',
        description: 'Your personalized assessment is ready.',
      });
    } catch (error) {
      console.error('Error generating test:', error);
      toast({
        title: 'Test Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionScore: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionScore
    }));
  };

  const handleNext = () => {
    if (testData && currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testData) return;

    if (Object.keys(selectedAnswers).length !== testData.questions.length) {
      toast({
        title: 'Incomplete Test',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get document ID from test data
      const documentId = testData.mcqs_id || testData.document_id || testData.documentId || testData.id || testData._id || '';
      
      if (!documentId) {
        throw new Error('Test document ID is missing. Please generate a new test.');
      }

      // Convert answers to the required format
      const answersForAPI: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([questionIndex, score]) => {
        const questionNumber = parseInt(questionIndex) + 1;
        let responseText = '';
        switch (score) {
          case 1:
            responseText = 'Strongly Disagree';
            break;
          case 2:
            responseText = 'Disagree';
            break;
          case 3:
            responseText = 'Neutral';
            break;
          case 4:
            responseText = 'Agree';
            break;
          case 5:
            responseText = 'Strongly Agree';
            break;
          default:
            responseText = 'Neutral';
        }
        answersForAPI[questionNumber.toString()] = responseText;
      });

      const requestBody = {
        user_id: userId,
        mcq_id: documentId,
        answers: answersForAPI,
      };

      console.log('Submitting ADOF test answers:', requestBody);

      const submitResponse = await api.submitAnswers(requestBody);
      const resultResponse = await api.getResultById(submitResponse.data.result_id);
      
      toast({
        title: 'Assessment Completed!',
        description: `Your score: ${resultResponse.data.percentage}%`,
      });

      onTestComplete(resultResponse);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTest) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Generating Your Assessment</h3>
                <p className="text-muted-foreground">
                  Creating a personalized test based on the selected job position...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Test Generation Failed</h3>
                <p className="text-muted-foreground">
                  Unable to generate your assessment. Please try again.
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <Button onClick={generateTest}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Context */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Briefcase className="w-4 h-4" />
              <span>Position</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <h3 className="font-semibold">{selectedJob.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Context */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4" />
              <span>Candidate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <h3 className="font-semibold">{cvData.name}</h3>
              <p className="text-sm text-muted-foreground">{cvData.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5" />
            <span>ADOF Assessment Test</span>
          </CardTitle>
          <CardDescription>
            {testData.message || 'Complete this assessment to evaluate your fit for the selected position'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {testData.questions.length}</span>
            <span>Answered: {Object.keys(selectedAnswers).length}/{testData.questions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Loading State for Submission */}
      {isSubmitting && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Processing Your Assessment...
                </p>
                <p className="text-sm text-muted-foreground">
                  Analyzing your responses and generating results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      {!isSubmitting && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}: {testData.questions[currentQuestionIndex].question}
            </CardTitle>
            <CardDescription>
              Select the option that best describes your response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testData.questions[currentQuestionIndex].options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === option.score;
                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, option.score)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-card border-border hover:border-primary/50 text-foreground'
                    } cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {!isSubmitting && (
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-2">
            {testData.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-primary'
                    : selectedAnswers[index] !== undefined
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex < testData.questions.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Complete Assessment'}</span>
            </Button>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to CV Submission
        </Button>
      </div>
    </div>
  );
};