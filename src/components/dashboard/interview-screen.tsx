'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioRecorder, AudioRecorderHandle } from '@/components/dashboard/audio-recorder';
import {
  processResponseAction,
  getReportAction,
} from '@/app/dashboard/actions';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import type { GeneratePerformanceReportOutput } from '@/ai/flows/generate-performance-report';
import type { ProcessCandidateResponseOutput } from '@/ai/flows/process-candidate-response';
import { Loader2, ArrowRight, ThumbsUp, Pencil, BrainCircuit, MessageSquare } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type InterviewScreenProps = {
  questions: string[];
  interviewConfig: GenerateInterviewQuestionsInput;
  onInterviewFinish: (report: GeneratePerformanceReportOutput) => void;
  userId: string;
};

type InterviewHistory = {
  question: string;
  response: string; // The text analysis, not the audio
};

const MAX_QUESTIONS = 8;

export function InterviewScreen({
  questions,
  interviewConfig,
  onInterviewFinish,
  userId
}: InterviewScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionQueue, setQuestionQueue] = useState<string[]>(questions);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<ProcessCandidateResponseOutput | null>(null);
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const audioRecorderRef = useRef<AudioRecorderHandle>(null);


  const currentQuestion = questionQueue[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questionQueue.length - 1;

  useEffect(() => {
    // Reset timer when question changes
    audioRecorderRef.current?.reset();
  }, [currentQuestionIndex]);


  const handleNext = async () => {
    setFeedback(null);
    if (isLastQuestion) {
      setIsFinishing(true);
      const report = await getReportAction({
        ...interviewConfig,
        userId: userId,
        questions: history.map(h => h.question),
        responses: history.map(h => h.response),
      });

      if (report.success && report.data) {
        onInterviewFinish(report.data);
      } else {
        // Handle error
        console.error('Failed to generate report');
        setIsFinishing(false);
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleAudioSubmit = async (audioDataUri: string) => {
    setIsProcessing(true);
    setFeedback(null);

    const result = await processResponseAction({
      ...interviewConfig,
      question: currentQuestion,
      responseAudioDataUri: audioDataUri,
    });

    if (result.success && result.data) {
      setFeedback(result.data.analysis);
      const combinedResponse = Object.values(result.data.analysis).join(' ');
      setHistory((prev) => [
        ...prev,
        { question: currentQuestion, response: combinedResponse },
      ]);
      if (result.data.followUpQuestion && questionQueue.length < MAX_QUESTIONS) {
        const followUp = result.data.followUpQuestion.trim();
        if (followUp) {  // Ensure it's not an empty string
          setQuestionQueue((prev) => [
            ...prev.slice(0, currentQuestionIndex + 1),
            followUp,
            ...prev.slice(currentQuestionIndex + 1),
          ]);
        }
      }
    } else {
      // Handle error
      console.error('Sorry, there was an error processing your response.');
    }
    setIsProcessing(false);
  };
  
  const progressValue = (currentQuestionIndex / questionQueue.length) * 100;

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Progress value={progressValue} className="w-full" />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Question {currentQuestionIndex + 1} of {questionQueue.length}
          </CardTitle>
          <CardDescription className="text-lg pt-2 text-foreground">
            {currentQuestion}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioRecorder
            ref={audioRecorderRef}
            onRecordingComplete={handleAudioSubmit}
            isProcessing={isProcessing}
            disabled={!!feedback}
          />
        </CardContent>
        <CardFooter>
          {feedback && !isProcessing && (
            <Button onClick={handleNext} disabled={isFinishing}>
              {isFinishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : isLastQuestion ? (
                'Finish & Get Report'
              ) : (
                <>
                  Next Question <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      {isProcessing && (
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing your response...
        </div>
      )}
      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500/50 text-green-700 dark:border-green-500/60 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
                <ThumbsUp className="h-4 w-4" />
                <AlertTitle className="font-bold text-green-800 dark:text-green-300">What Went Well</AlertTitle>
                <AlertDescription>{feedback.whatWentWell}</AlertDescription>
            </Alert>
            <Alert variant="destructive">
                <Pencil className="h-4 w-4" />
                <AlertTitle className="font-bold">Areas for Improvement</AlertTitle>
                <AlertDescription>{feedback.areasForImprovement}</AlertDescription>
            </Alert>
             <Alert className="border-blue-500/50 text-blue-700 dark:border-blue-500/60 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400">
                <BrainCircuit className="h-4 w-4" />
                <AlertTitle className="font-bold text-blue-800 dark:text-blue-300">Technical Depth</AlertTitle>
                <AlertDescription>{feedback.technicalDepth}</AlertDescription>
            </Alert>
            <Alert className="border-purple-500/50 text-purple-700 dark:border-purple-500/60 dark:text-purple-400 [&>svg]:text-purple-600 dark:[&>svg]:text-purple-400">
                <MessageSquare className="h-4 w-4" />
                <AlertTitle className="font-bold text-purple-800 dark:text-purple-300">Communication Skills</AlertTitle>
                <AlertDescription>{feedback.communicationSkills}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
