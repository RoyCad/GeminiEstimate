
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PaymentsPage() {

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Payments &amp; Expenses</h1>
                <p className="text-muted-foreground">
                    Financial transactions are now managed within each project.
                </p>
            </div>
        </div>
    
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Central View Removed</CardTitle>
                <CardDescription>
                    To better organize information, please go to a specific project from the <Link href="/dashboard/projects" className="text-primary underline">Projects page</Link> to view and manage financial transactions for that project.
                </CardDescription>
            </CardHeader>
        </Card>
    </div>
  );
}
