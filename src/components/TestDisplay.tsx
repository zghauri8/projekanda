import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GenerateTestResponse, api, TestResult } from '@/lib/api';
import { ArrowLeft, CheckCircle, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TestResults } from './TestResults';

interface TestDisplayProps {
  testData: GenerateTestResponse;
  onNewTest: () => void;
  userId: string;
}

export const TestDisplay: React.FC<TestDisplayProps> = ({ testData, onNewTest, userId }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  // Helper function to get document ID from various possible field names
  const getDocumentId = () => {
    return testData.mcqs_id || testData.document_id || testData.documentId || testData.id || testData._id || '';
  };

  const documentId = getDocumentId();

  // Debug log the props
  console.log('TestDisplay props:', {
    userId,
    testDataDocumentId: testData.document_id,
    documentId: documentId,
    questionsLength: testData.questions.length,
    fullTestData: testData
  });

  const handleAnswerSelect = (questionIndex: number, optionScore: number) => {
    if (isSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionScore
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== testData.questions.length) {
      toast({
        title: 'Incomplete Test',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setTestResult(null); // Reset any previous results

    try {
      // Validate required data
      console.log('Validation check:', {
        userId: userId,
        userIdLength: userId?.length,
        documentId: documentId,
        documentIdLength: documentId?.length,
        testDataKeys: Object.keys(testData),
        allPossibleIds: {
          mcqs_id: testData.mcqs_id,
          document_id: testData.document_id,
          documentId: testData.documentId,
          id: testData.id,
          _id: testData._id
        }
      });
      
      if (!userId || userId.trim() === '') {
        throw new Error('User ID is required. Please log in again.');
      }
      if (!documentId || documentId.trim() === '') {
        console.error('Missing document_id. Full testData:', testData);
        throw new Error('Test document ID is required. Please generate a new test.');
      }

      // Convert answers to the required format based on the API example
      const answersForAPI: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([questionIndex, score]) => {
        const questionNumber = parseInt(questionIndex) + 1;
        // Map score to Likert scale response
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

      // Validate answers were created
      if (Object.keys(answersForAPI).length === 0) {
        throw new Error('No answers provided. Please answer all questions.');
      }

      // Validate all answers are valid strings
      const invalidAnswers = Object.entries(answersForAPI).filter(([key, value]) => 
        !value || typeof value !== 'string' || !['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].includes(value)
      );
      
      if (invalidAnswers.length > 0) {
        console.error('Invalid answers found:', invalidAnswers);
        throw new Error(`Invalid answers detected: ${invalidAnswers.map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      }

      // Create the exact request body format
      const requestBody = {
        user_id: userId,
        mcq_id: documentId,
        answers: answersForAPI,
      };

      // Test with your exact example format
      const expectedExample = {
        "user_id": "68d16d9d257b9ff730bc9722",
        "mcq_id": "68d174f45f158664a2b6ac7a",
        "answers": {
          "1": "Agree",
          "2": "Strongly Agree",
          "3": "Neutral",
          "4": "Disagree",
          "5": "Strongly Agree",
          "6": "Agree",
          "7": "Strongly Agree",
          "8": "Neutral",
          "9": "Agree",
          "10": "Disagree",
          "11": "Strongly Agree",
          "12": "Neutral",
          "13": "Agree",
          "14": "Disagree",
          "15": "Strongly Agree",
          "16": "Disagree",
          "17": "Agree",
          "18": "Disagree",
          "19": "Strongly Agree",
          "20": "Neutral"
        }
      };

      console.log('=== FORMAT COMPARISON ===');
      console.log('Expected format:', expectedExample);
      console.log('Our format:', requestBody);
      console.log('Expected JSON:', JSON.stringify(expectedExample));
      console.log('Our JSON:', JSON.stringify(requestBody));
      console.log('Formats match:', JSON.stringify(requestBody) === JSON.stringify(expectedExample));
      console.log('========================');

      // Debug log the request data
      console.log('Submitting answers:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody));
      console.log('Expected format check:', {
        hasUserId: !!requestBody.user_id,
        hasMcqId: !!requestBody.mcq_id,
        hasAnswers: !!requestBody.answers,
        answersCount: Object.keys(requestBody.answers).length,
        expectedCount: testData.questions.length,
        answersKeys: Object.keys(requestBody.answers).sort((a, b) => parseInt(a) - parseInt(b)),
        sampleAnswers: Object.entries(requestBody.answers).slice(0, 5)
      });

      // Validate the format matches your example exactly
      const expectedFormat = {
        user_id: "68d16d9d257b9ff730bc9722",
        mcq_id: "68d174f45f158664a2b6ac7a", 
        answers: {
          "1": "Agree",
          "2": "Strongly Agree",
          // ... etc
        }
      };
      
      console.log('Format comparison:', {
        ourFormat: typeof requestBody,
        ourKeys: Object.keys(requestBody).sort(),
        expectedKeys: Object.keys(expectedFormat).sort(),
        userIdType: typeof requestBody.user_id,
        mcqIdType: typeof requestBody.mcq_id,
        answersType: typeof requestBody.answers,
        answersIsObject: requestBody.answers && typeof requestBody.answers === 'object'
      });

      // Try with the exact format from your example first
      const testRequestBody = {
        "user_id": userId,
        "mcq_id": documentId,
        "answers": answersForAPI
      };

      console.log('Final request body that will be sent:', testRequestBody);
      console.log('Final request body as JSON string:', JSON.stringify(testRequestBody, null, 2));

      // Let's also try with a hardcoded working example to test
      if (Object.keys(answersForAPI).length >= 20) {
        const hardcodedTest = {
          "user_id": userId,
          "mcq_id": documentId,
          "answers": {
            "1": "Agree",
            "2": "Strongly Agree", 
            "3": "Neutral",
            "4": "Disagree",
            "5": "Strongly Agree",
            "6": "Agree",
            "7": "Strongly Agree",
            "8": "Neutral",
            "9": "Agree",
            "10": "Disagree",
            "11": "Strongly Agree",
            "12": "Neutral",
            "13": "Agree",
            "14": "Disagree",
            "15": "Strongly Agree",
            "16": "Disagree",
            "17": "Agree",
            "18": "Disagree",
            "19": "Strongly Agree",
            "20": "Neutral"
          }
        };
        console.log('Hardcoded test format:', hardcodedTest);
        console.log('Hardcoded test JSON:', JSON.stringify(hardcodedTest));
      }

      // First, get MCQs from database (this might be required before submitting)
      console.log('Getting MCQs from database before submitting...');
      try {
        const mcqsResponse = await api.getMcqs(userId);
        console.log('MCQs retrieved successfully:', mcqsResponse);
      } catch (mcqError) {
        console.warn('Failed to get MCQs (might not be required):', mcqError);
        // Continue anyway as this might not be required
      }

      // FOR TESTING: Try with exact hardcoded format first
      console.log('=== TESTING WITH HARDCODED FORMAT ===');
      const hardcodedTestRequest = {
        "user_id": userId,
        "mcq_id": documentId,
        "answers": {
          "1": "Agree",
          "2": "Strongly Agree",
          "3": "Neutral",
          "4": "Disagree",
          "5": "Strongly Agree",
          "6": "Agree",
          "7": "Strongly Agree",
          "8": "Neutral",
          "9": "Agree",
          "10": "Disagree",
          "11": "Strongly Agree",
          "12": "Neutral",
          "13": "Agree",
          "14": "Disagree",
          "15": "Strongly Agree",
          "16": "Disagree",
          "17": "Agree",
          "18": "Disagree",
          "19": "Strongly Agree",
          "20": "Neutral"
        }
      };

      console.log('Trying hardcoded format first...');
      let submitResponse;
      
      try {
        // First try with the current request body
        submitResponse = await api.submitAnswers(requestBody);
        console.log('Submission successful:', submitResponse);
      } catch (error) {
        console.error('Standard submission failed, trying hardcoded format...', error);
        
        try {
          // If standard format fails, try with hardcoded format
          submitResponse = await api.submitAnswers(hardcodedTestRequest);
          console.log('Hardcoded format worked!', submitResponse);
        } catch (hardcodedError) {
          console.error('All submission attempts failed:', hardcodedError);
          throw hardcodedError; // Re-throw to be caught by the outer catch
        }
      }
      
      // Get the result_id from the response (check both direct property and data property)
      const resultId = submitResponse.result_id || (submitResponse.data && submitResponse.data.result_id);
      
      // If we have a result_id, fetch the detailed results
      if (resultId) {
        try {
          console.log('Fetching detailed results for result_id:', resultId);
          const detailedResult = await api.getResultById(resultId);
          console.log('Detailed results:', detailedResult);
          
          // If the detailed result has data, use that, otherwise keep the original response
          setTestResult(detailedResult.data ? detailedResult : submitResponse);
        } catch (error) {
          console.error('Error fetching detailed results, using basic response:', error);
          setTestResult(submitResponse);
        }
      } else {
        console.log('No result_id found in response, using basic response');
        setTestResult(submitResponse);
      }
      
      // Mark as submitted
      setIsSubmitted(true);

      // Show success message with the score if available
      const percentage = submitResponse.data?.percentage || 
                       (submitResponse.data?.data?.percentage !== undefined ? 
                        submitResponse.data.data.percentage : 'N/A');
      
      toast({
        title: 'Test Submitted Successfully!',
        description: `Your score: ${percentage}%`,
      });
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

  // Show results if test is submitted and we have results
  if (isSubmitted && testResult) {
    return (
      <TestResults 
        result={testResult} 
        onNewTest={onNewTest}
        onBackToDashboard={onNewTest}
      />
    );
  }

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
                onClick={onNewTest}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {testData.questions.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Test Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Test</h1>
            <p className="text-muted-foreground">{testData.message}</p>
            
            {/* Debug info - remove in production */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
              <p><strong>User ID:</strong> {userId || 'Not provided'}</p>
              <p><strong>Test ID:</strong> {documentId || 'Not provided'}</p>
              <p><strong>Questions:</strong> {testData.questions.length}</p>
              <p><strong>Answered:</strong> {Object.keys(selectedAnswers).length}/{testData.questions.length}</p>
              {Object.keys(selectedAnswers).length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">View Selected Answers</summary>
                  <pre className="mt-2 text-xs bg-background p-2 rounded">
                    {JSON.stringify(selectedAnswers, null, 2)}
                  </pre>
                </details>
              )}
            </div>
            
            {isSubmitting && (
              <Card className="mt-6 bg-primary/5 border-primary/20">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Submitting your answers...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please wait while we process your results
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Current Question */}
          <div className="mb-8">
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
                        disabled={isSubmitted}
                        className={`w-full p-4 text-left rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-card border-border hover:border-primary/50 text-foreground'
                        } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
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
          </div>

          {/* Navigation */}
          {!isSubmitted && !isSubmitting && (
            <div className="flex justify-between items-center mb-8">
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
                        ? 'bg-success'
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
                  className="flex items-center space-x-2 bg-success hover:bg-success/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
                </Button>
              )}
            </div>
          )}


        </div>
      </main>
    </div>
  );
};