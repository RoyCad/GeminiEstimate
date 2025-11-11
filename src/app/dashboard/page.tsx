
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
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

type Project = {
    id: string;
    clientName: string;
    projectName: string;
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(3));
                const querySnapshot = await getDocs(q);
                const projectsData: Project[] = [];
                querySnapshot.forEach((doc) => {
                    projectsData.push({ id: doc.id, ...doc.data() } as Project);
                });
                setProjects(projectsData);
            } catch (err) {
                console.error("Error fetching projects: ", err);
                setError("Failed to load recent projects.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchProjects();
    }, [user]);

  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's a quick overview of your projects and market data.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                A summary of your most recent estimation projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                        </div>
                    ))}
                 </div>
              ) : error ? (
                 <div className="text-center text-red-500 py-8">{error}</div>
              ) : projects.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <Briefcase className="mx-auto h-12 w-12" />
                    <p className="mt-4 text-sm">No projects found. <Link href="/dashboard/projects/create" className="text-primary underline">Create your first project</Link> to get started.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                    {projects.map((project) => (
                    <li key={project.id} className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-muted">
                        <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                        <p className="font-medium">{project.clientName}</p>
                        <p className="text-sm text-muted-foreground">{project.projectName}</p>
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
        </div>
      </div>
    </div>
  );
}
