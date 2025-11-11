
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, BarChart, PlusCircle, Save, Percent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const standardMortarRatios = ["1:3", "1:4", "1:5", "1:6", "1:8"];

type Inputs = {
  totalWallLength: number;
  wallHeight: number;
  wallThickness: number;
  numberOfDoors: number;
  doorHeight: number;
  doorWidth: number;
  numberOfWindows: number;
  windowHeight: number;
  windowWidth: number;
  mortarRatio: string;
  bricksPerCft: number;
  brickWastage: number;
  mortarWastage: number;
};

const BrickIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bricks">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M12 9h10"/>
        <path d="M3 9h4"/>
        <path d="M3 15h10"/>
        <path d="M17 15h4"/>
        <path d="M9 3v18"/>
    </svg>
);


type BrickworkCalculatorProps = {
  onSave: (data: Inputs) => void;
  initialData?: Inputs;
  isEditing?: boolean;
};

export default function BrickworkCalculator({ onSave, initialData, isEditing = false }: BrickworkCalculatorProps) {
  const [inputs, setInputs] = useState<Inputs>(initialData || {
    totalWallLength: 500,
    wallHeight: 10,
    wallThickness: 5,
    numberOfDoors: 4,
    doorHeight: 7,
    doorWidth: 3.5,
    numberOfWindows: 6,
    windowHeight: 4,
    windowWidth: 5,
    mortarRatio: "1:6",
    bricksPerCft: 12.5,
    brickWastage: 5,
    mortarWastage: 3,
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
            <BrickIcon />
            <CardTitle>{isEditing ? "Edit" : "Add"} Brickwork Calculation</CardTitle>
        </div>
        <CardDescription>Calculate bricks, sand, and cement for walls, including openings and wastage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wall Dimensions */}
        <div className="space-y-4">
            <Label className="font-semibold">Wall Dimensions</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="totalWallLength" className="text-xs text-muted-foreground">Total Length</Label>
                    <div className="relative">
                        <Input id="totalWallLength" name="totalWallLength" type="number" value={inputs.totalWallLength} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wallHeight" className="text-xs text-muted-foreground">Height</Label>
                    <div className="relative">
                        <Input id="wallHeight" name="wallHeight" type="number" value={inputs.wallHeight} onChange={handleInputChange} placeholder="feet" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">feet</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wallThickness" className="text-xs text-muted-foreground">Thickness</Label>
                    <div className="relative">
                        <Input id="wallThickness" name="wallThickness" type="number" value={inputs.wallThickness} onChange={handleInputChange} placeholder="inches" className="pr-12"/>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground">inches</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Openings */}
        <div className="space-y-4">
            <Label className="font-semibold">Door Openings</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="numberOfDoors" className="text-xs text-muted-foreground">Number of Doors</Label>
                    <Input id="numberOfDoors" name="numberOfDoors" type="number" value={inputs.numberOfDoors} onChange={handleInputChange} placeholder="Nos." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="doorHeight" className="text-xs text-muted-foreground">Height</Label>
                    <Input id="doorHeight" name="doorHeight" type="number" value={inputs.doorHeight} onChange={handleInputChange} placeholder="feet" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="doorWidth" className="text-xs text-muted-foreground">Width</Label>
                    <Input id="doorWidth" name="doorWidth" type="number" value={inputs.doorWidth} onChange={handleInputChange} placeholder="feet" />
                </div>
            </div>
        </div>

         <div className="space-y-4">
            <Label className="font-semibold">Window Openings</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="numberOfWindows" className="text-xs text-muted-foreground">Number of Windows</Label>
                    <Input id="numberOfWindows" name="numberOfWindows" type="number" value={inputs.numberOfWindows} onChange={handleInputChange} placeholder="Nos." />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="windowHeight" className="text-xs text-muted-foreground">Height</Label>
                    <Input id="windowHeight" name="windowHeight" type="number" value={inputs.windowHeight} onChange={handleInputChange} placeholder="feet" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="windowWidth" className="text-xs text-muted-foreground">Width</Label>
                    <Input id="windowWidth" name="windowWidth" type="number" value={inputs.windowWidth} onChange={handleInputChange} placeholder="feet" />
                </div>
            </div>
        </div>

        {/* Material Properties */}
        <div className="space-y-4">
             <Label className="font-semibold">Material & Mix Properties</Label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mortarRatio" className="text-xs text-muted-foreground">Mortar Mix Ratio</Label>
                     <Select onValueChange={handleSelectChange('mortarRatio')} value={inputs.mortarRatio}>
                        <SelectTrigger id="mortarRatio">
                            <SelectValue placeholder="Select Ratio" />
                        </SelectTrigger>
                        <SelectContent>
                            {standardMortarRatios.map(ratio => <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bricksPerCft" className="text-xs text-muted-foreground">Bricks per cft</Label>
                    <Input id="bricksPerCft" name="bricksPerCft" type="number" value={inputs.bricksPerCft} onChange={handleInputChange} placeholder="Nos." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="brickWastage" className="text-xs text-muted-foreground">Brick Wastage</Label>
                    <div className="relative">
                        <Input id="brickWastage" name="brickWastage" type="number" value={inputs.brickWastage} onChange={handleInputChange} placeholder="Percentage" className="pr-8"/>
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="mortarWastage" className="text-xs text-muted-foreground">Mortar Wastage</Label>
                    <div className="relative">
                        <Input id="mortarWastage" name="mortarWastage" type="number" value={inputs.mortarWastage} onChange={handleInputChange} placeholder="Percentage" className="pr-8"/>
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
