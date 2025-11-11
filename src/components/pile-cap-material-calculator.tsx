
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
  totalCaps: number;
  length: number;
  width: number;
  depth: number;
  mixRatio: string;
  mainBarDia: number;
  mainBarSpacing: number;
  clearCover: number;
};

const PileCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box-select">
        <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/>
        <path d="M9 3v18"/>
        <path d="M15 3v18"/>
        <path d="M3 9h18"/>
        <path d="M3 15h18"/>
    </svg>
)

type PileCapMaterialCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function PileCapMaterialCalculator({ onSave, initialData, isEditing = false }: PileCapMaterialCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    totalCaps: 1,
    length: 8,
    width: 8,
    depth: 30,
    mixRatio: "1:2:4",
    mainBarDia: 16,
    mainBarSpacing: 6,
    clearCover: 3,
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
    const isNumber = name === 'mainBarDia';
    setInputs((prev) => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <PileCapIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Pile Cap Calculation</CardTitle>
        </div>
        <CardDescription>Enter the details for this pile cap group.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="totalCaps" className="flex items-center gap-2 text-muted-foreground text-xs"><Hash className="w-4 h-4" />Number of Pile Caps</Label>
                <div className="relative">
                  <Input id="totalCaps" name="totalCaps" type="number" value={inputs.totalCaps} onChange={handleInputChange} placeholder="Nos." className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">Nos.</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="length" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Length</Label>
                <div className="relative">
                  <Input id="length" name="length" type="number" value={inputs.length} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="width" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Width</Label>
                <div className="relative">
                  <Input id="width" name="width" type="number" value={inputs.width} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="depth" className="flex items-center gap-2 text-muted-foreground text-xs"><ChevronsUpDown className="w-4 h-4" />Depth/Thickness</Label>
                <div className="relative">
                  <Input id="depth" name="depth" type="number" value={inputs.depth} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
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
                <Label className="flex items-center gap-2 text-muted-foreground text-xs"><Ruler className="w-4 h-4" />Main Bar Reinforcement (Both Ways, Top & Bottom)</Label>
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
                        <Input name="mainBarSpacing" type="number" value={inputs.mainBarSpacing} onChange={handleInputChange} placeholder="Spacing (in)" className="pr-12" />
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
    

    
