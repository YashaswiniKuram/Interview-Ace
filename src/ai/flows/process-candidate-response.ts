'use server';

/**
 * @fileOverview A flow for processing candidate responses to interview questions.
 *
 * - processCandidateResponse - Processes the spoken answers to interview questions.
 * - ProcessCandidateResponseInput - The input type for the processCandidateResponse function.
 * - ProcessCandidateResponseOutput - The return type for the processCandidateResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessCandidateResponseInputSchema = z.object({
  question: z.string().describe('The interview question that was asked.'),
  responseAudioDataUri: z
    .string()
    .describe(
      'The candidate\'s spoken response to the question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  role: z.string().describe('The target role the candidate is interviewing for.'),
  company: z.string().describe('The company the candidate is interviewing with.'),
  resume: z.string().describe('The candidate\'s resume text.'),
});

export type ProcessCandidateResponseInput = z.infer<
  typeof ProcessCandidateResponseInputSchema
>;

const ProcessCandidateResponseOutputSchema = z.object({
  whatWentWell: z.string().describe('Positive feedback on the candidate\'s response. What they did well.'),
  areasForImprovement: z.string().describe('Constructive feedback on where the candidate can improve.'),
  technicalDepth: z.string().describe('Analysis of the technical knowledge and depth demonstrated in the answer.'),
  communicationSkills: z.string().describe('Feedback on the candidate\'s communication skills (clarity, structure, etc.).'),
});

export type ProcessCandidateResponseOutput = z.infer<
  typeof ProcessCandidateResponseOutputSchema
>;

export async function processCandidateResponse(
  input: ProcessCandidateResponseInput
): Promise<ProcessCandidateResponseOutput> {
  return processCandidateResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processCandidateResponsePrompt',
  input: {schema: ProcessCandidateResponseInputSchema},
  output: {schema: ProcessCandidateResponseOutputSchema},
  prompt: `You are an expert interview coach. Analyze the candidate's response to the interview question, taking into account the role, company, and resume.

  Interview Question: {{{question}}}
  Candidate Response: {{media url=responseAudioDataUri}}
  Target Role: {{{role}}}
  Company: {{{company}}}
  Resume: {{{resume}}}

  Provide a detailed analysis of the candidate's response. Break down your feedback into the following four categories:
  1.  **whatWentWell**: Identify the strengths of the answer. What did the candidate do effectively?
  2.  **areasForImprovement**: Pinpoint specific weaknesses or areas where the response could be stronger.
  3.  **technicalDepth**: Evaluate the depth of technical knowledge demonstrated. Was it sufficient for the role?
  4.  **communicationSkills**: Assess the clarity, structure, and confidence of the delivery.

  Be direct, concise, and provide actionable feedback in each category. Do not include filler content like "As an AI model...".
  `,
});

const processCandidateResponseFlow = ai.defineFlow(
  {
    name: 'processCandidateResponseFlow',
    inputSchema: ProcessCandidateResponseInputSchema,
    outputSchema: ProcessCandidateResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
