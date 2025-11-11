
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StructuralPart } from '@/components/project-detail-client';
import { calculatePartMaterials } from '@/lib/material-calculator';

type MaterialReportProps = {
  part: StructuralPart;
};

const MaterialReport: React.FC<MaterialReportProps> = ({ part }) => {
  const report = calculatePartMaterials(part);

  if (!report) {
    return <p>Could not generate a report for this part.</p>;
  }
  
  const concreteMaterials = Object.entries(report).filter(([key]) => ['Cement (bags)', 'Sand (cft)', 'Aggregate (cft)'].includes(key));
  const brickMaterials = Object.entries(report).filter(([key]) => key.includes('Bricks'));
  const steelMaterials = Object.entries(report).filter(([key]) => key.startsWith('Steel'));


  return (
    <div className="space-y-4">
      {concreteMaterials.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Concrete Materials</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concreteMaterials.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
       {brickMaterials.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Brickwork Materials</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brickMaterials.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
      {steelMaterials.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Reinforcement Steel</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bar Type</TableHead>
                <TableHead className="text-right">Total Weight (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steelMaterials.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key.replace(' (kg)','')}</TableCell>
                    <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MaterialReport;
