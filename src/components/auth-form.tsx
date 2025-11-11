
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, UserCheck, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from './ui/separator';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.022,44,30.032,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { signInWithGoogle, signInAsAdmin, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
        await signInWithGoogle();
        // The useEffect in the login page will handle redirection
    } catch (error: any) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = "Sign-in was cancelled. Please try again.";
        } else if (error.message.includes("Access Denied")) {
            errorMessage = error.message;
        }
        
        toast({
            title: "Google Sign-In Failed",
            description: errorMessage,
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      await signInAsAdmin(values.email, values.password);
      // The useEffect will handle redirection after state update
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
       if (error.code) {
          switch (error.code) {
              case 'auth/invalid-credential':
              case 'auth/wrong-password':
              case 'auth/user-not-found':
                  errorMessage = 'Invalid email or password. Please try again.';
                  break;
              case 'auth/too-many-requests':
                  errorMessage = 'Access temporarily disabled due to too many failed login attempts.';
                  break;
              default:
                  errorMessage = 'Authentication failed. Please try again later.';
          }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive"
      });
      form.setError("password", { type: "manual", message: "" });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const isLoading = isSubmitting || authLoading;

  return (
    <Card className={cn("w-full max-w-sm glass-card transition-all duration-300 ease-in-out")}>
        <CardHeader className="text-center">
            <div className="mx-auto mb-6 flex h-[100px] w-[180px] items-center justify-center p-4">
                <Image 
                    src="/my_logo.png" 
                    alt="Logo" 
                    width={180} 
                    height={45} 
                    priority 
                    className="object-contain drop-shadow-sm"
                />
            </div>
            <CardTitle>Welcome to GeminiEstimate</CardTitle>
            <CardDescription>
                Sign in with your Google account to access your dashboard.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : <GoogleIcon />}
                    <span className="ml-2">Sign in with Google</span>
                </Button>
            </div>
            
            {!showAdminLogin && (
                <div className="text-center">
                    <Button variant="link" className="text-xs text-muted-foreground" onClick={() => setShowAdminLogin(true)}>
                        <ShieldQuestion className="mr-2 h-4 w-4" />
                        Are you an administrator?
                    </Button>
                </div>
            )}
            
            {showAdminLogin && (
                <>
                    <div className="flex items-center space-x-2">
                        <Separator className="flex-1"/>
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1"/>
                    </div>

                    <div>
                        <CardDescription className="text-center mb-4">
                            Sign in with your administrator account.
                        </CardDescription>
                        <Form {...form}>
                            <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Email</FormLabel>
                                        <FormControl>
                                        <Input placeholder="admin@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Password</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                    ) : (<><UserCheck className='h-4 w-4 mr-2' /> Login as Admin</>)}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </>
            )}
        </CardContent>
    </Card>
  );
}
