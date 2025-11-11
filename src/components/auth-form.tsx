
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'register';
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isLogin = mode === 'login';
  const schema = isLogin ? loginSchema : registerSchema;

  const form = useForm<any>({ // Use any to avoid complex conditional type issues with defaultValues
    resolver: zodResolver(schema),
    defaultValues: isLogin
      ? { email: '', password: '' }
      : { name: '', email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    form.clearErrors();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, values.email, values.password);
      } else {
        const nonLoginValues = values as z.infer<typeof registerSchema>;
        const cred = await createUserWithEmailAndPassword(auth, nonLoginValues.email, nonLoginValues.password);
        await updateProfile(cred.user, { displayName: nonLoginValues.name });
      }
      toast({
        title: isLogin ? 'Login Successful' : 'Registration Successful',
        description: isLogin ? "Welcome back!" : "Your account has been created.",
      });
      router.push('/dashboard');
      router.refresh(); // This helps in re-running the auth check on the server
    } catch (error: any) {
      console.error('Authentication error:', error.message);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code) {
          switch (error.code) {
              case 'auth/user-not-found':
              case 'wrong-password':
              case 'auth/invalid-credential':
                  errorMessage = 'Invalid email or password. Please try again.';
                  break;
              case 'auth/email-already-in-use':
                  errorMessage = 'This email is already registered. Please login.';
                  break;
              case 'auth/weak-password':
                  errorMessage = 'The password is too weak. Please use a stronger password.';
                  break;
              default:
                  errorMessage = 'Authentication failed. Please try again later.';
          }
      }
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Link href="/" className="flex justify-center mb-4">
          <Image src="/my_logo.png" alt="Logo" width={150} height={38} priority className="object-contain" />
        </Link>
        <CardTitle>{isLogin ? 'Welcome Back' : 'Create an Account'}</CardTitle>
        <CardDescription>
          {isLogin ? 'Sign in to continue to your dashboard.' : 'Enter your details to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <FormField
                control={form.control}
                name={"name" as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <Button variant="link" asChild className="px-1">
            <Link href={isLogin ? '/register' : '/login'}>{isLogin ? 'Sign Up' : 'Login'}</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
