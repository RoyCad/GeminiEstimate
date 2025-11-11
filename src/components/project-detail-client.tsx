
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, PlusCircle, Trash2, Save, BarChart, Edit, Calculator, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import CcCastingCalculator from '@/components/cc-welding-calculator';
import EarthworkCalculator from '@/components/earthwork-calculator';
import MaterialReport from '@/components/material-report';
import FullProjectReport from '@/components/full-project-report';

// Icons
const PileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cylinder h-4 w-4 mr-2">
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 5v14a8 3 0 0 0 16 0V5"/>
  </svg>
)
const PileCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box-select h-4 w-4 mr-2">
        <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/>
        <path d="M9 3v18"/>
        <path d="M15 3v18"/>
        <path d="M3 9h18"/>
        <path d="M3 15h18"/>
    </svg>
)
const MatFoundationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-archive h-4 w-4 mr-2">
        <rect width="20" height="5" x="2" y="3" rx="1"/>
        <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/>
        <path d="M10 12h4"/>
    </svg>
)
const CombinedFootingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-merge h-4 w-4 mr-2">
        <circle cx="18" cy="18" r="3"/>
        <circle cx="6" cy="6" r="3"/>
        <path d="M6 21V9a9 9 0 0 1 9 9"/>
    </svg>
)
const ShortColumnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pilaster h-4 w-4 mr-2">
        <rect width="18" height="12" x="3" y="9" rx="2"/>
        <path d="M8 22V10"/>
        <path d="M16 22V10"/>
        <path d="M8 6V4"/>
        <path d="M16 6V4"/>
    </svg>
)
const RetainingWallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-webhook h-4 w-4 mr-2">
        <path d="M18 16.99h-5v-1.1L22 7V4H2v3l9 8.89V17H6v3h12z"/>
    </svg>
)
const StairsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stairs h-4 w-4 mr-2">
        <path d="M4 18h4v-4h4v-4h4V6"/>
        <path d="m7 14 3-3 4-4 4-4"/>
    </svg>
);
const BrickIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bricks h-4 w-4 mr-2">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M12 9h10"/>
        <path d="M3 9h4"/>
        <path d="M3 15h10"/>
        <path d="M17 15h4"/>
        <path d="M9 3v18"/>
    </svg>
);
const CcCastingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles h-4 w-4 mr-2">
        <path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 16l1.9-4.8 4.8-1.9-4.8-1.9L12 3z"/>
        <path d="M5 21v-3.5c0-1.4 1.1-2.5 2.5-2.5h1.1c.5 0 1-.2 1.4-.6l.8-1.1c.4-.4.4-1 0-1.4l-.8-1.1c-.4-.4-.9-.6-1.4-.6H7.5C6.1 10 5 8.9 5 7.5V4"/>
        <path d="M19 21v-3.5c0-1.4-1.1-2.5-2.5-2.5h-1.1c-.5 0-1-.2-1.4-.6l-.8-1.1c-.4-.4-.4-1 0-1.4l.8-1.1c.4-.4.9-.6 1.4-.6h1.1c1.4 0 2.5-1.1 2.5-2.5V4"/>
    </svg>
);
const EarthworkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shovel h-4 w-4 mr-2">
      <path d="M2 22v-5l5-5"/>
      <path d="M9.5 14.5 16 21"/>
      <path d="m18 13-1.3-1.3a2.5 2.5 0 0 0-3.5-3.5L2 22"/>
      <path d="m13.5 6.5 7-7"/>
    </svg>
);
const BeamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-align-horizontal-space-between h-4 w-4 mr-2">
        <rect width="6" height="14" x="3" y="5" rx="2" />
        <rect width="6" height="10" x="15" y="7" rx="2" />
        <path d="M3 2h18" />
        <path d="M3 22h18" />
    </svg>
)
const SlabIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid h-4 w-4 mr-2">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V3"/>
    </svg>
)
const ColumnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pilaster h-4 w-4 mr-2">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M8 22V4"/>
        <path d="M16 22V4"/>
    </svg>
)


type PartType =
  | 'pile'
  | 'pile-cap'
  | 'column'
  | 'beam'
  | 'grade-beam'
  | 'slab'
  | 'mat-foundation'
  | 'combined-footing'
  | 'short-column'
  | 'retaining-wall'
  | 'staircase'
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

