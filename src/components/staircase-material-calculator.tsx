
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, ChevronsUpDown, BarChart, Layers, PlusCircle, Save, Hash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const standardBarSizes = [8, 10, 12, 16, 20, 22, 25, 28, 32];
const standardMixRatios = ["1:1.5:3", "1:2:4", "1:2.5:5", "1:3:6"];

const StairsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stairs">
        <path d="M4 18h4v-4h4v-4h4V6"/>
        <path d="m7 14 3-3 4-4 4-4"/>
    </svg>
);


type Inputs = {
  numberOfFlights: number;
  flightLength: number;
  flightWidth: number;
  flightHeight: number;
  waistSlabThickness: number;
  riserHeight: number;
  treadWidth: number;
  landingLength: number;
  landingWidth: number;
  landingSlabThickness: number;
  mixRatio: string;
  mainBarDia: number;
  mainBarSpacing: number;
  distBarDia: number;
  distBarSpacing: number;
  clearCover: number;
};

type StaircaseMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function StaircaseMaterialCalculator({ onSave, initialData, isEditing = false }: StaircaseMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    numberOfFlights: 2,
    flightLength: 10,
    flightWidth: 4,
    flightHeight: 5,
    waistSlabThickness: 6,
    riserHeight: 6,
    treadWidth: 10,
    landingLength: 8,
    landingWidth: 4,
    landingSlabThickness: 6,
    mixRatio: "1:2:4",
    mainBarDia: 12,
    mainBarSpacing: 5,
    distBarDia: 10,
    distBarSpacing: 7,
    clearCover: 1,
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
            <StairsIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Staircase Calculation</CardTitle>
        </div>
        <CardDescription>Enter the details for the staircase.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dimensions */}
             <div className="space-y-2">
                <Label htmlFor="numberOfFlights" className="flex items-center gap-2 text-muted-foreground text-xs"><Hash className="w-4 h-4" />Number of Flights</Label>
                <div className="relative">
                    <Input id="numberOfFlights" name="numberOfFlights" type="number" value={inputs.numberOfFlights} onChange={handleInputChange} placeholder="Nos." className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="flightLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Flight Horizontal Length</Label>
                <div className="relative">
                    <Input id="flightLength" name="flightLength" type="number" value={inputs.flightLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="flightWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Flight Width</Label>
                <div className="relative">
                    <Input id="flightWidth" name="flightWidth" type="number" value={inputs.flightWidth} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="flightHeight" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Flight Vertical Height</Label>
                <div className="relative">
                    <Input id="flightHeight" name="flightHeight" type="number" value={inputs.flightHeight} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="waistSlabThickness" className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Waist Slab Thickness</Label>
                <div className="relative">
                    <Input id="waistSlabThickness" name="waistSlabThickness" type="number" value={inputs.waistSlabThickness} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="riserHeight" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Riser Height</Label>
                <div className="relative">
                    <Input id="riserHeight" name="riserHeight" type="number" value={inputs.riserHeight} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="treadWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Tread Width</Label>
                <div className="relative">
                    <Input id="treadWidth" name="treadWidth" type="number" value={inputs.treadWidth} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="landingLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Landing Length</Label>
                <div className="relative">
                    <Input id="landingLength" name="landingLength" type="number" value={inputs.landingLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="landingWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Landing Width</Label>
                <div className="relative">
                    <Input id="landingWidth" name="landingWidth" type="number" value={inputs.landingWidth} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="landingSlabThickness" className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Landing Slab Thickness</Label>
                <div className="relative">
                    <Input id="landingSlabThickness" name="landingSlabThickness" type="number" value={inputs.landingSlabThickness} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
           
            <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="clearCover" className="flex items-center gap-2 text-muted-foreground text-xs"><Layers className="w-4 h-4" />Clear Cover</Label>
                    <div className="relative">
                        <Input id="clearCover" name="clearCover" type="number" value={inputs.clearCover} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor='mixRatio' className="flex items-center gap-2 text-muted-foreground text-xs"><BarChart className="w-4 h-4" />Concrete Mix Ratio</Label>
                    <Select onValueChange={handleSelectChange('mixRatio')} value={inputs.mixRatio}>
                        <SelectTrigger id="mixRatio"><SelectValue placeholder="Select Mix Ratio" /></SelectTrigger>
                        <SelectContent>{standardMixRatios.map(ratio => <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reinforcement */}
            <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Main Bar (Waist Slab)</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('mainBarDia')} value={String(inputs.mainBarDia)}>
                        <SelectTrigger><SelectValue placeholder="Dia (mm)" /></SelectTrigger>
                        <SelectContent>{standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="mainBarSpacing" type="number" value={inputs.mainBarSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">in</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Distribution Bar (Waist Slab)</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('distBarDia')} value={String(inputs.distBarDia)}>
                        <SelectTrigger><SelectValue placeholder="Dia (mm)" /></SelectTrigger>
                        <SelectContent>{standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="distBarSpacing" type="number" value={inputs.distBarSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12"/>
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

    