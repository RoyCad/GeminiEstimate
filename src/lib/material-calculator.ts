
import type { StructuralPart } from '@/components/project-detail-client';

export type MaterialQuantities = { [key: string]: number | string };

const unitWeight = (dia: number) => (dia * dia) / 533; // kg per feet
const BRICKS_PER_CFT_AGGREGATE = 10; // Number of bricks to produce 1 cft of aggregate (khoa)

export const calculatePartMaterials = (part: StructuralPart): MaterialQuantities | null => {
  const { type, data } = part;
  // mixRatio might not exist for all types, e.g. brickwork
  const mixRatioString = data.mixRatio || data.mortarRatio || '';
  
  if (!mixRatioString && type !== 'earthwork' && type !== 'brickwork') {
      return {};
  }
  
  const ratioParts = mixRatioString.split(':').map(Number);
  const [cementPart, sandPart, aggregatePart] = ratioParts;
  const sumOfRatio = ratioParts.reduce((a: number, b: number) => a + b, 0);

  let wetVolume = 0;
  let steel: MaterialQuantities = {};

  switch (type) {
    case 'pile': {
      const radius = data.pileDiameter / 2 / 12; // in feet
      wetVolume = Math.PI * radius * radius * data.pileLength * data.totalPiles;
      
      const totalMainBarLength = (data.pileLength + data.lappingLength) * data.mainBarCount * data.totalPiles;
      const mainBarWeight = totalMainBarLength * unitWeight(data.mainBarDia);
      
      const tieCircumference = (Math.PI * (data.pileDiameter - 2 * data.clearCover)) / 12; // in feet
      const numberOfTies = data.tieSpacing > 0 ? Math.floor((data.pileLength * 12) / data.tieSpacing) * data.totalPiles : 0;
      const totalTieLength = tieCircumference * numberOfTies;
      const tieBarWeight = totalTieLength * unitWeight(data.tieBarDia);

      steel[`Steel ${data.mainBarDia}mm (kg)`] = (steel[`Steel ${data.mainBarDia}mm (kg)`] || 0) as number + mainBarWeight;
      steel[`Steel ${data.tieBarDia}mm (kg)`] = (steel[`Steel ${data.tieBarDia}mm (kg)`] || 0) as number + tieBarWeight;
      break;
    }
    case 'pile-cap': {
      wetVolume = (data.length * data.width * (data.depth / 12)) * data.totalCaps;
      
      const barsAlongLength = data.mainBarSpacing > 0 ? Math.floor((data.width * 12) / data.mainBarSpacing) + 1 : 0;
      const barsAlongWidth = data.mainBarSpacing > 0 ? Math.floor((data.length * 12) / data.mainBarSpacing) + 1 : 0;
      // Top and bottom mesh
      const totalBarLength = (barsAlongLength * data.length + barsAlongWidth * data.width) * 2 * data.totalCaps;
      const totalBarWeight = totalBarLength * unitWeight(data.mainBarDia);

      steel[`Steel ${data.mainBarDia}mm (kg)`] = (steel[`Steel ${data.mainBarDia}mm (kg)`] || 0) as number + totalBarWeight;
      break;
    }
    case 'column': {
      wetVolume = (data.columnWidth / 12) * (data.columnDepth / 12) * data.columnHeight * data.numberOfFloors * data.totalColumns;
      
      const totalHeightPerColumn = data.columnHeight * data.numberOfFloors;
      const totalLappingLength = data.lappingLength * (data.numberOfFloors > 1 ? data.numberOfFloors - 1 : 0);
      const totalMainBarLength = (totalHeightPerColumn + totalLappingLength) * data.mainBarCount * data.totalColumns;
      const totalMainBarWeight = totalMainBarLength * unitWeight(data.mainBarDia);

      const tieHookLength = 2 * 10 * (data.tieBarDia / (25.4 * 12)); // 2 * 10d hook in feet
      const tieCuttingLength = (2 * ((data.columnWidth/12) - 2 * (data.clearCover/12)) + 2 * ((data.columnDepth/12) - 2 * (data.clearCover/12))) + tieHookLength;
      const numberOfTies = data.tieSpacing > 0 ? (Math.floor((data.columnHeight * 12) / data.tieSpacing)) * data.numberOfFloors * data.totalColumns : 0;
      const totalTieBarWeight = tieCuttingLength * numberOfTies * unitWeight(data.tieBarDia);
      
      steel[`Steel ${data.mainBarDia}mm (kg)`] = (steel[`Steel ${data.mainBarDia}mm (kg)`] || 0) as number + totalMainBarWeight;
      steel[`Steel ${data.tieBarDia}mm (kg)`] = (steel[`Steel ${data.tieBarDia}mm (kg)`] || 0) as number + totalTieBarWeight;
      break;
    }
    case 'short-column': {
      wetVolume = (data.columnWidth / 12) * (data.columnDepth / 12) * data.columnHeight * data.totalColumns;
      
      const totalMainBarLength = (data.columnHeight + data.lappingLength) * data.mainBarCount * data.totalColumns;
      const totalMainBarWeight = totalMainBarLength * unitWeight(data.mainBarDia);

      const tieHookLength = 2 * 10 * (data.tieBarDia / (25.4 * 12)); // 2 * 10d hook in feet
      const tieCuttingLength = (2 * ((data.columnWidth/12) - 2 * (data.clearCover/12)) + 2 * ((data.columnDepth/12) - 2 * (data.clearCover/12))) + tieHookLength;
      const numberOfTies = data.tieSpacing > 0 ? Math.floor((data.columnHeight * 12) / data.tieSpacing) * data.totalColumns : 0;
      const totalTieBarWeight = tieCuttingLength * numberOfTies * unitWeight(data.tieBarDia);
      
      steel[`Steel ${data.mainBarDia}mm (kg)`] = (steel[`Steel ${data.mainBarDia}mm (kg)`] || 0) as number + totalMainBarWeight;
      steel[`Steel ${data.tieBarDia}mm (kg)`] = (steel[`Steel ${data.tieBarDia}mm (kg)`] || 0) as number + totalTieBarWeight;
      break;
    }
    case 'beam':
    case 'grade-beam': {
      wetVolume = (data.beamWidth / 12) * (data.beamDepth / 12) * data.beamLength * data.totalBeams;
      const devLength = 2 * 0.5 * data.supportWidth;

      const mainTopLength = (data.beamLength + devLength) * data.mainTopCount * data.totalBeams;
      const mainBottomLength = (data.beamLength + devLength) * data.mainBottomCount * data.totalBeams;
      const extraTopLength = (data.beamLength / 3) * data.extraTopCount * data.totalBeams;
      
      const mainTopWeight = mainTopLength * unitWeight(data.mainTopDia);
      const mainBottomWeight = mainBottomLength * unitWeight(data.mainBottomDia);
      const extraTopWeight = extraTopLength * unitWeight(data.extraTopDia);
      
      const stirrupHookLength = 2 * 10 * (data.stirrupDia / (25.4 * 12));
      const stirrupCuttingLength = (2 * ((data.beamWidth/12) - 2 * (data.clearCover/12)) + 2 * ((data.beamDepth/12) - 2 * (data.clearCover/12))) + stirrupHookLength;
      const numberOfStirrups = data.stirrupSpacing > 0 ? (Math.floor((data.beamLength * 12) / data.stirrupSpacing) + 1) * data.totalBeams : 0;
      const stirrupWeight = stirrupCuttingLength * numberOfStirrups * unitWeight(data.stirrupDia);
      
      steel[`Steel ${data.mainTopDia}mm (kg)`] = (steel[`Steel ${data.mainTopDia}mm (kg)`] || 0) as number + mainTopWeight;
      steel[`Steel ${data.mainBottomDia}mm (kg)`] = (steel[`Steel ${data.mainBottomDia}mm (kg)`] || 0) as number + mainBottomWeight;
      steel[`Steel ${data.extraTopDia}mm (kg)`] = (steel[`Steel ${data.extraTopDia}mm (kg)`] || 0) as number + extraTopWeight;
      steel[`Steel ${data.stirrupDia}mm (kg)`] = (steel[`Steel ${data.stirrupDia}mm (kg)`] || 0) as number + stirrupWeight;
      break;
    }
    case 'slab': {
        wetVolume = data.length * data.width * (data.thickness / 12);
        const mainBarsCount = data.mainBarSpacing > 0 ? Math.floor((data.width * 12) / data.mainBarSpacing) + 1 : 0;
        const distBarsCount = data.distBarSpacing > 0 ? Math.floor((data.length * 12) / data.distBarSpacing) + 1 : 0;

        const mainBarWeight = mainBarsCount * data.length * unitWeight(data.mainBarDia);
        const distBarWeight = distBarsCount * data.width * unitWeight(data.distBarDia);

        steel[`Steel ${data.mainBarDia}mm (kg)`] = (steel[`Steel ${data.mainBarDia}mm (kg)`] || 0) as number + mainBarWeight;
        steel[`Steel ${data.distBarDia}mm (kg)`] = (steel[`Steel ${data.distBarDia}mm (kg)`] || 0) as number + distBarWeight;
        break;
    }
    case 'mat-foundation': {
        wetVolume = data.length * data.width * (data.thickness / 12) * data.totalFoundations;
        
        const barsAlongLength = data.barSpacing > 0 ? Math.floor((data.width * 12) / data.barSpacing) + 1 : 0;
        const totalLengthAlong = barsAlongLength * data.length;

        const barsAlongWidth = data.barSpacing > 0 ? Math.floor((data.length * 12) / data.barSpacing) + 1 : 0;
        const totalWidthAlong = barsAlongWidth * data.width;
        
        // For top and bottom mesh, multiplied by number of foundations
        const totalReinforcementWeight = (totalLengthAlong + totalWidthAlong) * 2 * unitWeight(data.barDia) * data.totalFoundations;

        steel[`Steel ${data.barDia}mm (kg)`] = (steel[`Steel ${data.barDia}mm (kg)`] || 0) as number + totalReinforcementWeight;
        break;
    }
     case 'combined-footing': {
        wetVolume = data.length * data.width * (data.thickness / 12) * data.totalFootings;
        
        const barsAlongLength = data.barSpacing > 0 ? Math.floor((data.width * 12) / data.barSpacing) + 1 : 0;
        const totalLengthAlong = barsAlongLength * data.length;

        const barsAlongWidth = data.barSpacing > 0 ? Math.floor((data.length * 12) / data.barSpacing) + 1 : 0;
        const totalWidthAlong = barsAlongWidth * data.width;
        
        // For top and bottom mesh, multiplied by total number of footings
        const totalReinforcementWeight = (totalLengthAlong + totalWidthAlong) * 2 * unitWeight(data.barDia) * data.totalFootings;

        steel[`Steel ${data.barDia}mm (kg)`] = (steel[`Steel ${data.barDia}mm (kg)`] || 0) as number + totalReinforcementWeight;
        break;
    }
    case 'retaining-wall': {
        const avgStemThickness = ((data.stemThicknessTop + data.stemThicknessBottom) / 2) / 12;
        const stemVolume = data.wallLength * data.wallHeight * avgStemThickness;
        const baseVolume = data.wallLength * data.baseSlabWidth * (data.baseSlabThickness / 12);
        wetVolume = stemVolume + baseVolume;
        
        // Stem Reinforcement
        const numVerticalBars = data.verticalBarSpacing > 0 ? Math.floor((data.wallLength * 12) / data.verticalBarSpacing) + 1 : 0;
        const totalVerticalBarLength = numVerticalBars * data.wallHeight;
        const verticalBarWeight = totalVerticalBarLength * unitWeight(data.verticalBarDia);
        steel[`Steel ${data.verticalBarDia}mm (kg)`] = (steel[`Steel ${data.verticalBarDia}mm (kg)`] || 0) as number + verticalBarWeight;
        
        const numHorizontalBars = data.horizontalBarSpacing > 0 ? Math.floor((data.wallHeight * 12) / data.horizontalBarSpacing) + 1 : 0;
        const totalHorizontalBarLength = numHorizontalBars * data.wallLength;
        const horizontalBarWeight = totalHorizontalBarLength * unitWeight(data.horizontalBarDia);
        steel[`Steel ${data.horizontalBarDia}mm (kg)`] = (steel[`Steel ${data.horizontalBarDia}mm (kg)`] || 0) as number + horizontalBarWeight;
        
        // Base Slab Reinforcement (assuming one layer, both ways)
        const numBaseBarsX = data.baseSlabSpacing > 0 ? Math.floor((data.wallLength * 12) / data.baseSlabSpacing) + 1 : 0;
        const totalBaseBarLengthX = numBaseBarsX * data.baseSlabWidth;
        const numBaseBarsY = data.baseSlabSpacing > 0 ? Math.floor((data.baseSlabWidth * 12) / data.baseSlabSpacing) + 1 : 0;
        const totalBaseBarLengthY = numBaseBarsY * data.wallLength;
        
        const baseBarWeight = (totalBaseBarLengthX + totalBaseBarLengthY) * unitWeight(data.baseSlabDia);
        steel[`Steel ${data.baseSlabDia}mm (kg)`] = (steel[`Steel ${data.baseSlabDia}mm (kg)`] || 0) as number + baseBarWeight;
        break;
    }
    case 'staircase': {
      const inclinedLength = Math.sqrt(data.flightLength**2 + data.flightHeight**2);
      const waistSlabVolume = inclinedLength * data.flightWidth * (data.waistSlabThickness / 12);
      
      const numberOfSteps = data.riserHeight > 0 ? Math.floor((data.flightHeight * 12) / data.riserHeight) : 0;
      const volumeOfOneStep = 0.5 * (data.treadWidth / 12) * (data.riserHeight / 12) * data.flightWidth;
      const totalStepsVolume = volumeOfOneStep * numberOfSteps;
      
      const landingVolume = data.landingLength * data.landingWidth * (data.landingSlabThickness / 12);
      
      wetVolume = (waistSlabVolume + totalStepsVolume + landingVolume) * data.numberOfFlights;

      // Reinforcement for Waist Slab & Landing
      const mainBarsCount = data.mainBarSpacing > 0 ? Math.floor((data.flightWidth * 12) / data.mainBarSpacing) + 1 : 0;
      const distBarsCount = data.distBarSpacing > 0 ? Math.floor(((inclinedLength + data.landingLength) * 12) / data.distBarSpacing) + 1 : 0;
      const mainBarLength = inclinedLength + data.landingLength;
      
      const mainBarWeight = mainBarsCount * mainBarLength * unitWeight(data.mainBarDia);
      const distBarWeight = distBarsCount * data.flightWidth * unitWeight(data.distBarDia);

      const totalMainBarWeight = mainBarWeight * data.numberOfFlights;
      const totalDistBarWeight = distBarWeight * data.numberOfFlights;

      steel[`Steel ${data.mainBarDia}mm (kg)`] = (steel[`Steel ${data.mainBarDia}mm (kg)`] || 0) as number + totalMainBarWeight;
      steel[`Steel ${data.distBarDia}mm (kg)`] = (steel[`Steel ${data.distBarDia}mm (kg)`] || 0) as number + totalDistBarWeight;
      break;
    }
    case 'brickwork': {
      if (sumOfRatio === 0) return {};
      const grossWallArea = data.totalWallLength * data.wallHeight;
      const doorArea = data.numberOfDoors * data.doorHeight * data.doorWidth;
      const windowArea = data.numberOfWindows * data.windowHeight * data.windowWidth;
      const totalOpeningsArea = doorArea + windowArea;
      const netWallArea = grossWallArea - totalOpeningsArea;
      const netVolume = netWallArea * (data.wallThickness / 12);
      
      const totalBricks = netVolume * data.bricksPerCft;
      const totalBricksWithWastage = totalBricks * (1 + data.brickWastage / 100);

      const wetMortarVolume = netVolume * 0.25; // Assuming 25% mortar
      const dryMortarVolume = wetMortarVolume * 1.33;

      const totalCement = (dryMortarVolume * cementPart) / (sumOfRatio * 1.25); // bags
      const totalCementWithWastage = totalCement * (1 + data.mortarWastage / 100);

      const totalSand = (dryMortarVolume * sandPart) / sumOfRatio;
      const totalSandWithWastage = totalSand * (1 + data.mortarWastage / 100);

      return {
        'Total Bricks (Nos.)': totalBricksWithWastage,
        'Cement (bags)': totalCementWithWastage,
        'Sand (cft)': totalSandWithWastage,
      };
    }
    case 'cc-casting': {
        wetVolume = data.length * data.width * (data.thickness / 12);
        break;
    }
    case 'earthwork': {
        const result: MaterialQuantities = {
            'Earthwork Volume (cft)': data.length * data.width * data.depth
        };
        if (data.estimation) {
            result['Estimated Time'] = data.estimation.time;
            result['Required Manpower'] = data.estimation.manpower;
        }
        return result;
    }
    default:
      return null;
  }

  if (sumOfRatio === 0) return steel;

  const dryVolume = wetVolume * 1.54;
  const cementBags = (dryVolume * cementPart) / (sumOfRatio * 1.25);
  const sandCft = (dryVolume * sandPart) / sumOfRatio;
  const aggregateCft = aggregatePart ? (dryVolume * aggregatePart) / sumOfRatio : 0;

  const concrete: MaterialQuantities = {
    'Cement (bags)': cementBags,
    'Sand (cft)': sandCft,
  };

  if (aggregateCft > 0) {
      concrete['Aggregate (cft)'] = aggregateCft;
      concrete['Bricks for Aggregate (Nos.)'] = aggregateCft * BRICKS_PER_CFT_AGGREGATE;
  }

  return { ...concrete, ...steel };
};

