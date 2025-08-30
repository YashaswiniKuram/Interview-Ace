'use client';

import { useState } from 'react';
import type { GeneratePerformanceReportOutput } from '@/ai/flows/generate-performance-report';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { SetupForm } from '@/components/dashboard/setup-form';
import { InterviewScreen } from '@/components/dashboard/interview-screen';
import { ReportScreen } from '@/components/dashboard/report-screen';
import Header from '@/components/dashboard/header';
import { useAuth } from '@/auth/context';
import { useRouter } from 'next/navigation';

type AppState = 'setup' | 'interview' | 'report';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('setup');
  const [interviewData, setInterviewData] =
    useState<GenerateInterviewQuestionsOutput | null>(null);
  const [interviewConfig, setInterviewConfig] =
    useState<GenerateInterviewQuestionsInput | null>(null);
  const [reportData, setReportData] =
    useState<GeneratePerformanceReportOutput | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const handleStartInterview = (
    questions: GenerateInterviewQuestionsOutput,
    config: GenerateInterviewQuestionsInput
  ) => {
    setInterviewData(questions);
    setInterviewConfig(config);
    setAppState('interview');
  };

  const handleFinishInterview = (report: GeneratePerformanceReportOutput) => {
    setReportData(report);
    setAppState('report');
  };

  const handlePracticeAgain = () => {
    setInterviewData(null);
    setReportData(null);
    setInterviewConfig(null);
    setAppState('setup');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        {appState === 'setup' && (
          <SetupForm onInterviewStart={handleStartInterview} />
        )}
        {appState === 'interview' && interviewData && interviewConfig && user && (
          <InterviewScreen
            questions={interviewData.questions}
            interviewConfig={interviewConfig}
            onInterviewFinish={handleFinishInterview}
            userId={user.uid}
          />
        )}
        {appState === 'report' && reportData && (
          <ReportScreen
            report={reportData}
            onPracticeAgain={handlePracticeAgain}
          />
        )}
      </main>
    </div>
  );
}