export type ProjectData = {
  id: string;
  projectName: string;
  clientName: string;
  parts: StructuralPart[];
  materialPrices: MaterialPrices;
};

const partTypes: Record<PartType, PartDefinition> = {
  'earthwork': { label: 'Earthwork', component: EarthworkCalculator, icon: EarthworkIcon },
  'pile': { label: 'Pile', component: PileMaterialCalculator, icon: PileIcon },
  'pile-cap': { label: 'Pile Cap', component: PileCapMaterialCalculator, icon: PileCapIcon },
  'mat-foundation': { label: 'Mat Foundation', component: MatFoundationMaterialCalculator, icon: MatFoundationIcon },
  'combined-footing': { label: 'Combined Footing', component: CombinedFootingMaterialCalculator, icon: CombinedFootingIcon },
  'short-column': { label: 'Short Column', component: ShortColumnMaterialCalculator, icon: ShortColumnIcon },
  'column': { label: 'Column', component: ColumnMaterialCalculator, icon: ColumnIcon },
  'grade-beam': { label: 'Grade Beam', component: GradeBeamMaterialCalculator, icon: BeamIcon },
  'beam': { label: 'Beam', component: BeamMaterialCalculator, icon: BeamIcon },
  'slab': { label: 'Slab', component: SlabMaterialCalculator, icon: SlabIcon },
  'retaining-wall': { label: 'Retaining Wall', component: RetainingWallMaterialCalculator, icon: RetainingWallIcon },
  'staircase': { label: 'Staircase', component: StaircaseMaterialCalculator, icon: StairsIcon },
  'brickwork': { label: 'Brickwork', component: BrickworkCalculator, icon: BrickIcon },
  'cc-casting': { label: 'CC Casting', component: CcCastingCalculator, icon: CcCastingIcon },
};

type ProjectDetailClientProps = {
  projectId: string;
};

