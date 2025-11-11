
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Briefcase,
  User,
  Calculator,
  Loader2,
  Users,
  Package,
  DollarSign,
  ArrowDown,
  FilePlus,
  ArrowRight,
  Cylinder,
  BoxSelect,
  Archive,
  GitMerge,
  AlignHorizontalSpaceBetween,
  LayoutGrid,
  Stairs,
  Webhook,
  ToyBrick,
  Shovel,
  Sparkles,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc, collectionGroup, Timestamp, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';

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
import StandaloneCalculator from '@/components/standalone-calculator';
import StatCard from '@/components/stat-card';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import StandaloneFootingCalculator from '@/components/standalone-footing-calculator';
import { DailyAttendance, PaymentTransaction } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRouter } from 'next/navigation';

type PartType =
  | 'pile'
  | 'pile-cap'
  | 'column'
  | 'beam'
  | 'grade-beam'
  | 'slab'
  | 'mat-foundation'
  | 'standalone-footing'
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

const partTypes: Record<PartType, PartDefinition> = {
  'earthwork': { label: 'Earthwork', component: EarthworkCalculator, icon: Shovel },
  'cc-casting': { label: 'CC / Soling', component: CcCastingCalculator, icon: Sparkles },
  'pile': { label: 'Pile', component: PileMaterialCalculator, icon: Cylinder },
  'pile-cap': { label: 'Pile Cap', component: PileCapMaterialCalculator, icon: BoxSelect },
  'standalone-footing': { label: 'Standalone Footing', component: StandaloneFootingCalculator, icon: Archive },
  'mat-foundation': { label: 'Mat Foundation', component: MatFoundationMaterialCalculator, icon: Archive },
  'combined-footing': { label: 'Combined Footing', component: CombinedFootingMaterialCalculator, icon: GitMerge },
  'short-column': { label: 'Short Column', component: ShortColumnMaterialCalculator, icon: Building2 },
  'grade-beam': { label: 'Grade Beam', component: GradeBeamMaterialCalculator, icon: AlignHorizontalSpaceBetween },
  'column': { label: 'Column', component: ColumnMaterialCalculator, icon: Building2 },
  'beam': { label: 'Floor Beam', component: BeamMaterialCalculator, icon: AlignHorizontalSpaceBetween },
  'slab': { label: 'Slab', component: SlabMaterialCalculator, icon: LayoutGrid },
  'staircase': { label: 'Staircase', component: StaircaseMaterialCalculator, icon: Stairs },
  'retaining-wall': { label: 'Retaining Wall', component: RetainingWallMaterialCalculator, icon: Webhook },
  'brickwork': { label: 'Brickwork', component: BrickworkCalculator, icon: ToyBrick },
};


type Project = {
    id: string;
    clientName: string;
    projectName: string;
    createdAt: { seconds: number; nanoseconds: number };
};

