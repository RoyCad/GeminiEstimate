
'use client';

import React, { useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StructuralPart, ProjectData, MaterialPrices } from '@/components/project-detail-client';
import { calculateAllPartsMaterials, aggregateMaterials, MaterialQuantities } from '@/lib/material-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { BarChart, Layers, Droplets, Brick, Building2, Printer, Shovel, FileText } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

type FullProjectReportProps = {
  project: ProjectData;
};

const FullProjectReport: React.FC<FullProjectReportProps> = ({ project }) => {
  const { parts = [], projectName, clientName, materialPrices } = project;
  const reportRef = useRef<HTMLDivElement>(null);
  
  const allPartsMaterials = calculateAllPartsMaterials(parts);
  const totalMaterials = aggregateMaterials(allPartsMaterials);

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printSection = printContent.innerHTML;
      document.body.innerHTML = `
        <html>
          <head>
            <title>Project Report - ${projectName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
              body { font-family: 'PT Sans', sans-serif; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 10px; }
              th, td { border: 1px solid #e5e7eb; padding: 6px; text-align: left; }
              th { background-color: #f3f4f6; }
              .no-print { display: none; }
              .report-header { text-align: center; margin-bottom: 1.5rem; }
              .card { border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 1rem; break-inside: avoid; }
              .card-header { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
              .card-title { font-size: 1.125rem; font-weight: 600; }
              .card-content { padding: 1rem; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .gap-2 { gap: 0.5rem; }
              .font-semibold { font-weight: 600; }
              .font-bold { font-weight: 700; }
              .text-primary { color: #1d4ed8; }
              .mb-2 { margin-bottom: 0.5rem; }
              .text-sm { font-size: 0.875rem; }
              .text-xs { font-size: 0.75rem; }
              .text-lg { font-size: 1.125rem; }
              .text-right { text-align: right; }
              .mt-2 { margin-top: 0.5rem; }
              .space-y-4 > * + * { margin-top: 1rem; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .gap-4 { gap: 1rem; }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .mb-4 { margin-bottom: 1rem; }
              .text-2xl { font-size: 1.5rem; }
              .text-muted-foreground { color: #6b7280; }
              .bg-muted-50 { background-color: #f9fafb; }
              .pt-4 { padding-top: 1rem; }
              .w-5 { width: 1.25rem; }
              .h-5 { height: 1.25rem; }
              .w-4 { width: 1rem; }
              .h-4 { height: 1rem; }
              h1, h2, h3, h4 { margin: 0; }
              svg { display: inline-block; vertical-align: middle; }
            </style>
          </head>
          <body>${printSection}</body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // To re-initialize scripts
    }
  };

  const calculateCost = (materials: MaterialQuantities, prices: MaterialPrices) => {
    let totalCost = 0;
    totalCost += (materials['Cement (bags)'] as number || 0) * (prices['Cement (bags)'] || 0);
    totalCost += (materials['Sand (cft)'] as number || 0) * (prices['Sand (cft)'] || 0);
    totalCost += (materials['Aggregate (cft)'] as number || 0) * (prices['Aggregate (cft)'] || 0);
    totalCost += (materials['Total Bricks (Nos.)'] as number || 0) * (prices['Total Bricks (Nos.)'] || 0);
    
    const steelWeight = Object.entries(materials)
      .filter(([key]) => key.startsWith('Steel'))
      .reduce((sum, [, value]) => sum + (value as number), 0);

    totalCost += steelWeight * (prices['Steel (kg)'] || 0);
    return totalCost;
  };
  
  const totalCost = calculateCost(totalMaterials, materialPrices);

  const renderMaterialTable = (materials: MaterialQuantities, title: string, icon: React.ReactNode, prices: MaterialPrices) => {
      const filteredMaterials = Object.entries(materials);
      if (filteredMaterials.length === 0) return null;
      const totalPartCost = calculateCost(materials, prices);
      
      return (
        <Card className="mb-4" key={title}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle>
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
                        {filteredMaterials.map(([key, value]) => (
                            <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell className="text-right font-semibold">{typeof value === 'number' ? value.toFixed(2) : value}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                            <TableCell>Estimated Cost for this Part</TableCell>
                            <TableCell className="text-right text-primary">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalPartCost)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )
  }

  const grandTotalRender = (materials: MaterialQuantities, title: string, icon: React.ReactNode) => {
      const filteredMaterials = Object.entries(materials);
      if (filteredMaterials.length === 0) return null;
      return (
        <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">{icon}{title}</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMaterials.map(([key, value]) => (
                        <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell className="text-right font-semibold">{typeof value === 'number' ? value.toFixed(2) : value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      )
  }
  
  const earthworkMaterials = Object.fromEntries(Object.entries(totalMaterials).filter(([key]) => key.includes('Earthwork') || key.includes('Time') || key.includes('Manpower')));
  const concreteMaterials = Object.fromEntries(Object.entries(totalMaterials).filter(([key]) => ['Cement (bags)', 'Sand (cft)', 'Aggregate (cft)'].includes(key)));
  const brickworkMaterials = Object.fromEntries(Object.entries(totalMaterials).filter(([key]) => key.includes('Bricks')));
  const steelMaterials = Object.fromEntries(Object.entries(totalMaterials).filter(([key]) => key.startsWith('Steel')));


  return (
    <div>
        <div ref={reportRef} className="printable-area p-4">
            <div className="report-header mb-8 text-center">
                <Image src="/my_logo.png" alt="Logo" width={200} height={50} className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Project Estimation Report</h1>
            </div>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-semibold">Project Name:</span> {projectName}</div>
                        <div><span className="font-semibold">Client Name:</span> {clientName}</div>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2"><FileText /> Material Details by Part</CardTitle>
                  <CardDescription>Individual material calculation for each structural part of the project.</CardDescription>
                </CardHeader>
                <CardContent>
                    {allPartsMaterials.map(({part, materials}) => 
                        renderMaterialTable(materials, part.name, <Building2 className="w-4 h-4 text-primary" />, materialPrices)
                    )}
                </CardContent>
            </Card>

            <Card className="bg-muted/50 mt-6">
                <CardHeader>
                  <CardTitle className="text-xl">Project Grand Total</CardTitle>
                  <CardDescription>A summary of all required materials and the total estimated cost for the project.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="pt-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><BarChart className="w-5 h-5 text-primary" /> Total Estimated Cost</h4>
                        <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-bold text-base">Total Estimated Material Cost</TableCell>
                                <TableCell className="text-right font-bold text-lg text-primary">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(totalCost)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                        <p className="text-xs text-muted-foreground mt-2">Note: This is an estimated cost based on the material prices you provided. It does not include labor, transport, or other overheads.</p>
                    </div>
                    {grandTotalRender(earthworkMaterials, "Earthwork Summary", <Shovel className="w-4 h-4 text-primary" />)}
                    {grandTotalRender(concreteMaterials, "Total Concrete Materials", <Droplets className="w-4 h-4 text-primary" />)}
                    {grandTotalRender(brickworkMaterials, "Total Brickwork Materials", <Brick className="w-4 h-4 text-primary" />)}
                    {grandTotalRender(steelMaterials, "Total Reinforcement Steel", <Layers className="w-4 h-4 text-primary" />)}
                </CardContent>
            </Card>
        </div>
        <div className="mt-6 text-right no-print">
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Save as PDF
            </Button>
        </div>
    </div>
  );
};

export default FullProjectReport;

    