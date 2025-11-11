
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, loading, className }: { title: string, value: string | number, icon: React.FC<any>, loading: boolean, className?: string }) => (
    <Card className={cn('glass-card', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-3xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

export default StatCard;
