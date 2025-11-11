

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { ArrowLeft, Save, UserPlus, Briefcase, FilePlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, serverTimestamp, setDoc, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';


const serviceSchema = z.object({
  id: z.string(),
  label: z.string(),
  selected: z.boolean().default(false),
  charge: z.number().optional(),
  remarks: z.string().optional(),
});

const billingSchema = z.object({
  type: z.enum(['sqft', 'package']).default('sqft'),
  ratePerSqft: z.number().optional(),
  totalSqft: z.number().optional(),
  packageAmount: z.number().optional(),
  soilTestFee: z.number().optional(),
});

const projectSchema = z.object({
  projectName: z.string().min(3, { message: 'Project name must be at least 3 characters.' }),
  projectAddress: z.string().min(5, { message: 'Project address is required.' }),
  numberOfStories: z.number().min(1, { message: 'Number of stories is required.' }),
  clientName: z.string().min(2, { message: 'Client name is required.' }),
  clientEmail: z.string().email({ message: 'A valid client email is required.'}),
  clientPhone: z.string().min(11, { message: 'Phone number must be at least 11 digits.' }),
  projectNumber: z.string().min(1, { message: 'Project ID is required.' }),
  services: z.array(serviceSchema).optional(),
  billing: billingSchema.optional(),
  termsAndConditions: z.string().optional(),
});


type ProjectFormValues = z.infer<typeof projectSchema>;

const availableServices = [
    { id: 'architectural', label: 'Architectural Design', charge: 13000, remarks: "Plan, Section, All working detail's" },
    { id: 'structural', label: 'Structural Design', charge: 22000, remarks: "Column, footing, beam, stair, roof detail's" },
    { id: 'electrical', label: 'Electrical Design', charge: 7000, remarks: "Full Building Electrical detail's" },
    { id: 'plumbing', label: 'Plumbing Design', charge: 4000, remarks: "Full Building Plumbing detail's" },
    { id: 'visualization', label: '3D Design View', charge: 8000, remarks: "All side view (Exterior)" },
    { id: 'interior', label: 'Interior Design', charge: 0, remarks: "" },
    { id: 'estimate', label: 'Estimate', charge: 6000, remarks: "Full Building material's detail's" },
    { id: 'paurashava', label: 'Paurashava Approval Sheet', charge: 0, remarks: "" },
    { id: 'citycorp', label: 'City Corporation Approval Sheet', charge: 0, remarks: "" },
    { id: 'soiltest', label: 'Soil Test', charge: 16000, remarks: "60' (Three Bore hole)" },
];

const defaultTerms = `30% of the contract with the design firm is to be paid in advance, and the remaining agreed amount is to be paid in 3 installments.
You can change 10 times after giving the first-floor plan.
No changes will be made after confirmation of the floor plan.
3D can change 2 times, but it must match the plan.
Any issue related to the building design firm should be resolved after providing the service.
There are no hidden fees beyond the fees agreed with the client.
If for any reason the client objects to the design then the payment will not be refunded.
Provide cost estimates for the project may varies & it negotiable.`;


export default function CreateProjectPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const [nameInitials, setNameInitials] = useState('');


  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      projectAddress: '',
      numberOfStories: 1,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectNumber: '',
      services: availableServices.map(s => ({ ...s, selected: false })),
      billing: {
        type: 'sqft',
        ratePerSqft: 0,
        totalSqft: 0,
        packageAmount: 0,
        soilTestFee: 0,
      },
      termsAndConditions: defaultTerms,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const clientName = form.watch('clientName');


  useEffect(() => {
    if (clientName) {
      const initials = clientName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
      setNameInitials(initials);
    } else {
      setNameInitials('');
    }
  }, [clientName]);


  async function onSubmit(values: ProjectFormValues) {
    if (!firestore) {
        toast({
            title: "Error",
            description: "Firestore is not available.",
            variant: "destructive",
        });
        return;
    }

    try {
        const newProjectRef = doc(collection(firestore, 'projects'));
        
        // This creates a placeholder UID. The actual UID will be set when the client signs in via Google.
        const clientUserId = `unassigned_${values.clientEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

        const projectData = {
            id: newProjectRef.id,
            userId: clientUserId,
            projectNumber: `${nameInitials}/${values.projectNumber}`,
            projectName: values.projectName,
            projectAddress: values.projectAddress,
            numberOfStories: values.numberOfStories,
            clientName: values.clientName,
            clientEmail: values.clientEmail,
            clientPhone: values.clientPhone,
            createdAt: serverTimestamp(),
            status: 'Planning',
            parts: [],
            materialPrices: {
                'Cement (bags)': 550,
                'Sand (cft)': 50,
                'Aggregate (cft)': 130,
                'Steel (kg)': 95,
                'Total Bricks (Nos.)': 12,
            },
            services: values.services?.filter(s => s.selected).map(s => ({
                id: s.id,
                label: s.label,
                charge: s.charge || 0,
                remarks: s.remarks || '',
                selected: true,
            })) || [],
            billing: values.billing,
            termsAndConditions: values.termsAndConditions,
        };

        await setDoc(newProjectRef, projectData);

        toast({
            title: "Project Created",
            description: "The new project has been saved successfully.",
        });

        router.push(`/dashboard/projects/${newProjectRef.id}`);

    } catch (error: any) {
        console.error("Error creating project: ", error);
        toast({
            title: "Error",
            description: error.message || "Failed to create project.",
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
            <p className="text-muted-foreground">Define the project and client login details.</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="single" collapsible className="w-full glass-card rounded-lg" defaultValue="item-1">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-6">
                   <div className="flex items-center gap-2 text-lg font-semibold">
                      <Briefcase /> Project & Client Details
                   </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="projectName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Green Valley Apartments" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="clientName" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Full Name</FormLabel>
                                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}/>
                            </div>
                            <FormField control={form.control} name="projectAddress" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Address</FormLabel>
                                    <FormControl><Textarea placeholder="Enter the full site address" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="clientPhone" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Phone Number</FormLabel>
                                      <FormControl><Input type="tel" placeholder="e.g., 01700000000" {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}/>
                                 <FormField control={form.control} name="projectNumber" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Project ID</FormLabel>
                                      <FormControl>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-10 w-auto items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                {nameInitials || '...'}
                                            </div>
                                            <span className="text-muted-foreground">/</span>
                                            <Input type="number" placeholder="e.g., 101" {...field} />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}/>
                                 <FormField control={form.control} name="numberOfStories" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Stories (G+)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        </CardContent>
                    </Card>
                </AccordionContent>
              </AccordionItem>
              
               <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="p-6">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <UserPlus /> Client Login
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader>
                            <CardDescription>
                               Enter the client's Google email address. They will use this email to log in via Google Sign-In. No password is required.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 gap-4">
                                 <FormField control={form.control} name="clientEmail" render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client's Google Email</FormLabel>
                                      <div className="relative">
                                        <FormControl><Input type="email" placeholder="client-google-email@example.com" {...field} /></FormControl>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}/>
                            </div>
                        </CardContent>
                    </Card>
                </AccordionContent>
              </AccordionItem>
              
               <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger className="p-6">
                   <div className="flex items-center gap-2 text-lg font-semibold">
                      <FilePlus /> Services & Billing
                   </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="space-y-6 pt-6">
                        <div>
                            <Label className="font-semibold text-base">Available Services for Invoice</Label>
                             <div className="space-y-2 mt-4">
                                {fields.map((item, index) => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-2 md:items-center p-3 border rounded-lg bg-background/50">
                                        <FormField
                                            control={form.control}
                                            name={`services.${index}.selected`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 md:w-1/4">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className='flex-1'>{item.label}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name={`services.${index}.charge`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input type="number" placeholder="Charge (BDT)" {...field} onChange={e => field.onChange(Number(e.target.value))} disabled={!form.getValues(`services.${index}.selected`)} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`services.${index}.remarks`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl><Input placeholder="Remarks" {...field} disabled={!form.getValues(`services.${index}.selected`)} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                         <div className="space-y-2">
                             <Label className="font-semibold text-base">Terms & Conditions for Invoice</Label>
                             <FormField
                                control={form.control}
                                name="termsAndConditions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl><Textarea rows={8} placeholder="Enter terms and conditions..." {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                         </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <> <Save className="mr-2 h-4 w-4" /> Save Project</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