export default function DashboardPage() {
    const { user, loading: authLoading, sessionRole } = useAuth();
    const { firestore } = useFirebase();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ projects: 0, totalSpent: 0, laborers: 0, totalBill: 0, totalPaid: 0, balanceDue: 0 });
    const [loadingStats, setLoadingStats] = useState(true);


    useEffect(() => {
        if (authLoading || !sessionRole || !user) return;
    
        const fetchAdminData = async () => {
            setLoadingData(true);
            setLoadingStats(true);
            try {
                const projectsQuery = query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'), limit(5));
                const projectsSnapshot = await getDocs(projectsQuery);
                const projectsData: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setProjects(projectsData);
    
                const projectsCountSnapshot = await getDocs(collection(firestore, 'projects'));
                let totalSpent = 0;
                const transactionsQuery = query(collectionGroup(firestore, 'transactions'), where('type', '==', 'Expense'));
                const transactionsSnapshot = await getDocs(transactionsQuery);
                transactionsSnapshot.forEach(doc => {
                    totalSpent += doc.data().amount;
                });
    
                setStats({ projects: projectsCountSnapshot.size, totalSpent, laborers: 0, totalBill: 0, totalPaid: 0, balanceDue: 0 });
            } catch (err: any) {
                console.error("Error fetching admin data: ", err);
                if (err.code === 'permission-denied') {
                    setError("You don't have permission to view this data.");
                } else {
                    setError("Failed to load admin data.");
                }
            } finally {
                setLoadingData(false);
                setLoadingStats(false);
            }
        };
    
        const fetchClientData = () => {
            setLoadingData(true);
            setLoadingStats(true);
    
            const projectsQuery = query(collection(firestore, 'projects'), where("userId", "==", user.uid));
    
            const unsubscribeProjects = onSnapshot(projectsQuery, (projectsSnapshot) => {
                const projectsData: Project[] = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                projectsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
                setProjects(projectsData);
    
                const projectIds = projectsData.map(p => p.id);
    
                if (projectIds.length > 0) {
                    
                    const unsubscribes: (() => void)[] = [];

                    const attendanceQuery = query(collectionGroup(firestore, 'dailyAttendances'), where('projectId', 'in', projectIds));
                    const unsubAttendances = onSnapshot(attendanceQuery, (attendanceSnapshot) => {
                         const projectAttendances: DailyAttendance[] = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyAttendance));
                         setAttendances(projectAttendances.sort((a:any, b:any) => b.date.seconds - a.date.seconds).slice(0, 5));
                        
                        let laborersToday = 0;
                        let totalLaborBill = 0;
                        const todayStart = startOfDay(new Date());

                        projectAttendances.forEach(att => {
                            totalLaborBill += att.numberOfLaborers * att.wagePerLaborer;
                            const attDate = (att.date as any).toDate ? (att.date as any).toDate() : new Date(att.date);
                            if (startOfDay(attDate).getTime() === todayStart.getTime()) {
                                laborersToday += att.numberOfLaborers;
                            }
                        });

                        setStats(prev => ({
                            ...prev,
                            laborers: laborersToday,
                            totalBill: totalLaborBill,
                        }));
                    });
                    unsubscribes.push(unsubAttendances);

                    const paymentsQuery = query(collectionGroup(firestore, 'transactions'), where('projectId', 'in', projectIds));
                     const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
                        const allTransactions = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

                        const clientPayments = allTransactions
                            .filter(t => t.type === 'Payment')
                            .map(t => {
                                const project = projectsData.find(p => p.id === t.projectId);
                                return { ...t, projectName: project?.projectName || 'N/A' } as PaymentTransaction;
                            })
                            .sort((a:any, b:any) => b.date.seconds - a.date.seconds)
                            .slice(0, 5);
                        setPayments(clientPayments);

                        const totalLaborPaid = allTransactions
                            .filter(t => t.category === 'Labor' && t.type === 'Expense')
                            .reduce((sum, doc) => sum + doc.amount, 0);

                        setStats(prev => ({
                            ...prev,
                            totalPaid: totalLaborPaid,
                            balanceDue: prev.totalBill - totalLaborPaid
                        }));
                    }, (err) => {
                        console.error("Error fetching transactions:", err);
                        setError("Failed to load transaction data.");
                    });
                    unsubscribes.push(unsubPayments);

                    setLoadingData(false);
                    setLoadingStats(false);
                    
                    return () => {
                        unsubscribes.forEach(unsub => unsub());
                    };
                } else {
                    setProjects([]);
                    setAttendances([]);
                    setPayments([]);
                    setStats({ projects: 0, totalSpent: 0, laborers: 0, totalBill: 0, totalPaid: 0, balanceDue: 0 });
                    setLoadingData(false);
                    setLoadingStats(false);
                }
            }, (err) => {
                console.error("Error fetching client data: ", err);
                setError("Failed to load project data.");
                setLoadingData(false);
                setLoadingStats(false);
            });
            
            return () => unsubscribeProjects();
        };

        if (sessionRole === 'Admin') {
            fetchAdminData();
        } else if (sessionRole === 'Client') {
            fetchClientData();
        }
    }, [user, firestore, sessionRole, authLoading]);

  const isLoading = authLoading || loadingData;
  
   const formatDate = (date: any) => {
        if (!date) return 'N/A';
        if (date.seconds) { // Firestore timestamp
            return format(new Date(date.seconds * 1000), 'PPP');
        }
        if (date instanceof Date) {
            return format(date, 'PPP');
        }
        return 'Invalid Date';
    }

  const getWelcomeName = (): string => {
    return user?.displayName || 'User';
  };

  if (isLoading && !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  const AdminDashboard = () => (
     <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/projects/create" className="group">
                <Card className="glass-card h-full flex flex-col items-center justify-center text-center p-6 hover:border-primary transition-colors">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <FilePlus className="h-8 w-8 text-primary"/>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Start New Project</h3>
                    <p className="text-sm text-muted-foreground">Create a new project and client</p>
                </Card>
            </Link>
             <Link href="/dashboard/materials" className="group">
                <Card className="glass-card h-full flex flex-col items-center justify-center text-center p-6 hover:border-primary transition-colors">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Package className="h-8 w-8 text-primary"/>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Material Management</h3>
                    <p className="text-sm text-muted-foreground">Manage central material stock</p>
                </Card>
            </Link>
             <Link href="/dashboard/projects" className="group">
                <Card className="glass-card h-full flex flex-col items-center justify-center text-center p-6 hover:border-primary transition-colors">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Briefcase className="h-8 w-8 text-primary"/>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">Project Management</h3>
                    <p className="text-sm text-muted-foreground">View and manage all projects</p>
                </Card>
            </Link>
        </div>
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Calculator className="text-primary h-6 w-6"/>
                <h2 className="text-2xl font-bold tracking-tight">Quick Estimator</h2>
            </div>
            <p className="text-muted-foreground mb-6">
            Select a structural part for a quick material and cost calculation.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {Object.entries(partTypes).map(([key, { label, component: CalculatorComponent, icon: Icon }]) => (
                    <Dialog key={key}>
                        <DialogTrigger asChild>
                           <Card className="cursor-pointer hover:border-primary transition-colors group aspect-square glass-card">
                                <CardContent className="flex flex-col items-center justify-center p-1 gap-1 h-full">
                                    <div className="relative w-12 h-12 flex items-center justify-center text-primary/80 group-hover:text-primary transition-colors">
                                        <Icon className="w-10 h-10" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-semibold text-center group-hover:text-primary transition-colors">{label}</span>
                                </CardContent>
                            </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Quick Estimate: {label}</DialogTitle>
                            </DialogHeader>
                            <StandaloneCalculator partKey={key as PartType} CalculatorComponent={CalculatorComponent} />
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
      </div>
  );

  const ClientDashboard = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Laborers on Site Today" value={stats.laborers} icon={Users} loading={loadingStats} />
            <StatCard title="Total Labor Bill" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(stats.totalBill)} icon={DollarSign} loading={loadingStats} />
            <StatCard title="Total Labor Paid" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(stats.totalPaid)} icon={DollarSign} loading={loadingStats} />
            <StatCard title="Balance Due" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT' }).format(stats.balanceDue)} icon={DollarSign} loading={loadingStats} className={stats.balanceDue > 0 ? 'border-destructive' : 'border-green-500'} />
        </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className='glass-card'>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingData && projects.length === 0 ? (
                     <div className="text-center text-muted-foreground py-8">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                     </div>
                  ) : error ? (
                     <div className="text-center text-red-500 py-8">{error}</div>
                  ) : projects.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <Briefcase className="mx-auto h-12 w-12" />
                        <p className="mt-4 text-sm">
                          No projects assigned yet.
                        </p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                        {projects.map((project) => (
                        <li key={project.id} className="flex items-center gap-4">
                            <div className="p-2.5 rounded-full bg-muted">
                              <Briefcase className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{project.projectName}</p>
                              <p className="text-sm text-muted-foreground">{project.clientName}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/projects/${project.id}`}>View</Link>
                            </Button>
                        </li>
                        ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            <Card className='glass-card'>
                <CardHeader>
                    <CardTitle>Recent Labor Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingData && attendances.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
                    ) : attendances.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8"><Users className="mx-auto h-12 w-12" /><p className="mt-4 text-sm">No recent attendance records.</p></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className='text-center'>Laborers</TableHead>
                                    <TableHead className='text-right'>Total Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {attendances.map(att => (
                                    <TableRow key={att.id}>
                                        <TableCell>{formatDate(att.date)}</TableCell>
                                        <TableCell className='text-center'>{att.numberOfLaborers}</TableCell>
                                        <TableCell className='text-right font-medium'>{new Intl.NumberFormat('en-IN').format(att.numberOfLaborers * att.wagePerLaborer)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
          </div>
    </div>
  );


  return (
    <div className="space-y-6">
      {sessionRole === 'Client' && (
        <div className='mb-8'>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {`Welcome, ${getWelcomeName()}!`}
          </h1>
          <p className="text-muted-foreground mt-1">
              {"Here's a quick overview of your projects on behalf of ROY Construction & Consultant."}
          </p>
        </div>
      )}

      {sessionRole === 'Admin' ? <AdminDashboard /> : <ClientDashboard />}
    </div>
  );
}

    

    