
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Package, CheckCircle, XCircle, Send, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { collection, query, orderBy, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc, writeBatch, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import PrintReportWrapper from '@/components/print-report-wrapper';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type MaterialItem = {
    id: string;
    name: string;
    unit: string;
    marketPrice: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

type MaterialProposal = {
    id: string;
    materialName: string;
    proposedPrice: number;
    unit: string;
    justification: string;
    submittedBy: string; // UID
    submittedByName?: string; // Client's display name
    status: 'pending' | 'approved' | 'rejected';
}


const materialSchema = z.object({
  name: z.string().min(2, { message: 'Material name is required.' }),
  unit: z.string().min(1, { message: 'Unit is required (e.g., kg, bag, cft).' }),
  marketPrice: z.number().min(0, { message: 'Market price must be a non-negative number.' }),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock'], { required_error: 'Stock status is required.'}),
});

const proposalSchema = z.object({
    materialName: z.string().min(2, { message: 'Material name is required.' }),
    proposedPrice: z.number().min(1, { message: 'Proposed price must be a positive number.' }),
    unit: z.string().min(1, { message: 'Unit is required.' }),
    justification: z.string().min(10, { message: 'Please provide a brief justification.' }),
})


export default function MaterialsPage() {
    const { firestore } = useFirebase();
    const { user: authUser, sessionRole } = useAuth();
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [proposals, setProposals] = useState<MaterialProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();


     useEffect(() => {
        if (!firestore || !sessionRole) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch materials
                const materialsQuery = query(collection(firestore, 'materials'), orderBy('name'));
                const materialsSnapshot = await getDocs(materialsQuery);
                const materialsData = materialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MaterialItem[];
                setMaterials(materialsData);

                // Fetch proposals
                const proposalsQuery = query(collection(firestore, 'materialProposals'), orderBy('status'));
                const proposalsSnapshot = await getDocs(proposalsQuery);
                const proposalsDataPromises = proposalsSnapshot.docs.map(async (pDoc) => {
                    const proposal = { id: pDoc.id, ...pDoc.data() } as MaterialProposal;
                    // Fetch user name for submittedBy
                    if (sessionRole === 'Admin' && proposal.submittedBy) {
                         try {
                            const userDocRef = doc(firestore, 'users', proposal.submittedBy);
                            const userDoc = await getDoc(userDocRef);
                            proposal.submittedByName = userDoc.exists() ? userDoc.data().displayName : 'Unknown User';
                         } catch (userError) {
                             console.warn(`Could not fetch user profile for ${proposal.submittedBy}`, userError);
                             proposal.submittedByName = 'Unknown User';
                         }
                    }
                    return proposal;
                });
                const proposalsData = await Promise.all(proposalsDataPromises);
                setProposals(proposalsData);

            } catch (error) {
                const permissionError = new FirestorePermissionError({
                    path: 'materials or materialProposals',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [firestore, toast, sessionRole]);
    
    const handleProposalAction = async (proposal: MaterialProposal, newStatus: 'approved' | 'rejected') => {
        if (!firestore || sessionRole !== 'Admin') return;
        
        const batch = writeBatch(firestore);
        const proposalRef = doc(firestore, 'materialProposals', proposal.id);
        
        batch.update(proposalRef, { status: newStatus });

        if (newStatus === 'approved') {
            const materialRef = doc(collection(firestore, 'materials'));
            batch.set(materialRef, {
                name: proposal.materialName,
                unit: proposal.unit,
                marketPrice: proposal.proposedPrice,
                status: 'In Stock'
            });
             setMaterials(prev => [...prev, {
                id: materialRef.id,
                name: proposal.materialName,
                unit: proposal.unit,
                marketPrice: proposal.proposedPrice,
                status: 'In Stock'
            }].sort((a,b) => a.name.localeCompare(b.name)));
        }
        
        try {
            await batch.commit()
            setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: newStatus } : p));
            toast({
                title: `Proposal ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                description: `The proposal for "${proposal.materialName}" has been updated.`
            });
        } catch(serverError) {
            const permissionError = new FirestorePermissionError({
                path: proposalRef.path,
                operation: 'update',
                requestResourceData: { status: newStatus }
            });
            errorEmitter.emit('permission-error', permissionError);
        };
    };


    const statusVariant = {
        'In Stock': 'default',
        'Low Stock': 'secondary',
        'Out of Stock': 'destructive',
    } as const;

    const proposalStatusVariant = {
        'pending': 'outline',
        'approved': 'default',
        'rejected': 'destructive',
    } as const;

    const StockReport = (
      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Market Price</TableHead>
                  <TableHead>Status</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {materials.map((item) => (
                  <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(item.marketPrice)}</TableCell>
                      <TableCell>
                          <Badge variant={statusVariant[item.status] || 'default'}>{item.status}</Badge>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
      </Table>
  );

  const ProposalReport = (
      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>Material</TableHead>
                  {sessionRole === 'Admin' && <TableHead>Submitted By</TableHead>}
                  <TableHead>Status</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {proposals.filter(p => sessionRole === 'Admin' || p.submittedBy === authUser?.uid).map((proposal) => (
                  <TableRow key={proposal.id}>
                      <TableCell>
                          <div className="font-medium">{proposal.materialName}</div>
                          <div className="text-xs text-muted-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(proposal.proposedPrice)} / {proposal.unit}</div>
                      </TableCell>
                      {sessionRole === 'Admin' && <TableCell>{proposal.submittedByName}</TableCell>}
                      <TableCell>
                          <Badge variant={proposalStatusVariant[proposal.status]}>{proposal.status}</Badge>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
      </Table>
  );


  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Materials Management</h1>
                <p className="text-muted-foreground">
                    {sessionRole === 'Admin' ? 'Manage central material stock and client proposals.' : 'View material stock and submit purchase proposals.'}
                </p>
            </div>
            {sessionRole === 'Admin' 
                ? <MaterialDialog onMaterialAdded={(newMaterial) => setMaterials(prev => [...prev, newMaterial].sort((a,b) => a.name.localeCompare(b.name)))} />
                : <ProposalDialog onProposalAdded={(newProposal) => setProposals(prev => [newProposal, ...prev])} />
            }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className={cn(sessionRole === 'Client' ? 'neumorphic-card' : 'glass-card')}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Material Stock</CardTitle>
                        <CardDescription>Central list of all available construction materials.</CardDescription>
                    </div>
                    <PrintReportWrapper
                      trigger={<Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>}
                      title="Material Stock Report"
                    >
                      {StockReport}
                    </PrintReportWrapper>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Market Price</TableHead>
                                <TableHead>Status</TableHead>
                                {sessionRole === 'Admin' && <TableHead><span className="sr-only">Actions</span></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && materials.length === 0 ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    {sessionRole === 'Admin' && <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>}
                                </TableRow>
                            ))
                        ) : materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={sessionRole === 'Admin' ? 5 : 4} className="h-24 text-center">
                                    No materials found. {sessionRole === 'Admin' && 'Add your first material to get started.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(item.marketPrice)}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[item.status] || 'default'}>{item.status}</Badge>
                                </TableCell>
                                {sessionRole === 'Admin' && <TableCell>
                                    <MaterialDialog 
                                        existingMaterial={item}
                                        onMaterialEdited={(edited) => setMaterials(prev => prev.map(m => m.id === edited.id ? edited : m))}
                                        onMaterialDeleted={(id) => setMaterials(prev => prev.filter(m => m.id !== id))}
                                    />
                                </TableCell>}
                            </TableRow>
                        )))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card className={cn(sessionRole === 'Client' ? 'neumorphic-card' : 'glass-card')}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Client Material Proposals</CardTitle>
                        <CardDescription>
                            {sessionRole === 'Admin' ? 'Review and manage material requests from clients.' : 'Your submitted proposals for new materials.'}
                        </CardDescription>
                    </div>
                    <PrintReportWrapper
                      trigger={<Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>}
                      title="Material Proposal Report"
                    >
                      {ProposalReport}
                    </PrintReportWrapper>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                {sessionRole === 'Admin' && <TableHead>Submitted By</TableHead>}
                                <TableHead>Status</TableHead>
                                {sessionRole === 'Admin' && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && proposals.length === 0 ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                    {sessionRole === 'Admin' && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    {sessionRole === 'Admin' && <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>}
                                </TableRow>
                            ))
                        ) : proposals.filter(p => sessionRole === 'Admin' || p.submittedBy === authUser?.uid).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={sessionRole === 'Admin' ? 4 : 2} className="h-24 text-center">
                                    No material proposals found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            proposals.filter(p => sessionRole === 'Admin' || p.submittedBy === authUser?.uid).map((proposal) => (
                            <TableRow key={proposal.id}>
                                <TableCell>
                                    <div className="font-medium">{proposal.materialName}</div>
                                    <div className="text-xs text-muted-foreground">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(proposal.proposedPrice)} / {proposal.unit}</div>
                                </TableCell>
                                {sessionRole === 'Admin' && <TableCell>{proposal.submittedByName}</TableCell>}
                                <TableCell>
                                    <Badge variant={proposalStatusVariant[proposal.status]}>{proposal.status}</Badge>
                                </TableCell>
                                {sessionRole === 'Admin' && <TableCell className="text-right">
                                    {proposal.status === 'pending' && (
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => handleProposalAction(proposal, 'approved')}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleProposalAction(proposal, 'rejected')}>
                                                <XCircle className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>}
                            </TableRow>
                        )))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


function MaterialDialog({ 
    onMaterialAdded, 
    onMaterialEdited, 
    onMaterialDeleted,
    existingMaterial 
}: { 
    onMaterialAdded?: (material: MaterialItem) => void, 
    onMaterialEdited?: (material: MaterialItem) => void, 
    onMaterialDeleted?: (id: string) => void,
    existingMaterial?: MaterialItem 
}) {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof materialSchema>>({
        resolver: zodResolver(materialSchema),
    });

    useEffect(() => {
        if(existingMaterial) {
            form.reset(existingMaterial);
        } else {
            form.reset({ name: '', unit: '', marketPrice: 0, status: 'In Stock' });
        }
    }, [existingMaterial, form]);

    async function onSubmit(values: z.infer<typeof materialSchema>) {
        if (!firestore) return;
        const operationData = values;
        
        if(existingMaterial) {
            // Update
            const docRef = doc(firestore, 'materials', existingMaterial.id);
            try {
                await updateDoc(docRef, operationData)
                toast({ title: 'Material Updated', description: `${values.name} has been updated.` });
                onMaterialEdited?.({ id: existingMaterial.id, ...values});
                form.reset();
                setOpen(false);
            } catch(serverError) {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'update',
                    requestResourceData: operationData
                });
                errorEmitter.emit('permission-error', permissionError);
            };

        } else {
            // Add new
            const collectionRef = collection(firestore, 'materials');
            try {
                const docRef = await addDoc(collectionRef, operationData)
                toast({ title: 'Material Added', description: `${values.name} has been added to the stock.` });
                onMaterialAdded?.({ id: docRef.id, ...values });
                form.reset();
                setOpen(false);
            } catch(serverError) {
                const permissionError = new FirestorePermissionError({
                    path: collectionRef.path,
                    operation: 'create',
                    requestResourceData: operationData
                });
                errorEmitter.emit('permission-error', permissionError);
            };
        }
    }

    async function handleDelete() {
        if (!firestore || !existingMaterial || !onMaterialDeleted) return;
        
        const docRef = doc(firestore, 'materials', existingMaterial.id);
        try {
            await deleteDoc(docRef)
            toast({ title: "Material Deleted", description: "The material has been removed from stock." });
            onMaterialDeleted(existingMaterial.id);
            setDeleteDialogOpen(false);
            setOpen(false);
        } catch(serverError) {
             const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        };
    }

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {existingMaterial ? (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => setOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-destructive focus:bg-destructive/30">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Material</Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{existingMaterial ? 'Edit' : 'Add New'} Material</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Material Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Cement (Portland)" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="unit" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unit of Measurement</FormLabel>
                                <FormControl><Input placeholder="e.g., bag, cft, kg, Nos." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="marketPrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Market Price (per unit in BDT)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 550" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Saving..." : (existingMaterial ? "Save Changes" : "Add to Stock")}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
             <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete <span className="font-semibold">{existingMaterial?.name}</span> from the central stock.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

function ProposalDialog({ onProposalAdded }: { onProposalAdded: (proposal: MaterialProposal) => void }) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof proposalSchema>>({
        resolver: zodResolver(proposalSchema),
        defaultValues: { materialName: '', unit: '', proposedPrice: 0, justification: '' },
    });

    async function onSubmit(values: z.infer<typeof proposalSchema>) {
        if (!firestore || !user) return;
        const operationData = {
            ...values,
            submittedBy: user.uid,
            status: 'pending',
            createdAt: serverTimestamp(),
        };

        const collectionRef = collection(firestore, 'materialProposals');
        try {
            const docRef = await addDoc(collectionRef, operationData)
            toast({ title: 'Proposal Submitted', description: `Your proposal for ${values.materialName} has been sent for review.` });
            onProposalAdded({ id: docRef.id, submittedBy: user.uid, status: 'pending', ...values });
            form.reset();
            setOpen(false);
        } catch(serverError) {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: operationData
            });
            errorEmitter.emit('permission-error', permissionError);
        };
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Send className="mr-2 h-4 w-4" /> Submit Purchase</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit a Material Purchase Proposal</DialogTitle>
                    <CardDescription>If you purchased a material not in the stock list, you can submit it here for admin approval and add it to the project expenses.</CardDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField control={form.control} name="materialName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Material Name</FormLabel>
                                <FormControl><Input placeholder="e.g., 'Anchor' brand Cement" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="proposedPrice" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Price (BDT)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 550" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="unit" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit</FormLabel>
                                    <FormControl><Input placeholder="e.g., bag, cft, kg" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="justification" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Justification / Shop Memo</FormLabel>
                                <FormControl><Textarea placeholder="Provide a reason for this purchase or a memo number." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Submitting..." : "Submit Proposal"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
