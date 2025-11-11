
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, Hash, Layers, ChevronsUpDown, BarChart, PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const standardBarSizes = [8, 10, 12, 16, 20, 22, 25, 28, 32];
const standardMixRatios = ["1:1.5:3", "1:2:4", "1:2.5:5", "1:3:6"];

type Inputs = {
  totalBeams: number;
  beamLength: number;
  beamWidth: number;
  beamDepth: number;
  mixRatio: string;
  mainTopDia: number;
  mainTopCount: number;
  mainBottomDia: number;
  mainBottomCount: number;
  extraTopDia: number;
  extraTopCount: number;
  stirrupDia: number;
  stirrupSpacing: number;
  clearCover: number;
  supportWidth: number; 
};

const GradeBeamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-align-horizontal-space-between">
        <rect width="6" height="14" x="3" y="5" rx="2" />
        <rect width="6" height="10" x="15" y="7" rx="2" />
        <path d="M3 2h18" />
        <path d="M3 22h18" />
    </svg>
)

type GradeBeamMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function GradeBeamMaterialCalculator({ onSave, initialData, isEditing = false }: GradeBeamMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    totalBeams: 40,
    beamLength: 18,
    beamWidth: 10,
    beamDepth: 18,
    mixRatio: "1:1.5:3",
    mainTopDia: 16,
    mainTopCount: 2,
    mainBottomDia: 20,
    mainBottomCount: 3,
    extraTopDia: 16,
    extraTopCount: 2,
    stirrupDia: 10,
    stirrupSpacing: 5,
    clearCover: 1.5,
    supportWidth: 1.25,
  });

  useEffect(() => {
    if (initialData) {
      setInputs(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleSelectChange = (name: keyof Inputs) => (value: string) => {
    const isNumber = ['mainTopDia', 'mainBottomDia', 'extraTopDia', 'stirrupDia'].includes(name);
    setInputs((prev) => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <GradeBeamIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Grade Beam Calculation</CardTitle>
        </div>
        <CardDescription>Enter the details for this grade beam group. Full depth will be used for calculation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="totalBeams" className="flex items-center gap-2 text-muted-foreground text-xs"><Hash className="w-4 h-4" />Number of Grade Beams</Label>
                 <div className="relative">
                    <Input id="totalBeams" name="totalBeams" type="number" value={inputs.totalBeams} onChange={handleInputChange} placeholder="Nos." className="pr-12" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="beamLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Grade Beam Length (Clear Span)</Label>
                 <div className="relative">
                    <Input id="beamLength" name="beamLength" type="number" value={inputs.beamLength} onChange={handleInputChange} placeholder="feet" className="pr-12" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="beamWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Grade Beam Width</Label>
                 <div className="relative">
                    <Input id="beamWidth" name="beamWidth" type="number" value={inputs.beamWidth} onChange={handleInputChange} placeholder="inches" className="pr-12" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="beamDepth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Grade Beam Depth</Label>
                 <div className="relative">
                    <Input id="beamDepth" name="beamDepth" type="number" value={inputs.beamDepth} onChange={handleInputChange} placeholder="inches" className="pr-12" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
            
             <div className="space-y-2">
                <Label htmlFor="supportWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Support Width (for Dev. L)</Label>
                 <div className="relative">
                    <Input id="supportWidth" name="supportWidth" type="number" value={inputs.supportWidth} onChange={handleInputChange} placeholder="feet" className="pr-12" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="clearCover" className="flex items-center gap-2 text-muted-foreground text-xs"><Layers className="w-4 h-4" />Clear Cover</Label>
                    <div className="relative">
                        <Input id="clearCover" name="clearCover" type="number" value={inputs.clearCover} onChange={handleInputChange} placeholder="inches" className="pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mixRatio" className="flex items-center gap-2 text-muted-foreground text-xs"><BarChart className="w-4 h-4" />Concrete Mix Ratio</Label>
                    <Select onValueChange={handleSelectChange('mixRatio')} value={inputs.mixRatio}>
                        <SelectTrigger id="mixRatio">
                            <SelectValue placeholder="Select Mix Ratio" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardMixRatios.map(ratio => (
                                <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Main Straight Top Bar</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Select onValueChange={handleSelectChange('mainTopDia')} value={String(inputs.mainTopDia)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Dia (mm)" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="mainTopCount" type="number" value={inputs.mainTopCount} onChange={handleInputChange} placeholder="Nos." className="pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                    </div>
                </div>
            </div>
             <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Main Straight Bottom Bar</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('mainBottomDia')} value={String(inputs.mainBottomDia)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Dia (mm)" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="mainBottomCount" type="number" value={inputs.mainBottomCount} onChange={handleInputChange} placeholder="Nos." className="pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                    </div>
                </div>
            </div>
             <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Extra Top Bar (at supports)</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('extraTopDia')} value={String(inputs.extraTopDia)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Dia (mm)" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="extraTopCount" type="number" value={inputs.extraTopCount} onChange={handleInputChange} placeholder="Nos." className="pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                    </div>
                </div>
            </div>
            
             <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Stirrup (Ring) Bar</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('stirrupDia')} value={String(inputs.stirrupDia)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Dia (mm)" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="stirrupSpacing" type="number" value={inputs.stirrupSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">in</span>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
        <Button onClick={() => onSave(inputs)}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          {isEditing ? 'Save Changes' : 'Add to Project'}
        </Button>
      </CardFooter>
    </Card>
  );
}

    