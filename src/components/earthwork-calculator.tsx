
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, PlusCircle, Save, Bot, Loader2, Clock, Users } from 'lucide-react';
import { estimateEarthwork } from '@/ai/flows/earthwork-estimation';
import { useToast } from '@/hooks/use-toast';

type Inputs = {
  length: number;
  width: number;
  depth: number;
};

const EarthworkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shovel">
      <path d="M2 22v-5l5-5"/>
      <path d="M9.5 14.5 16 21"/>
      <path d="m18 13-1.3-1.3a2.5 2.5 0 0 0-3.5-3.5L2 22"/>
      <path d="m13.5 6.5 7-7"/>
    </svg>
);


type EarthworkCalculatorProps = {
  onSave: (data: any) => void;
  initialData?: any;
  isEditing?: boolean;
};

export default function EarthworkCalculator({ onSave, initialData, isEditing = false }: EarthworkCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    length: 50,
    width: 40,
    depth: 5,
  });
  const [estimation, setEstimation] = useState<{time: string, manpower: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setInputs(initialData);
      if (initialData.estimation) {
        setEstimation(initialData.estimation);
      }
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleEstimation = async () => {
    setLoading(true);
    setEstimation(null);
    try {
        const volume = inputs.length * inputs.width * inputs.depth;
        const result = await estimateEarthwork({ volume });
        setEstimation(result);
    } catch(e) {
        console.error(e);
        toast({
            title: 'Estimation Failed',
            description: 'Could not get AI estimation. Please try again.',
            variant: 'destructive'
        })
    } finally {
        setLoading(false);
    }
  }
  
  const handleSave = () => {
    onSave({ ...inputs, estimation });
  }

  const volume = inputs.length * inputs.width * inputs.depth;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <EarthworkIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Earthwork Calculation</CardTitle>
        </div>
        <CardDescription>Calculate earthwork volume and get an AI-powered estimation for time and manpower.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="length" className="text-xs text-muted-foreground">Length</Label>
                <div className="relative">
                    <Input id="length" name="length" type="number" value={inputs.length} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
                <div className="relative">
                    <Input id="width" name="width" type="number" value={inputs.width} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="depth" className="text-xs text-muted-foreground">Depth</Label>
                <div className="relative">
                    <Input id="depth" name="depth" type="number" value={inputs.depth} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
        </div>
        <Card className="bg-muted/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Calculated Volume</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-primary">{volume.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">cft</span></p>
            </CardContent>
        </Card>
        <div className="space-y-4">
            <Button onClick={handleEstimation} disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin mr-2"/> : <Bot className="mr-2"/>}
                {loading ? 'Estimating...' : 'Get AI Time & Manpower Estimate'}
            </Button>
            {estimation && (
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estimated Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estimation.time}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Required Manpower</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estimation.manpower}</div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
        <Button onClick={handleSave}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          {isEditing ? 'Save Changes' : 'Add to Project'}
        </Button>
      </CardFooter>
    </Card>
  );
}
