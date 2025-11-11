

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, PlusCircle, Trash2, Save, BarChart, Edit, Calculator, FileText, DollarSign, Receipt, Users, AlignHorizontalSpaceBetween, Cylinder, LayoutGrid, ToyBrick, Shovel, Sparkles, GitMerge, Pilaster, Webhook, Stairs, Archive, BoxSelect, Building2 } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { doc, onSnapshot, updateDoc, deleteDoc, collection, getDocs, query, where, orderBy, addDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import PileMaterialCalculator from '@/components/pile-material-calculator';
import PileCapMaterialCalculator from '@/components/pile-cap-material-calculator';
import ColumnMaterialCalculator from '@/components/column-material-calculator';
import BeamMaterialCalculator from '@/components/beam-material-calculator';
import GradeBeamMaterialCalculator from '@/components/grade-beam-material-calculator';
import SlabMaterialCalculator from '@/components/slab-material-calculator';
import MatFoundationMaterialCalculator from '@/components/mat-foundation-material-calculator';
import CombinedFootingMaterialCalculator from '@/components/combined-footing-material-calculator';
import ShortColumnMaterialCalculator from '@/components/short-column-material-calculator';
import RetainingWallMaterialCalculator from '@/components/retaining-wall-material-calculator';
import StaircaseMaterialCalculator from '@/components/staircase-material-calculator';
import BrickworkCalculator from '@/components/brickwork-calculator';
import CcCastingCalculator from '@/components/cc-casting-calculator';
import EarthworkCalculator from '@/components/earthwork-calculator';
import StandaloneFootingCalculator from '@/components/standalone-footing-calculator';
import MaterialReport from '@/components/material-report';
import FullProjectReport from '@/components/full-project-report';
import { useFirebase } from '@/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Invoice } from '@/components/invoice';
import { PaymentTransaction, ProjectService, DailyAttendance } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PrintReportWrapper from '@/components/print-report-wrapper';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type PartType =
  | 'pile'
  | 'pile-cap'
  | 'standalone-footing'
  | 'combined-footing'
  | 'mat-foundation'
  | 'short-column'
  | 'column'
  | 'grade-beam'
  | 'beam'
  | 'slab'
  | 'staircase'
  | 'retaining-wall'
  | 'brickwork'
  | 'cc-casting'
  | 'earthwork';

type PartDefinition = {
  label: string;
  component: React.FC<any>;
  icon: React.FC<any>;
};

export type StructuralPart = {
  id: string;
  name: string;
  type: PartType;
  data: any;
};

export type MaterialPrices = {
    'Cement (bags)': number;
    'Sand (cft)': number;
    'Aggregate (cft)': number;
    'Steel (kg)': number;
    'Total Bricks (Nos.)': number;
}

export type Billing = {
    type: 'sqft' | 'package';
    ratePerSqft?: number;
    totalSqft?: number;
    packageAmount?: number;
    soilTestFee?: number;
};

export type ProjectData = {
  id: string;
  userId: string;
  projectNumber: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  parts: StructuralPart[];
  materialPrices: MaterialPrices;
  numberOfStories?: number;
  createdAt: { seconds: number, nanoseconds: number };
  services: ProjectService[];
  billing: Billing;
  termsAndConditions?: string;
  projectAddress?: string;
};

const partTypes: Record<PartType, PartDefinition> = {
  'earthwork': { label: 'Earthwork', component: EarthworkCalculator, icon: Shovel },
  'cc-casting': { label: 'CC Casting / Soling', component: CcCastingCalculator, icon: Sparkles },
  'pile': { label: 'Pile', component: PileMaterialCalculator, icon: Cylinder },
  'pile-cap': { label: 'Pile Cap', component: PileCapMaterialCalculator, icon: BoxSelect },
  'standalone-footing': { label: 'Standalone Footing', component: StandaloneFootingCalculator, icon: Archive },
  'mat-foundation': { label: 'Mat Foundation', component: MatFoundationMaterialCalculator, icon: Archive },
  'combined-footing': { label: 'Combined Footing', component: CombinedFootingMaterialCalculator, icon: GitMerge },
  'short-column': { label: 'Short Column', component: ShortColumnMaterialCalculator, icon: Building2 },
  'grade-beam': { label: 'Grade Beam', component: GradeBeamMaterialCalculator, icon: AlignHorizontalSpaceBetween },
  'column': { label: 'Column', component: ColumnMaterialCalculator, icon: Pilaster },
  'beam': { label: 'Floor Beam', component: BeamMaterialCalculator, icon: AlignHorizontalSpaceBetween },
  'slab': { label: 'Slab', component: SlabMaterialCalculator, icon: LayoutGrid },
  'staircase': { label: 'Staircase', component: StaircaseMaterialCalculator, icon: Stairs },
  'retaining-wall': { label: 'Retaining Wall', component: RetainingWallMaterialCalculator, icon: Webhook },
  'brickwork': { label: 'Brickwork', component: BrickworkCalculator, icon: ToyBrick },
};

const partOrder: PartType[] = [
    'earthwork', 'cc-casting', 'pile', 'pile-cap', 'standalone-footing', 'mat-foundation', 
    'combined-footing', 'short-column', 'grade-beam', 'column', 'beam', 'slab', 
    'staircase', 'retaining-wall', 'brickwork'
];

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id: projectId } = params;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<StructuralPart | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { sessionRole } = useAuth();


  useEffect(() => {
    if (!firestore || !projectId) return;

    const unsubProject = onSnapshot(doc(firestore, `projects`, projectId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Omit<ProjectData, 'id'>;
        setProject({ ...data, id: doc.id });
      } else {
        toast({ title: "Project Not Found", variant: "destructive" });
        router.push('/dashboard/projects');
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching project:", error);
        toast({ title: "Error", description: "Could not fetch project data.", variant: "destructive" });
        router.push('/dashboard/projects');
    });

    const unsubTransactions = onSnapshot(query(collection(firestore, `projects/${projectId}/transactions`), orderBy('date', 'asc')), (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentTransaction)));
    });

    const unsubAttendances = onSnapshot(query(collection(firestore, `projects/${projectId}/dailyAttendances`), orderBy('date', 'desc')), (snapshot) => {
        setAttendances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyAttendance)));
    });


    return () => {
        unsubProject();
        unsubTransactions();
        unsubAttendances();
    };
}, [projectId, router, toast, firestore]);

  
  const handleAddPart = async (partData: any, partType: PartType, name: string) => {
    if (!project || !firestore) return;

    const newPart: StructuralPart = {
      id: new Date().toISOString(), // Unique ID
      name: name,
      type: partType,
      data: partData,
    };
    
    const projectRef = doc(firestore, 'projects', project.id);
    await updateDoc(projectRef, { parts: [...(project.parts || []), newPart] });
    toast({ title: "Part Added", description: `"${name}" has been added to the project.`});
    setOpenAddDialog(false);
  };
  
  const handleUpdatePart = async (partData: any) => {
    if (!project || !editingPart || !firestore) return;

    const updatedParts = (project.parts || []).map(p => 
        p.id === editingPart.id ? { ...p, data: partData, name: editingPart.name } : p
    );
    
    const projectRef = doc(firestore, 'projects', project.id);
    await updateDoc(projectRef, { parts: updatedParts });
    toast({ title: "Part Updated", description: `"${editingPart.name}" has been updated.`});
    setOpenEditDialog(false);
    setEditingPart(null);
  };

  const handleDeletePart = async (partId: string) => {
    if (!project || !firestore) return;
    const updatedParts = (project.parts || []).filter(p => p.id !== partId);
    const projectRef = doc(firestore, 'projects', project.id);
    await updateDoc(projectRef, { parts: updatedParts });
    toast({ title: "Part Deleted", description: "The structural part has been removed."});
  };
  
  const handleDeleteProject = async () => {
    if (!project || !firestore) return;

    try {
        const batch = writeBatch(firestore);

        // 1. Delete the project document
        const projectRef = doc(firestore, `projects`, project.id);
        batch.delete(projectRef);

        // 2. Delete the associated user document from /users
        if (project.userId && !project.userId.startsWith('unassigned_')) {
            const userRef = doc(firestore, 'users', project.userId);
            batch.delete(userRef);
        }

        // Commit the batch
        await batch.commit();

        toast({
            title: "Project Deleted",
            description: `"${project.projectName}" and its associated client data have been removed.`,
        });
        router.push('/dashboard/projects');
    } catch (error) {
        console.error("Error deleting project and user data:", error);
        toast({
            title: "Error",
            description: "Failed to delete project. Please try again.",
            variant: "destructive"
        });
    } finally {
        setDeleteAlertOpen(false);
    }
  }


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (project) {
        const newPrices = { ...project.materialPrices, [name]: Number(value) };
        setProject(prev => prev ? { ...prev, materialPrices: newPrices } : null);
    }
  }

  const handleSavePrices = async () => {
      if (!project || !firestore) return;
      const projectRef = doc(firestore, 'projects', project.id);
      await updateDoc(projectRef, { materialPrices: project.materialPrices });
      toast({ title: "Prices Saved", description: "Material prices have been updated."});
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9"/>
                <div>
                    <Skeleton className="h-8 w-64"/>
                    <Skeleton className="h-5 w-48 mt-1"/>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64"/>
                <Skeleton className="h-64"/>
            </div>
        </div>
    )
  }

  if (!project) {
    return null; // The useEffect hook will redirect.
  }

  const { projectName, clientName, parts = [], materialPrices, projectNumber } = project;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Projects</span>
            </Link>
            </Button>
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{projectName}</h1>
            <p className="text-muted-foreground">Client: {clientName} | Project ID: <span className='font-mono'>{projectNumber}</span></p>
            </div>
        </div>
        {sessionRole === 'Admin' && <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className='text-destructive focus:bg-destructive/30'>
                          Confirm Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the project <span className="font-semibold">"{projectName}"</span> and its associated client data. The client will no longer be able to log in.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className='flex items-center gap-2'>
                    <Building className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base md:text-lg">Structural Parts</CardTitle>
                </div>
                {sessionRole === 'Admin' && <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Part
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                             {partOrder.map(partKey => {
                                const { label, icon: Icon } = partTypes[partKey as PartType];
                                return (
                                    <DropdownMenuItem key={partKey} onSelect={() => {
                                        setEditingPart(null); // Clear any previous editing state
                                        const newPart: StructuralPart = { id: '', name: label, type: partKey as PartType, data: null };
                                        setEditingPart(newPart); // Set a temporary part for AddPartForm
                                        setOpenAddDialog(true);
                                    }}>
                                        <Icon className="h-4 w-4 mr-2"/>
                                        <span>{label}</span>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Dialog>}
              </div>
              <CardDescription>
                Add and manage all the structural components of your project for estimation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No parts added yet. {sessionRole === 'Admin' && 'Click "Add Part" to start.'}</p>
              ) : (
                <div className="space-y-4">
                  {parts.map((part) => {
                    const PartIcon = partTypes[part.type]?.icon || Calculator;
                    return (
                    <Card key={part.id} className='bg-background/70'>
                        <CardHeader className='p-4 flex flex-row items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <PartIcon className="h-4 w-4 mr-2"/>
                                <CardTitle className='text-lg'>{part.name}</CardTitle>
                            </div>
                            <div className="flex gap-1">
                                 <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <FileText className="h-4 w-4"/>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Material Report for: {part.name}</DialogTitle>
                                        </DialogHeader>
                                        <MaterialReport part={part} />
                                    </DialogContent>
                                </Dialog>
                                {sessionRole === 'Admin' && <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPart(part); setOpenEditDialog(true);}}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePart(part.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </>}
                            </div>
                        </CardHeader>
                    </Card>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
           <Card className="neumorphic-card">
              <CardHeader>
                  <div className='flex items-center gap-2'>
                      <Users className="w-5 h-5 text-primary" />
                      <CardTitle className="text-base md:text-lg">Laborer Management</CardTitle>
                  </div>
                <CardDescription>Manage daily laborer attendance and costs for this project.</CardDescription>
              </CardHeader>
              <CardContent>
                <LaborerManagement projectId={project.id} attendances={attendances} sessionRole={sessionRole} />
              </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full glass-card rounded-lg" defaultValue='item-1'>
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="p-6">
                        <div className='flex items-center gap-2'>
                            <DollarSign className="w-5 h-5 text-primary" />
                            <CardTitle className="p-0 text-base md:text-lg">Material Prices (BDT)</CardTitle>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div className="space-y-4">
                            <CardDescription>Update current market prices to get an accurate total cost.</CardDescription>
                            {Object.entries(materialPrices).map(([key, value]) => (
                                <div className="space-y-2" key={key}>
                                    <Label htmlFor={key} className="text-sm">{key.replace(/ \(.+\)/, '')}</Label>
                                    <Input 
                                        id={key}
                                        name={key}
                                        type="number" 
                                        value={value} 
                                        onChange={handlePriceChange}
                                        readOnly={sessionRole !== 'Admin'}
                                        className={sessionRole !== 'Admin' ? 'bg-muted/50' : ''}
                                    />
                                </div>
                            ))}
                            {sessionRole === 'Admin' && <Button size="sm" onClick={handleSavePrices} className="w-full"><Save className="mr-2 h-4 w-4" />Save Prices</Button>}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
           <Card className="glass-card">
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Receipt className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base md:text-lg">Billing &amp; Invoice</CardTitle>
                    </div>
                    <CardDescription>Generate and view the project invoice based on selected services and payments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <PrintReportWrapper
                      trigger={<Button size="sm" className="w-full">View Invoice</Button>}
                      title="Invoice & Offer Letter"
                    >
                      <Invoice project={project} transactions={transactions} />
                    </PrintReportWrapper>
                </CardContent>
            </Card>
           <Card className="glass-card">
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <BarChart className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base md:text-lg">Full Project Report</CardTitle>
                    </div>
                    <CardDescription>View, print, or download the complete estimation report.</CardDescription>
                </CardHeader>
                <CardContent>
                     <PrintReportWrapper
                      trigger={<Button size="sm" className="w-full" variant="outline">View Report</Button>}
                      title={`Project Report - ${project.projectName}`}
                    >
                        <FullProjectReport project={project} />
                    </PrintReportWrapper>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Add/Edit Dialog */}
       <Dialog open={(openAddDialog || openEditDialog) && sessionRole === 'Admin'} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setEditingPart(null);
                setOpenAddDialog(false);
                setOpenEditDialog(false);
            }
        }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editingPart && editingPart.id ? 'Edit Part: ' : 'Add New Part: '} {editingPart?.name}</DialogTitle>
                </DialogHeader>
                {editingPart && partTypes[editingPart.type] &&
                    React.createElement(partTypes[editingPart.type].component, {
                        onSave: editingPart.id ? handleUpdatePart : (data: any) => handleAddPart(data, editingPart.type, editingPart.name),
                        initialData: editingPart.id ? editingPart.data : undefined,
                        projectData: project,
                        isEditing: !!editingPart.id
                    })
                }
            </DialogContent>
        </Dialog>

    </div>
  );
}


function LaborerManagement({ projectId, attendances, sessionRole }: { projectId: string, attendances: DailyAttendance[], sessionRole: 'Admin' | 'Client' | null }) {
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleAddAttendance = async (date: Date, numberOfLaborers: number, wagePerLaborer: number) => {
        if (!firestore) return;

        try {
            await addDoc(collection(firestore, `projects/${projectId}/dailyAttendances`), {
              date: Timestamp.fromDate(date),
              numberOfLaborers,
              wagePerLaborer
            });
            toast({ title: "Attendance Added", description: `Added ${numberOfLaborers} laborers for ${format(date, 'PPP')}.` });
        } catch (error) {
            console.error("Error adding attendance: ", error);
            toast({ title: "Error", description: "Could not add attendance.", variant: "destructive" });
        }
    };

    if (attendances.length === 0 && sessionRole === 'Client') {
        return <p className="text-muted-foreground text-center py-8">No laborer attendance records available for this project yet.</p>;
    }
    
    return (
        <div className='space-y-4'>
            {sessionRole === 'Admin' && <AddAttendanceDialog onAdd={handleAddAttendance} />}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Number of Laborers</TableHead>
                        <TableHead className="text-right">Wage per Laborer</TableHead>
                        <TableHead className="text-right">Total Daily Cost</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendances.map(att => {
                        const totalCost = att.numberOfLaborers * att.wagePerLaborer;
                        const date = att.date && (att.date as any).seconds 
                            ? new Date((att.date as any).seconds * 1000) 
                            : att.date;

                        return (
                            <TableRow key={att.id}>
                                <TableCell>{date instanceof Date ? format(date, 'PPP') : 'Invalid Date'}</TableCell>
                                <TableCell className="text-center">{att.numberOfLaborers}</TableCell>
                                <TableCell className="text-right">{new Intl.NumberFormat('en-IN').format(att.wagePerLaborer)}</TableCell>
                                <TableCell className="text-right font-semibold">{new Intl.NumberFormat('en-IN').format(totalCost)}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function AddAttendanceDialog({ onAdd }: { onAdd: (date: Date, numberOfLaborers: number, wagePerLaborer: number) => void }) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [numberOfLaborers, setNumberOfLaborers] = useState(1);
    const [wagePerLaborer, setWagePerLaborer] = useState(800);

    const handleSave = () => {
        if (date) {
            onAdd(date, numberOfLaborers, wagePerLaborer);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Daily Attendance</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Daily Attendance Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numberOfLaborers">Number of Laborers</Label>
                        <Input id="numberOfLaborers" type="number" value={numberOfLaborers} onChange={(e) => setNumberOfLaborers(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wagePerLaborer">Wage per Laborer (BDT)</Label>
                        <Input id="wagePerLaborer" type="number" value={wagePerLaborer} onChange={(e) => setWagePerLaborer(Number(e.target.value))} />
                    </div>
                </div>
                <Button onClick={handleSave}>Save Record</Button>
            </DialogContent>
        </Dialog>
    );
}

    

    

    