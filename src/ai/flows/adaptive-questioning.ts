'use server';

/**
 * @fileOverview Implements adaptive questioning during an interview.
 *
 * The flow determines whether to ask a follow-up question based on the user's
 * previous answer, making the interview more realistic and challenging.
 *
 * - `adaptiveQuestioning` - The main function to initiate adaptive questioning.
 * - `AdaptiveQuestioningInput` - The input type for the adaptiveQuestioning function.
 * - `AdaptiveQuestioningOutput` - The output type for the adaptiveQuestioning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveQuestioningInputSchema = z.object({
  question: z.string().describe('The current interview question.'),
  answer: z.string().describe('The user\u0027s answer to the question.'),
  role: z.string().describe('The target role for the interview.'),
  company: z.string().describe('The company the user is interviewing for.'),
});
export type AdaptiveQuestioningInput = z.infer<typeof AdaptiveQuestioningInputSchema>;

const AdaptiveQuestioningOutputSchema = z.object({
  askFollowUp: z.boolean().describe('Whether to ask a follow-up question.'),
  followUpQuestion: z.string().optional().describe('The follow-up question to ask, if any. It must start with "Follow-up: ".'),
});
export type AdaptiveQuestioningOutput = z.infer<typeof AdaptiveQuestioningOutputSchema>;

export async function adaptiveQuestioning(input: AdaptiveQuestioningInput): Promise<AdaptiveQuestioningOutput> {
  return adaptiveQuestioningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveQuestioningPrompt',
  input: {schema: AdaptiveQuestioningInputSchema},
  output: {schema: AdaptiveQuestioningOutputSchema},
  prompt: `You are an AI interview assistant helping to conduct practice interviews.

  Based on the user's answer to the current question, determine whether a follow-up question is needed to explore the topic in more depth.
  Consider the role and company when deciding if a follow-up is appropriate.

  If you generate a follow-up question, it must start with "Follow-up: ".

  Current Question: {{{question}}}
  User's Answer: {{{answer}}}
  Target Role: {{{role}}}
  Company: {{{company}}}

  Determine whether to ask a follow-up question, and if so, generate the follow-up question.
`,
});

const adaptiveQuestioningFlow = ai.defineFlow(
  {
    name: 'adaptiveQuestioningFlow',
    inputSchema: AdaptiveQuestioningInputSchema,
    outputSchema: AdaptiveQuestioningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
