
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hash, Layers, ChevronsUpDown, BarChart, Ruler, PlusCircle, Save, SquareStack } from 'lucide-react';
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

type ColumnMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
  projectData?: { numberOfStories?: number };
};

export default function ColumnMaterialCalculator({ onSave, initialData, isEditing = false, projectData }: ColumnMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    totalColumns: 25,
    columnWidth: 12,
    columnDepth: 15,
    columnHeight: 10,
    numberOfFloors: projectData?.numberOfStories || 5,
    mixRatio: "1:1.5:3",
    mainBarDia: 20,
    mainBarCount: 8,
    tieBarDia: 10,
    tieSpacing: 6,
    clearCover: 1.5,
    lappingLength: 3.5,
  });

  useEffect(() => {
    if (initialData) {
      setInputs(initialData);
    } else if (projectData?.numberOfStories) {
      setInputs(prev => ({ ...prev, numberOfFloors: projectData.numberOfStories || 5 }));
    }
  }, [initialData, projectData]);


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
            <SquareStack />
            <CardTitle>{isEditing ? "Edit" : "Add"} Column Calculation</CardTitle>
        </div>
        <CardDescription>Enter the details for this column group.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
              <Label htmlFor="totalColumns" className="flex items-center gap-2 text-muted-foreground text-xs"><Hash className="w-4 h-4" />Number of Columns</Label>
              <div className="relative">
                  <Input id="totalColumns" name="totalColumns" type="number" value={inputs.totalColumns} onChange={handleInputChange} placeholder="Nos." className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="columnWidth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Column Width</Label>
              <div className="relative">
                  <Input id="columnWidth" name="columnWidth" type="number" value={inputs.columnWidth} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="columnDepth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Column Depth</Label>
              <div className="relative">
                  <Input id="columnDepth" name="columnDepth" type="number" value={inputs.columnDepth} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
              </div>
          </div>
          <div className="space-y-2">
              <Label htmlFor="columnHeight" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Column Height (per floor)</Label>
              <div className="relative">
                  <Input id="columnHeight" name="columnHeight" type="number" value={inputs.columnHeight} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
              </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="numberOfFloors" className="flex items-center gap-2 text-muted-foreground text-xs"><Layers className="w-4 h-4" />Number of Floors (G+)</Label>
              <div className="relative">
                  <Input id="numberOfFloors" name="numberOfFloors" type="number" value={inputs.numberOfFloors} onChange={handleInputChange} readOnly={!!projectData?.numberOfStories} placeholder="Nos." className={`pr-12 ${projectData?.numberOfStories ? 'bg-muted' : ''}`}/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
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

    

    