export default function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<StructuralPart | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const docRef = doc(db, 'projects', projectId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as ProjectData;
        if (!data.materialPrices) {
            data.materialPrices = {
                'Cement (bags)': 550,
                'Sand (cft)': 50,
                'Aggregate (cft)': 130,
                'Steel (kg)': 95,
                'Total Bricks (Nos.)': 12,
            };
        }
        setProject(data);
      } else {
        toast({
            title: "Project Not Found",
            description: "The requested project does not exist.",
            variant: "destructive"
        });
        router.push('/dashboard/projects');
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching project:", error);
        toast({
            title: "Error",
            description: "Could not fetch project data.",
            variant: "destructive"
        });
        router.push('/dashboard/projects');
    });
    return () => unsubscribe();
  }, [projectId, router, toast]);

  const saveProjectData = async (dataToSave: Partial<ProjectData>) => {
    if (!project) return;
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, dataToSave);
  };
  

  const handleAddPart = async (partData: any, partType: PartType, name: string) => {
    if (!project) return;

    const newPart: StructuralPart = {
      id: new Date().toISOString(), // Unique ID
      name: name,
      type: partType,
      data: partData,
    };
    
    await saveProjectData({ parts: [...project.parts, newPart]});
    toast({ title: "Part Added", description: `"${name}" has been added to the project.`});
    setOpenAddDialog(false);
  };
  
  const handleUpdatePart = async (partData: any) => {
    if (!project || !editingPart) return;

    const updatedParts = project.parts.map(p => 
        p.id === editingPart.id ? { ...p, data: partData, name: partData.name || editingPart.name } : p
    );
    
    await saveProjectData({ parts: updatedParts });
    toast({ title: "Part Updated", description: `"${editingPart.name}" has been updated.`});
    setOpenEditDialog(false);
    setEditingPart(null);
  };

  const handleDeletePart = async (partId: string) => {
    if (!project) return;
    const updatedParts = project.parts.filter(p => p.id !== partId);
    await saveProjectData({ parts: updatedParts });
    toast({ title: "Part Deleted", description: "The structural part has been removed."});
  };
  
  const handleDeleteProject = async () => {
    if (!project) return;
    try {
        await deleteDoc(doc(db, 'projects', project.id));
        toast({
            title: "Project Deleted",
            description: `"${project.projectName}" has been successfully deleted.`
        });
        router.push('/dashboard/projects');
    } catch (error) {
        console.error("Error deleting project:", error);
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
        setProject(prev => prev ? { ...prev, materialPrices: { ...prev.materialPrices, [name]: Number(value) }} : null);
    }
  }

  const handleSavePrices = async () => {
      if (!project) return;
      await saveProjectData({ materialPrices: project.materialPrices });
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

  const { projectName, clientName, parts, materialPrices } = project;
  const PartCalculator = editingPart ? partTypes[editingPart.type].component : null;

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
            <p className="text-muted-foreground">Client: {clientName}</p>
            </div>
        </div>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the project
                        <span className="font-semibold">"{projectName}"</span> and all its data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className='flex items-center gap-2'>
                    <Building className="w-5 h-5 text-primary" />
                    <CardTitle>Structural Parts</CardTitle>
                </div>
                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Part
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Structural Part</DialogTitle>
                    </DialogHeader>
                    <AddPartForm onAdd={handleAddPart} />
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Add and manage all the structural components of your project for estimation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No parts added yet. Click "Add Part" to start.</p>
              ) : (
                <div className="space-y-4">
                  {parts.map((part) => {
                    const PartIcon = partTypes[part.type]?.icon || Calculator;
                    return (
                    <Card key={part.id} className='bg-background/70'>
                        <CardHeader className='p-4 flex flex-row items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <PartIcon />
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
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingPart(part); setOpenEditDialog(true);}}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePart(part.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <DollarSign className="w-5 h-5 text-primary" />
                        <CardTitle>Material Prices (BDT)</CardTitle>
                    </div>
                    <Button size="sm" onClick={handleSavePrices}><Save className="mr-2 h-4 w-4" />Save</Button>
                </div>
              <CardDescription>Update current market prices to get an accurate total cost.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(materialPrices).map(([key, value]) => (
                    <div className="space-y-2" key={key}>
                        <Label htmlFor={key} className="text-sm">{key.replace(/ \(.+\)/, '')}</Label>
                        <Input 
                            id={key}
                            name={key}
                            type="number" 
                            value={value} 
                            onChange={handlePriceChange}
                        />
                    </div>
                ))}
            </CardContent>
          </Card>
           <Card className="glass-card">
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <BarChart className="w-5 h-5 text-primary" />
                        <CardTitle>Full Project Report</CardTitle>
                    </div>
                    <CardDescription>View, print, or download the complete estimation report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FullProjectReport project={project} />
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={(isOpen) => { if (!isOpen) setEditingPart(null); setOpenEditDialog(isOpen); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle>Edit: {editingPart?.name}</DialogTitle>
              </DialogHeader>
              {PartCalculator && editingPart && (
                  <PartCalculator 
                    onSave={handleUpdatePart} 
                    initialData={editingPart.data} 
                    isEditing={true} 
                  />
              )}
          </DialogContent>
      </Dialog>

    </div>
  );
}


type AddPartFormProps = {
  onAdd: (partData: any, partType: PartType, name: string) => void;
};

const AddPartForm: React.FC<AddPartFormProps> = ({ onAdd }) => {
  const [selectedType, setSelectedType] = useState<PartType | null>(null);
  const [partName, setPartName] = useState('');
  const [step, setStep] = useState(1);

  const handleSave = (partData: any) => {
    if (selectedType && partName) {
      onAdd(partData, selectedType, partName);
    }
  };
  
  const handleSelectType = (type: PartType) => {
      setSelectedType(type);
      setPartName(partTypes[type].label + ' ' + Math.floor(Math.random() * 100)); // Default name
      setStep(2);
  }

  const PartCalculatorComponent = selectedType ? partTypes[selectedType].component : null;

  return (
    <div className="space-y-4">
      {step === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(partTypes).map(([key, { label, icon: Icon }]) => (
            <Button
              key={key}
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => handleSelectType(key as PartType)}
            >
              <Icon />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      )}
      {step === 2 && selectedType && (
        <>
         <Button variant="outline" onClick={() => { setStep(1); setSelectedType(null); }} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Part Selection
         </Button>
          <div className="space-y-2">
            <Label htmlFor="partName">Part Name</Label>
            <Input 
                id="partName"
                placeholder={`e.g., Ground Floor Columns, Main Staircase`}
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
            />
          </div>
          {PartCalculatorComponent && <PartCalculatorComponent onSave={handleSave} />}
        </>
      )}
    </div>
  );
};
