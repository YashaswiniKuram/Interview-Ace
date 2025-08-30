'use server';

/**
 * @fileOverview Generates a performance report based on the user's interview responses.
 *
 * - generatePerformanceReport - A function that generates the performance report.
 * - GeneratePerformanceReportInput - The input type for the generatePerformanceReport function.
 * - GeneratePerformanceReportOutput - The return type for the generatePerformanceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePerformanceReportInputSchema = z.object({
  role: z.string().describe('The target role for the interview.'),
  company: z.string().describe('The company the user applied to.'),
  resume: z.string().describe("The user's resume text content."),
  responses: z
    .array(z.string())
    .describe("An array of the user's responses to interview questions."),
  questions: z
    .array(z.string())
    .describe('An array of the interview questions asked.'),
});
export type GeneratePerformanceReportInput = z.infer<
  typeof GeneratePerformanceReportInputSchema
>;

const GeneratePerformanceReportOutputSchema = z.object({
  confidence: z.number().describe("A score indicating the user's confidence level."),
  correctness: z.number().describe("A score indicating the correctness of the user's answers."),
  depthOfKnowledge: z
    .number()
    .describe("A score indicating the depth of the user's knowledge."),
  roleFit: z.number().describe('A score indicating how well the user fits the role.'),
  areasForImprovement: z
    .string()
    .describe('A detailed, point-by-point summary of areas where the user can improve based on all their answers.'),
  overallFeedback: z.string().describe('Overall feedback on the interview performance.'),
  motivationalMessage: z.string().describe('A motivational and encouraging message for the candidate to build their confidence and help them feel ready to crack the job.'),
});
export type GeneratePerformanceReportOutput = z.infer<
  typeof GeneratePerformanceReportOutputSchema
>;

export async function generatePerformanceReport(
  input: GeneratePerformanceReportInput
): Promise<GeneratePerformanceReportOutput> {
  return generatePerformanceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePerformanceReportPrompt',
  input: {schema: GeneratePerformanceReportInputSchema},
  output: {schema: GeneratePerformanceReportOutputSchema},
  prompt: `You are an expert interview performance analyst and a motivational coach. You will generate a comprehensive performance report based on the user's responses to interview questions.

  Consider the following information:
  Role: {{{role}}}
  Company: {{{company}}}
  Resume: {{{resume}}}
  Questions: {{#each questions}}{{{this}}}\n{{/each}}
  Responses: {{#each responses}}{{{this}}}\n{{/each}}

  Your analysis must include the following:
  1.  **Scores (out of 100)** for: Confidence, Correctness, Depth of Knowledge, and Role Fit.
  2.  **Overall Feedback**: A summary of the candidate's performance.
  3.  **Areas for Improvement**: Provide a detailed, point-by-point list of actionable skills and areas the candidate should focus on. This should be a constructive guide for improvement based on all their answers.
  4.  **Motivational Message**: End with a powerful and encouraging message. Motivate the candidate, build their confidence, and make them feel that with a bit more practice, they can absolutely crack this job.
  `,
});

const generatePerformanceReportFlow = ai.defineFlow(
  {
    name: 'generatePerformanceReportFlow',
    inputSchema: GeneratePerformanceReportInputSchema,
    outputSchema: GeneratePerformanceReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
