'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { startInterviewAction } from '@/app/dashboard/actions';
import { useToast } from '@/hooks/use-toast';
import type { GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { Loader2, Upload, FileText } from 'lucide-react';
import { useCallback, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const formSchema = z.object({
  role: z.string().min(2, 'Role must be at least 2 characters.'),
  company: z.string().min(2, 'Company must be at least 2 characters.'),
  resume: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Resume file is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      '.pdf and .docx files are accepted.'
    ),
});

type SetupFormProps = {
  onInterviewStart: (
    questions: GenerateInterviewQuestionsOutput,
    config: GenerateInterviewQuestionsInput
  ) => void;
};

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function SetupForm({ onInterviewStart }: SetupFormProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, onChange: (files: FileList | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onChange(files);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onChange: (files: FileList | null) => void) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onChange(files);
    }
  }, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      company: '',
      resume: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const resumeFile = values.resume[0];
    const resumeDataUri = await fileToDataUri(resumeFile);

    const submissionData = {
      role: values.role,
      company: values.company,
      resume: resumeDataUri,
    };

    const result = await startInterviewAction(submissionData);
    if (result.success && result.data) {
      onInterviewStart(result.data, submissionData);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error generating questions',
        description:
          result.error ||
          'There was a problem with the AI. Please try again.',
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-lg transition-all hover:shadow-xl">
      <CardHeader className="space-y-3">
        <CardTitle className="font-headline text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Prepare for your interview
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Fill in the details below to start your personalized practice session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-foreground/80">Target Role</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11 focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                        placeholder="e.g., Senior Software Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-medium text-foreground/80">Company</FormLabel>
                    <FormControl>
                      <Input 
                        className="h-11 focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                        placeholder="e.g., Google" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="resume"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">Your Resume</FormLabel>
                  <FormControl>
                    <div 
                      className={`mt-1.5 flex flex-col items-center justify-center px-6 pt-6 pb-7 border-2 border-dashed rounded-lg transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5 scale-[1.01] shadow-sm' : 'border-border hover:border-primary/50'} cursor-pointer group`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, (files) => {
                        if (files && files.length > 0) {
                          const fileList = new DataTransfer();
                          fileList.items.add(files[0]);
                          onChange(fileList.files);
                        }
                      })}
                      onClick={() => document.getElementById('resume-upload-input')?.click()}
                    >
                      <div className="space-y-3 text-center">
                        {fileName ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-10 w-10 text-primary" />
                            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {fileName}
                            </p>
                            <button
                              type="button"
                              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 hover:underline underline-offset-2 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFileName(null);
                                onChange(null);
                              }}
                            >
                              Change file
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors mb-2">
                              <Upload className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-primary transition-colors'}`} />
                            </div>
                            <div className="flex flex-col items-center text-sm">
                              <span className="font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                                Click to upload or drag and drop
                              </span>
                              <p className="text-xs text-muted-foreground/80 mt-1.5">
                                PDF or DOCX (max. 5MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        id="resume-upload-input"
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, (files) => {
                          if (files && files.length > 0) {
                            const fileList = new DataTransfer();
                            fileList.items.add(files[0]);
                            onChange(fileList.files);
                          }
                        })}
                        {...rest}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="h-11 px-8 text-base font-medium transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
