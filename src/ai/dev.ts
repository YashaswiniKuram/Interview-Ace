import { config } from 'dotenv';
config();

import '@/ai/flows/process-candidate-response.ts';
import '@/ai/flows/generate-performance-report.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/adaptive-questioning.ts';