export const calculateAllPartsMaterials = (parts: StructuralPart[]) => {
    return parts.map(part => {
        const materials = calculatePartMaterials(part);
        return { part, materials: materials || {} };
    });
};

export const aggregateMaterials = (allMaterials: { part: StructuralPart, materials: MaterialQuantities }[]): MaterialQuantities => {
    const total: MaterialQuantities = {};
    allMaterials.forEach(({ materials }) => {
        for (const key in materials) {
            if (typeof materials[key] === 'number') {
                if (total[key]) {
                    (total[key] as number) += materials[key] as number;
                } else {
                    total[key] = materials[key] as number;
                }
            } else {
                // For non-numeric values like time/manpower, just show them.
                if (!total[key]) { // Avoid overwriting if multiple earthworks exist
                    total[key] = materials[key];
                }
            }
        }
    });
    return total;
};


export const aggregateMaterialsByType = (allMaterials: { part: StructuralPart, materials: MaterialQuantities }[]): Record<string, MaterialQuantities> => {
    const totalsByType: Record<string, MaterialQuantities> = {};

    allMaterials.forEach(({ part, materials }) => {
        const partTypeKey = part.type;

        if (!totalsByType[partTypeKey]) {
            totalsByType[partTypeKey] = {};
        }

        for (const materialKey in materials) {
            const value = materials[materialKey];
             if (typeof value === 'number') {
                if (totalsByType[partTypeKey][materialKey]) {
                    (totalsByType[partTypeKey][materialKey] as number) += value;
                } else {
                    totalsByType[partTypeKey][materialKey] = value;
                }
            } else {
                 totalsByType[partTypeKey][materialKey] = value;
            }
        }
    });

    return totalsByType;
};

    
