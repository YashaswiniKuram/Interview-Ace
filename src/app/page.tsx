'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { login, signup, handleOAuthUser } from '@/auth/actions';
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, type User, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';


const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
)

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M15.5 9.5a5.5 5.5 0 0 0-7 7"/><path d="M15.5 9.5a5.5 5.5 0 0 0-7 7"/><path d="M12 12.5v-3h3.5"/><path d="M12 12.5v-3h3.5"/></svg>
)


export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | 'google' | 'github'>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await login(formData);
    if (result.success) {
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await signup(formData);
    if (result.success) {
      router.push('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: result.error,
      });
    }
    setLoading(false);
  };

  const handleOAuthSignIn = async (providerName: 'google' | 'github') => {
    if (oauthLoading) return; // Prevent multiple clicks
    
    setOauthLoading(providerName);
    const provider = providerName === 'google' 
      ? new GoogleAuthProvider() 
      : new GithubAuthProvider();
      
    try {
      // Set persistence before signing in
      await auth.setPersistence(browserLocalPersistence);
      
      // Sign in with popup
      const result = await signInWithPopup(auth, provider);
      
      // The auth state change will be handled by the AuthProvider
      // So we don't need to manually handle the user here
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('OAuth Error:', error);
      
      // Check for specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to show error
        return;
      }
      
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'Failed to authenticate. Please try again.',
      });
    } finally {
      setOauthLoading(null);
    }
  };


  const oAuthButtons = (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
            Or continue with
            </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => handleOAuthSignIn('google')} disabled={!!oauthLoading}>
            {oauthLoading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Google
        </Button>
        <Button variant="outline" onClick={() => handleOAuthSignIn('github')} disabled={!!oauthLoading}>
            {oauthLoading === 'github' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitHubIcon className="mr-2 h-4 w-4" />}
            GitHub
        </Button>
      </div>
    </div>
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="flex items-center gap-2 mb-8">
        <Bot size={48} className="text-primary" />
        <h1 className="text-4xl font-headline font-bold text-primary">
          Interview Ace
        </h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8 max-w-lg text-center">
        Your personal AI-powered interview coach. Practice, get feedback, and
        land your dream job.
      </p>

      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="font-headline">Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                 <CardFooter className="flex-col gap-4 p-0">
                    <Button type="submit" className="w-full" disabled={loading || !!oauthLoading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                    {oAuthButtons}
                </CardFooter>
              </CardContent>
             
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <form onSubmit={handleSignup}>
              <CardHeader>
                <CardTitle className="font-headline">Sign Up</CardTitle>
                <CardDescription>
                  Create an account to start your interview practice.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-signup">Name</Label>
                  <Input
                    id="name-signup"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <CardFooter className="flex-col gap-4 p-0">
                    <Button type="submit" className="w-full" disabled={loading || !!oauthLoading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                    </Button>
                    {oAuthButtons}
                </CardFooter>
              </CardContent>
              
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
