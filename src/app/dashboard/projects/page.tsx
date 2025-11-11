

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
import { MoreHorizontal, PlusCircle, FileDown, Trash2, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { collection, query, orderBy, getDocs, doc, deleteDoc, where, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateAllPartsMaterials, aggregateMaterials } from '@/lib/material-calculator';
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
import { useToast } from '@/hooks/use-toast';
import type { ProjectData } from '@/app/dashboard/projects/[id]/page';
import { useFirebase } from '@/firebase';
import PrintReportWrapper from '@/components/print-report-wrapper';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';


type Project = ProjectData & {
    createdAt: { seconds: number; nanoseconds: number };
    status: string;
};

const statusVariant = {
    'In Progress': 'default',
    'Completed': 'secondary',
    'Planning': 'outline',
} as const;

export default function ProjectsPage() {
    const { firestore } = useFirebase();
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const { toast } = useToast();
    const [userRole, setUserRole] = useState<'Admin' | 'Client' | null>(null);

    useEffect(() => {
        if (user) {
            const ADMIN_UID = 'uxOcEuUsEcQAR8fOCqLl7LZBubv1';
            setUserRole(user.uid === ADMIN_UID ? 'Admin' : 'Client');
        }
    }, [user]);

    useEffect(() => {
        if (!firestore || !user || !userRole) return;
        
        const fetchProjects = async () => {
            setLoading(true);
            try {
                let projectsQuery;
                const projectsRef = collection(firestore, `projects`);

                if (userRole === 'Admin') {
                    projectsQuery = query(projectsRef, orderBy('createdAt', 'desc'));
                } else {
                    projectsQuery = query(projectsRef, where("userId", "==", user.uid));
                }

                const querySnapshot = await getDocs(projectsQuery);
                let projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                
                if(userRole === 'Client') {
                    projectsData.sort((a,b) => b.createdAt.seconds - a.createdAt.seconds);
                }

                setProjects(projectsData);

            } catch (error) {
                console.error("Error fetching projects: ", error);
                toast({
                    title: 'Error Fetching Projects',
                    description: 'Could not load project list. Check console for details.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [firestore, user, toast, userRole]);

    const handleDeleteProject = async () => {
        if (!projectToDelete || !firestore) return;
        try {
            await deleteDoc(doc(firestore, `projects`, projectToDelete.id));
            setProjects(projects.filter(p => p.id !== projectToDelete.id));
            toast({
                title: "Project Deleted",
                description: `"${projectToDelete.projectName}" has been successfully deleted.`,
            });
        } catch (error) {
            console.error("Error deleting project: ", error);
            toast({
                title: "Error",
                description: "Failed to delete the project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProjectToDelete(null);
        }
    };

    const getEstimatedCost = (project: Project) => {
        if (!project.parts || project.parts.length === 0 || !project.materialPrices) {
            return 0;
        }
        const allMaterials = calculateAllPartsMaterials(project.parts);
        const totalMaterials = aggregateMaterials(allMaterials);
        
        const { materialPrices } = project;

        let totalCost = 0;
        totalCost += (totalMaterials['Cement (bags)'] as number || 0) * (materialPrices['Cement (bags)'] || 0);
        totalCost += (totalMaterials['Sand (cft)'] as number || 0) * (materialPrices['Sand (cft)'] || 0);
        totalCost += (totalMaterials['Aggregate (cft)'] as number || 0) * (materialPrices['Aggregate (cft)'] || 0);
        totalCost += (totalMaterials['Total Bricks (Nos.)'] as number || 0) * (materialPrices['Total Bricks (Nos.)'] || 0);
        
        const steelWeight = Object.entries(totalMaterials)
            .filter(([key]) => key.startsWith('Steel'))
            .reduce((sum, [, value]) => sum + (value as number), 0);

        totalCost += steelWeight * (materialPrices['Steel (kg)'] || 0);
        return totalCost;
    };
    
    const ProjectsReport = (
      <Table>
          <TableHeader>
              <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Estimated Cost</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {projects.map((project) => (
                  <TableRow key={project.id}>
                      <TableCell className="font-mono text-xs">{project.projectNumber}</TableCell>
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>
                          <Badge variant={statusVariant[project.status as keyof typeof statusVariant] || 'default'}>
                              {project.status || 'Planning'}
                          </Badge>
                      </TableCell>
                      <TableCell>{project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(getEstimatedCost(project))}
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
      </Table>
    );


  return (
    <>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Projects</h1>
                    <p className="text-muted-foreground">Manage all your estimation projects.</p>
                </div>
                <div className="flex items-center gap-2">
                    {userRole === 'Admin' && (
                        <Button asChild>
                            <Link href="/dashboard/projects/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Project
                            </Link>
                        </Button>
                    )}
                    <PrintReportWrapper
                      trigger={<Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print Report</Button>}
                      title="Projects Report"
                    >
                      {ProjectsReport}
                    </PrintReportWrapper>
                </div>
            </div>
        
        <Card className={cn(userRole === 'Client' ? 'neumorphic-card' : 'glass-card')}>
            <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>A list of all projects in your account.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Estimated Cost</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading && projects.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : projects.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No projects found. {userRole === 'Admin' && <Link href="/dashboard/projects/create" className="text-primary underline">Create one now</Link>}
                        </TableCell>
                    </TableRow>
                ) : (
                    projects.map((project) => (
                    <TableRow key={project.id}>
                    <TableCell className="font-mono text-xs">{project.projectNumber}</TableCell>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>
                        <Badge variant={statusVariant[project.status as keyof typeof statusVariant] || 'default'}>
                        {project.status || 'Planning'}
                        </Badge>
                    </TableCell>
                    <TableCell>{project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(getEstimatedCost(project))}
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            {userRole === 'Admin' && (
                                <>
                                    <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/projects/${project.id}`}>Edit Project</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Download Report
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setProjectToDelete(project)} className="text-destructive focus:bg-destructive/30">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </div>
        <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    <span className="font-semibold">"{projectToDelete?.projectName}"</span> and all its data.
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
    </>
  );
}
