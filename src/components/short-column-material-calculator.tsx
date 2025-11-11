
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
  totalColumns: number;
  columnWidth: number;
  columnDepth: number;
  columnHeight: number;
  numberOfFloors: number;
  mixRatio: string;
  mainBarDia: number;
  mainBarCount: number;
  tieBarDia: number;
  tieSpacing: number;
  clearCover: number;
  lappingLength: number;
};

const ShortColumnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pilaster">
        <rect width="18" height="12" x="3" y="9" rx="2"/>
        <path d="M8 22V10"/>
        <path d="M16 22V10"/>
        <path d="M8 6V4"/>
        <path d="M16 6V4"/>
    </svg>
)

type ShortColumnMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function ShortColumnMaterialCalculator({ onSave, initialData, isEditing = false }: ShortColumnMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    totalColumns: 25,
    columnWidth: 12,
    columnDepth: 15,
    columnHeight: 4, // Typical short column height
    numberOfFloors: 1, // Always 1 for short columns
    mixRatio: "1:1.5:3",
    mainBarDia: 20,
    mainBarCount: 8,
    tieBarDia: 10,
    tieSpacing: 6,
    clearCover: 1.5,
    lappingLength: 0, // No lapping for short columns
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
            <ShortColumnIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Short Column Calculation</CardTitle>
        </div>
        <CardDescription>Enter details for columns from foundation/grade beam to ground floor.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
              <Label htmlFor="totalColumns" className="flex items-center gap-2 text-muted-foreground text-xs"><Hash className="w-4 h-4" />Number of Short Columns</Label>
              <div className="relative">
                  <Input id="totalColumns" name="totalColumns" type="number" value={inputs.totalColumns} onChange={handleInputChange} placeholder="Nos." className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="columnWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Short Column Width</Label>
              <div className="relative">
                  <Input id="columnWidth" name="columnWidth" type="number" value={inputs.columnWidth} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="columnDepth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Short Column Depth</Label>
              <div className="relative">
                  <Input id="columnDepth" name="columnDepth" type="number" value={inputs.columnDepth} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="columnHeight" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Short Column Height</Label>
              <div className="relative">
                  <Input id="columnHeight" name="columnHeight" type="number" value={inputs.columnHeight} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
              </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="lappingLength" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Lapping Length (from footing)</Label>
              <div className="relative">
                  <Input id="lappingLength" name="lappingLength" type="number" value={inputs.lappingLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
              </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="numberOfFloors" className="flex items-center gap-2 text-muted-foreground text-xs"><Layers className="w-4 h-4" />Number of Floors</Label>
              <div className="relative">
                <Input id="numberOfFloors" name="numberOfFloors" type="number" value={inputs.numberOfFloors} readOnly className="pr-12 bg-muted" />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
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
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Tie Bar Reinforcement</Label>
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
    

    
