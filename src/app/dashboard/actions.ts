'use server';

import { z } from 'zod';
import {
  generateInterviewQuestions,
  GenerateInterviewQuestionsInput,
} from '@/ai/flows/generate-interview-questions';
import {
  processCandidateResponse,
  ProcessCandidateResponseInput,
} from '@/ai/flows/process-candidate-response';
import {
  adaptiveQuestioning,
  AdaptiveQuestioningInput,
} from '@/ai/flows/adaptive-questioning';
import {
  generatePerformanceReport,
  GeneratePerformanceReportInput,
  GeneratePerformanceReportOutput,
} from '@/ai/flows/generate-performance-report';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const startInterviewSchema = z.object({
  role: z.string(),
  company: z.string(),
  resume: z.string(),
});

export async function startInterviewAction(
  values: GenerateInterviewQuestionsInput
) {
  const validated = startInterviewSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }
  try {
    const questions = await generateInterviewQuestions(validated.data);
    return { success: true, data: questions };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate questions' };
  }
}

const processResponseSchema = z.object({
  question: z.string(),
  responseAudioDataUri: z.string(),
  role: z.string(),
  company: z.string(),
  resume: z.string(),
});

export async function processResponseAction(
  values: ProcessCandidateResponseInput
) {
  const validated = processResponseSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: 'Invalid input for response processing' };
  }

  try {
    const analysisResult = await processCandidateResponse(validated.data);

    // Don't ask for follow-up on every question to make it more natural
    const shouldAskForFollowUp = Math.random() > 0.4;
    let followUpResult: { askFollowUp: boolean; followUpQuestion?: string } = {
        askFollowUp: false
    };

    if (shouldAskForFollowUp) {
        // Combine the feedback into a single string for the adaptive questioning context.
        const combinedAnalysis = Object.values(analysisResult).join(' ');
        const adaptiveInput: AdaptiveQuestioningInput = {
            question: validated.data.question,
            answer: combinedAnalysis,
            role: validated.data.role,
            company: validated.data.company,
        };
        followUpResult = await adaptiveQuestioning(adaptiveInput);
    }
    
    return {
      success: true,
      data: {
        analysis: analysisResult,
        followUpQuestion: followUpResult.askFollowUp ? followUpResult.followUpQuestion : null,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to process response' };
  }
}

const getReportSchema = z.object({
    role: z.string(),
    company: z.string(),
    resume: z.string(),
    questions: z.array(z.string()),
    responses: z.array(z.string()),
    userId: z.string(),
});

type GetReportActionInput = GeneratePerformanceReportInput & { userId: string };

async function saveReportToFirestore(userId: string, reportData: GeneratePerformanceReportOutput, inputData: Omit<GetReportActionInput, 'resume' | 'questions' | 'responses' | 'userId'>) {
    try {
        await addDoc(collection(db, `users/${userId}/reports`), {
            ...inputData,
            ...reportData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving report to Firestore: ", error);
        // We don't want to block the user from seeing their report if saving fails
    }
}


export async function getReportAction(values: GetReportActionInput) {
    const validated = getReportSchema.safeParse(values);
    if (!validated.success) {
        return { success: false, error: 'Invalid input for report generation' };
    }

    try {
        const { userId, ...reportInput } = validated.data;
        const report = await generatePerformanceReport(reportInput);

        if (userId) {
            await saveReportToFirestore(userId, report, { role: values.role, company: values.company });
        }
        
        return { success: true, data: report };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to generate report' };
    }
}
