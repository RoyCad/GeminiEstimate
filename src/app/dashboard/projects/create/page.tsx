
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const projectSchema = z.object({
  projectName: z.string().min(3, { message: 'Project name must be at least 3 characters.' }),
  clientName: z.string().min(2, { message: 'Client name is required.' }),
  clientAddress: z.string().optional(),
  projectAddress: z.string().min(5, { message: 'Project address is required.' }),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function CreateProjectPage() {
    const router = useRouter();
    const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      clientName: '',
      clientAddress: '',
      projectAddress: '',
      description: '',
    },
  });

  async function onSubmit(values: ProjectFormValues) {
    try {
        const newProjectRef = doc(collection(db, 'projects'));
        const newProjectId = newProjectRef.id;

        await setDoc(newProjectRef, {
            ...values,
            id: newProjectId,
            createdAt: serverTimestamp(),
            status: 'Planning',
            parts: [],
            materialPrices: {
                'Cement (bags)': 550,
                'Sand (cft)': 50,
                'Aggregate (cft)': 130,
                'Steel (kg)': 95,
                'Total Bricks (Nos.)': 12,
            }
        });

        toast({
            title: "Project Created",
            description: "Your new project has been saved successfully.",
        });

        router.push(`/dashboard/projects/${newProjectId}`);

    } catch (error) {
        console.error("Error creating project: ", error);
        toast({
            title: "Error",
            description: "Failed to create project. Please try again.",
            variant: "destructive",
        });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Projects</span>
            </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Project</h1>
            <p className="text-muted-foreground">Start a new estimation by providing project details.</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Project & Client Information</CardTitle>
              <CardDescription>Enter the basic details for this project and the client.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Green Valley Apartments" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="projectAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter the full site address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any relevant notes or description about the project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="clientAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="(Optional) Enter client's contact address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : <> <Save className="mr-2 h-4 w-4" /> Save and Continue </>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
