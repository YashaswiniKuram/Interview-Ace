'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Rocket } from 'lucide-react';

import type { GeneratePerformanceReportOutput } from '@/ai/flows/generate-performance-report';

type ReportScreenProps = {
  report: GeneratePerformanceReportOutput;
  onPracticeAgain: () => void;
};

export function ReportScreen({ report, onPracticeAgain }: ReportScreenProps) {
  const chartData = [
    { name: 'Confidence', score: report.confidence },
    { name: 'Correctness', score: report.correctness },
    { name: 'Depth', score: report.depthOfKnowledge },
    { name: 'Role Fit', score: report.roleFit },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-card border rounded-lg shadow-lg">
          <p className="font-bold">{`${label}`}</p>
          <p className="text-primary">{`Score: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-4xl animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">
          Your Performance Report
        </CardTitle>
        <CardDescription>
          Here's a breakdown of your interview performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="score" position="right" offset={10} className="fill-foreground font-semibold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{report.overallFeedback}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {report.areasForImprovement}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader className="flex-row items-center gap-4">
             <div className="p-3 bg-primary/20 rounded-full">
                <Rocket className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-headline text-primary">Final Words of Encouragement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground/80">
              {report.motivationalMessage}
            </p>
          </CardContent>
        </Card>
        <div className="text-center">
          <Button size="lg" onClick={onPracticeAgain}>
            Practice Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
