
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const standardMixRatios = ["1:1.5:3", "1:2:4", "1:2.5:5", "1:3:6"];

type Inputs = {
  length: number;
  width: number;
  thickness: number;
  mixRatio: string;
};

const CcCastingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
        <path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 16l1.9-4.8 4.8-1.9-4.8-1.9L12 3z"/>
        <path d="M5 21v-3.5c0-1.4 1.1-2.5 2.5-2.5h1.1c.5 0 1-.2 1.4-.6l.8-1.1c.4-.4.4-1 0-1.4l-.8-1.1c-.4-.4-.9-.6-1.4-.6H7.5C6.1 10 5 8.9 5 7.5V4"/>
        <path d="M19 21v-3.5c0-1.4-1.1-2.5-2.5-2.5h-1.1c-.5 0-1-.2-1.4-.6l.8-1.1c.4-.4.4-1 0-1.4l-.8-1.1c.4-.4.9-.6 1.4-.6h1.1c1.4 0 2.5-1.1 2.5-2.5V4"/>
    </svg>
);


type CcCastingCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function CcCastingCalculator({ onSave, initialData, isEditing = false }: CcCastingCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    length: 100,
    width: 1,
    thickness: 3,
    mixRatio: "1:2:4",
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
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <CcCastingIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} CC Casting Calculation</CardTitle>
        </div>
        <CardDescription>Calculate materials for Cement Concrete Casting (e.g., for finishing, soling, or lean concrete work).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="length" className="text-xs text-muted-foreground">Total Length</Label>
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
                <Label htmlFor="thickness" className="text-xs text-muted-foreground">Thickness</Label>
                <div className="relative">
                    <Input id="thickness" name="thickness" type="number" value={inputs.thickness} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                </div>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="mixRatio" className="text-xs text-muted-foreground">Concrete Mix Ratio</Label>
             <Select onValueChange={handleSelectChange('mixRatio')} value={inputs.mixRatio}>
                <SelectTrigger id="mixRatio">
                    <SelectValue placeholder="Select Ratio" />
                </SelectTrigger>
                <SelectContent>
                    {standardMixRatios.map(ratio => <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>)}
                </SelectContent>
            </Select>
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
