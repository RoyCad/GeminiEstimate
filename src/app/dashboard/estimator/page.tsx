
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';

import PileMaterialCalculator from '@/components/pile-material-calculator';
import PileCapMaterialCalculator from '@/components/pile-cap-material-calculator';
import ColumnMaterialCalculator from '@/components/column-material-calculator';
import BeamMaterialCalculator from '@/components/beam-material-calculator';
import GradeBeamMaterialCalculator from '@/components/grade-beam-material-calculator';
import SlabMaterialCalculator from '@/components/slab-material-calculator';
import MatFoundationMaterialCalculator from '@/components/mat-foundation-material-calculator';
import CombinedFootingMaterialCalculator from '@/components/combined-footing-material-calculator';
import ShortColumnMaterialCalculator from '@/components/short-column-material-calculator';
import RetainingWallMaterialCalculator from '@/components/retaining-wall-material-calculator';
import StaircaseMaterialCalculator from '@/components/staircase-material-calculator';
import BrickworkCalculator from '@/components/brickwork-calculator';
import CcCastingCalculator from '@/components/cc-casting-calculator';
import EarthworkCalculator from '@/components/earthwork-calculator';
import StandaloneCalculator from '@/components/standalone-calculator';
import { Calculator, Cylinder, BoxSelect, Archive, GitMerge, AlignHorizontalSpaceBetween, LayoutGrid, Webhook, ToyBrick, Shovel, Sparkles, Building2 } from 'lucide-react';
import StandaloneFootingCalculator from '@/components/standalone-footing-calculator';

const StairsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-stairs">
        <path d="M4 18h4v-4h4v-4h4V6"/>
        <path d="m7 14 3-3 4-4 4-4"/>
    </svg>
);


type PartType =
  | 'pile'
  | 'pile-cap'
  | 'column'
  | 'beam'
  | 'grade-beam'
  | 'slab'
  | 'mat-foundation'
  | 'standalone-footing'
  | 'combined-footing'
  | 'short-column'
  | 'retaining-wall'
  | 'staircase'
  | 'brickwork'
  | 'cc-casting'
  | 'earthwork';

type PartDefinition = {
  label: string;
  component: React.FC<any>;
  icon: React.FC<any>;
};

const partTypes: Record<PartType, PartDefinition> = {
  earthwork: { label: 'Earthwork', component: EarthworkCalculator, icon: Shovel },
  'cc-casting': { label: 'CC / Soling', component: CcCastingCalculator, icon: Sparkles },
  pile: { label: 'Pile', component: PileMaterialCalculator, icon: Cylinder },
  'pile-cap': { label: 'Pile Cap', component: PileCapMaterialCalculator, icon: BoxSelect },
  'standalone-footing': { label: 'Standalone Footing', component: StandaloneFootingCalculator, icon: Archive },
  'mat-foundation': { label: 'Mat Foundation', component: MatFoundationMaterialCalculator, icon: Archive },
  'combined-footing': { label: 'Combined Footing', component: CombinedFootingMaterialCalculator, icon: GitMerge },
  'short-column': { label: 'Short Column', component: ShortColumnMaterialCalculator, icon: Building2 },
  'grade-beam': { label: 'Grade Beam', component: GradeBeamMaterialCalculator, icon: AlignHorizontalSpaceBetween },
  column: { label: 'Column', component: ColumnMaterialCalculator, icon: Building2 },
  beam: { label: 'Floor Beam', component: BeamMaterialCalculator, icon: AlignHorizontalSpaceBetween },
  slab: { label: 'Slab', component: SlabMaterialCalculator, icon: LayoutGrid },
  staircase: { label: 'Staircase', component: StaircaseMaterialCalculator, icon: StairsIcon },
  'retaining-wall': {
    label: 'Retaining Wall',
    component: RetainingWallMaterialCalculator,
    icon: Webhook,
  },
  brickwork: { label: 'Brickwork', component: BrickworkCalculator, icon: ToyBrick },
};

export default function EstimatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Quick Estimator</h1>
          <p className="text-muted-foreground">
            Select a structural part to perform a quick calculation.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {Object.entries(partTypes).map(
          ([key, { label, component: CalculatorComponent, icon: Icon }]) => (
            <Dialog key={key}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-primary transition-colors group aspect-square glass-card">
                  <CardContent className="flex flex-col items-center justify-center p-1 gap-1 h-full">
                    <div className="relative w-12 h-12 flex items-center justify-center text-primary/80 group-hover:text-primary transition-colors">
                      <Icon className="w-10 h-10" strokeWidth={1.5}/>
                    </div>
                    <span className="text-[10px] font-semibold text-center group-hover:text-primary transition-colors">
                      {label}
                    </span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quick Estimate: {label}</DialogTitle>
                </DialogHeader>
                <StandaloneCalculator
                  partKey={key as PartType}
                  CalculatorComponent={CalculatorComponent}
                />
              </DialogContent>
            </Dialog>
          )
        )}
      </div>
    </div>
  );
}

    
