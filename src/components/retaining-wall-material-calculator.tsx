
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, ChevronsUpDown, BarChart, PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const standardBarSizes = [8, 10, 12, 16, 20, 22, 25, 28, 32];
const standardMixRatios = ["1:1.5:3", "1:2:4", "1:2.5:5", "1:3:6"];

type Inputs = {
  wallLength: number;
  wallHeight: number;
  stemThicknessTop: number;
  stemThicknessBottom: number;
  baseSlabWidth: number;
  baseSlabThickness: number;
  mixRatio: string;
  verticalBarDia: number;
  verticalBarSpacing: number;
  horizontalBarDia: number;
  horizontalBarSpacing: number;
  baseSlabDia: number;
  baseSlabSpacing: number;
};

const RetainingWallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-webhook">
        <path d="M18 16.99h-5v-1.1L22 7V4H2v3l9 8.89V17H6v3h12z"/>
    </svg>
)

type RetainingWallMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function RetainingWallMaterialCalculator({ onSave, initialData, isEditing = false }: RetainingWallMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    wallLength: 100,
    wallHeight: 12,
    stemThicknessTop: 8,
    stemThicknessBottom: 15,
    baseSlabWidth: 8,
    baseSlabThickness: 15,
    mixRatio: "1:1.5:3",
    verticalBarDia: 16,
    verticalBarSpacing: 6,
    horizontalBarDia: 12,
    horizontalBarSpacing: 8,
    baseSlabDia: 16,
    baseSlabSpacing: 7,
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
    const isNumber = name.includes('Dia');
    setInputs((prev) => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <RetainingWallIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Retaining Wall Calculation</CardTitle>
        </div>
        <CardDescription>Enter the details for the retaining wall (stem and base).</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dimensions */}
            <div className="space-y-2">
                <Label htmlFor="wallLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Wall Length</Label>
                <div className="relative">
                    <Input id="wallLength" name="wallLength" type="number" value={inputs.wallLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="wallHeight" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Wall Height</Label>
                <div className="relative">
                    <Input id="wallHeight" name="wallHeight" type="number" value={inputs.wallHeight} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="stemThicknessTop" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Stem Thickness (Top)</Label>
                <div className="relative">
                    <Input id="stemThicknessTop" name="stemThicknessTop" type="number" value={inputs.stemThicknessTop} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="stemThicknessBottom" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Stem Thickness (Bottom)</Label>
                <div className="relative">
                    <Input id="stemThicknessBottom" name="stemThicknessBottom" type="number" value={inputs.stemThicknessBottom} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="baseSlabWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Base Slab Width</Label>
                <div className="relative">
                    <Input id="baseSlabWidth" name="baseSlabWidth" type="number" value={inputs.baseSlabWidth} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="baseSlabThickness" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Base Slab Thickness</Label>
                <div className="relative">
                    <Input id="baseSlabThickness" name="baseSlabThickness" type="number" value={inputs.baseSlabThickness} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>

            {/* Mix Ratio */}
            <div className="space-y-2 md:col-span-3">
                <Label htmlFor='mixRatio' className="flex items-center gap-2 text-muted-foreground text-xs"><BarChart className="w-4 h-4" />Concrete Mix Ratio</Label>
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

            {/* Reinforcement */}
            <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Vertical Bar (Stem)</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('verticalBarDia')} value={String(inputs.verticalBarDia)}>
                        <SelectTrigger><SelectValue placeholder="Dia (mm)" /></SelectTrigger>
                        <SelectContent>{standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="verticalBarSpacing" type="number" value={inputs.verticalBarSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">in</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Horizontal Bar (Stem)</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('horizontalBarDia')} value={String(inputs.horizontalBarDia)}>
                        <SelectTrigger><SelectValue placeholder="Dia (mm)" /></SelectTrigger>
                        <SelectContent>{standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="horizontalBarSpacing" type="number" value={inputs.horizontalBarSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">in</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Base Slab Reinforcement</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('baseSlabDia')} value={String(inputs.baseSlabDia)}>
                        <SelectTrigger><SelectValue placeholder="Dia (mm)" /></SelectTrigger>
                        <SelectContent>{standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="baseSlabSpacing" type="number" value={inputs.baseSlabSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12"/>
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

    