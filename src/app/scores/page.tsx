'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/dashboard/header';
import { useAuth } from '@/auth/context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';

type Report = {
  id: string;
  userId: string;
  role: string;
  company: string;
  confidence: number;
  correctness: number;
  depthOfKnowledge: number;
  roleFit: number;
  createdAt: Timestamp;
};

export default function ScoresPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchReports = async () => {
      if (user) {
        setIsLoadingReports(true);
        const reportsRef = collection(db, 'reports');
        const q = query(
          collection(db, `users/${user.uid}/reports`),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Report[];
        setReports(fetchedReports);
        setIsLoadingReports(false);
      }
    };
    fetchReports();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-8">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Interview History
            </CardTitle>
            <CardDescription>
              Review your past interview performances and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">Loading your interview history...</p>
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Interview Data Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  You haven&apos;t completed any interviews yet. Start practicing to see your performance metrics here.
                </p>
                <Button 
                  className="mt-6" 
                  onClick={() => router.push('/dashboard')}
                >
                  Start Practicing
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead className="text-center">Correctness</TableHead>
                    <TableHead className="text-center">Depth</TableHead>
                    <TableHead className="text-center">Role Fit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(report.createdAt.toDate(), 'PPP')}
                      </TableCell>
                      <TableCell>{report.role}</TableCell>
                      <TableCell>{report.company}</TableCell>
                      <TableCell className="text-center">
                        {report.confidence}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.correctness}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.depthOfKnowledge}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.roleFit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
