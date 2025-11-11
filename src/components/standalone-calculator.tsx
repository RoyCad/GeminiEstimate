'use client';
import { useState } from 'react';
import { calculatePartMaterials } from '@/lib/material-calculator';
import type { MaterialQuantities } from '@/lib/material-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

const materialPrices: { [key: string]: number } = {
    'Cement (bags)': 550,
    'Sand (cft)': 50,
    'Aggregate (cft)': 130,
    'Steel (kg)': 95,
    'Total Bricks (Nos.)': 12,
};

const calculateCost = (materials: MaterialQuantities, prices: { [key: string]: number }) => {
    let totalCost = 0;
    
    // Concrete & Brickwork materials
    const directCostItems = ['Cement (bags)', 'Sand (cft)', 'Aggregate (cft)', 'Total Bricks (Nos.)'];
    for (const item of directCostItems) {
        totalCost += (materials[item] as number || 0) * (prices[item] || 0);
    }
    
    // Steel cost
    const steelWeight = Object.entries(materials)
      .filter(([key]) => key.startsWith('Steel'))
      .reduce((sum, [, value]) => sum + (value as number), 0);

    totalCost += steelWeight * (prices['Steel (kg)'] || 0);

    // Cost from bricks for aggregate
    if (materials['Bricks for Aggregate (Nos.)']) {
         totalCost += (materials['Bricks for Aggregate (Nos.)'] as number) * prices['Total Bricks (Nos.)'];
    }

    return totalCost;
  };


export default function StandaloneCalculator({ partKey, CalculatorComponent }: { partKey: string, CalculatorComponent: React.FC<any> }) {
  const [report, setReport] = useState<MaterialQuantities | null>(null);

  const handleSave = (data: any) => {
    const mockPart = { id: 'standalone', name: 'Standalone Calculation', type: partKey, data };
    const materials = calculatePartMaterials(mockPart);
    setReport(materials);
  };
  
  const cost = report ? calculateCost(report, materialPrices) : 0;

  return (
    <div className="space-y-6">
      <CalculatorComponent onSave={handleSave} />

      {report && (
        <>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Calculation Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(report).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                    </TableCell>
                                </TableRow>
                            ))}
                             <TableRow className="font-bold bg-muted/50 text-base">
                                <TableCell>Estimated Total Cost</TableCell>
                                <TableCell className="text-right text-primary">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(cost)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                     <p className="text-xs text-muted-foreground mt-2">Note: This is an estimated cost based on default material prices. Prices may vary.</p>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
