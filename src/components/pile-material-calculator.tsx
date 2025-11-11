
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash, Layers, ChevronsUpDown, BarChart, Ruler, PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const standardBarSizes = [8, 10, 12, 16, 20, 22, 25, 28, 32];
const standardMixRatios = ["1:1.5:3", "1:2:4", "1:2.5:5", "1:3:6"];

type Inputs = {
  totalPiles: number;
  pileDiameter: number;
  pileLength: number;
  mixRatio: string;
  mainBarDia: number;
  mainBarCount: number;
  tieBarDia: number;
  tieSpacing: number;
  clearCover: number;
  lappingLength: number;
};

const PileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cylinder">
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 5v14a8 3 0 0 0 16 0V5"/>
  </svg>
)

type PileMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function PileMaterialCalculator({ onSave, initialData, isEditing = false }: PileMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    totalPiles: 1,
    pileDiameter: 20,
    pileLength: 60,
    mixRatio: "1:1.5:3",
    mainBarDia: 20,
    mainBarCount: 7,
    tieBarDia: 10,
    tieSpacing: 4,
    clearCover: 3,
    lappingLength: 3.5,
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
    const isNumber = ['mainBarDia', 'tieBarDia'].includes(name);
    setInputs((prev) => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <PileIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Pile Calculation</CardTitle>
        </div>
        <CardDescription>Enter the details for this pile group.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="totalPiles" className="flex items-center gap-2 text-muted-foreground text-xs"><Hash className="w-4 h-4" />Number of Piles</Label>
                <div className="relative">
                  <Input id="totalPiles" name="totalPiles" type="number" value={inputs.totalPiles} onChange={handleInputChange} placeholder="Nos." className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pileDiameter" className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Pile Diameter</Label>
                <div className="relative">
                  <Input id="pileDiameter" name="pileDiameter" type="number" value={inputs.pileDiameter} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="pileLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Pile Length</Label>
                <div className="relative">
                  <Input id="pileLength" name="pileLength" type="number" value={inputs.pileLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="lappingLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Lapping Length</Label>
                <div className="relative">
                  <Input id="lappingLength" name="lappingLength" type="number" value={inputs.lappingLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
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
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Main Bar Reinforcement</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('mainBarDia')} value={String(inputs.mainBarDia)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Dia (mm)" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="mainBarCount" type="number" value={inputs.mainBarCount} onChange={handleInputChange} placeholder="Nos." className="pr-12" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                    </div>
                </div>
            </div>
             <div className="space-y-2 md:col-span-3">
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Spiral/Tie Bar Reinforcement</Label>
                <div className="grid grid-cols-2 gap-2">
                     <Select onValueChange={handleSelectChange('tieBarDia')} value={String(inputs.tieBarDia)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Dia (mm)" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardBarSizes.map(size => <SelectItem key={size} value={String(size)}>{size} mm</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Input name="tieSpacing" type="number" value={inputs.tieSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12" />
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

    
