
import { SimulationParams, ImpactCalculations } from '../types';

const METEORITE_DENSITY = 3000; // kg/m^3 (stony meteorite)
const JOULES_PER_MEGATON_TNT = 4.184e15;

const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(2);
  return num.toExponential(2);
};

export const calculateImpact = (params: SimulationParams): ImpactCalculations => {
  const { diameter, speed, angle } = params;

  // 1. Calculate Mass
  const radius = diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass = METEORITE_DENSITY * volume;

  // 2. Calculate Kinetic Energy
  const velocityMetersPerSecond = speed * 1000;
  const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityMetersPerSecond, 2);
  const impactEnergyMegatons = kineticEnergyJoules / JOULES_PER_MEGATON_TNT;

  // 3. Calculate Crater Diameter (simplified scaling law)
  // This is a very simplified approximation. Real calculations are far more complex.
  // Based on the idea that diameter is proportional to energy^(1/3.4)
  // We'll scale it so a 1km asteroid (Chicxulub-like energy) makes a ~180km crater.
  // Chicxulub energy ~100 million MT.
  const baseEnergy = 1e8; // 100 million MT
  const baseCrater = 180; // km
  const craterScalingFactor = Math.pow(baseEnergy, 1 / 3.4);
  const craterConstant = baseCrater / craterScalingFactor;

  // Adjust for angle. Vertical impacts are most effective.
  const angleEffect = Math.sin((angle * Math.PI) / 180);
  let craterDiameter = craterConstant * Math.pow(impactEnergyMegatons, 1 / 3.4) * angleEffect;
  
  // Make sure small impacts don't create huge craters with this formula
  if (diameter < 50 && craterDiameter > diameter * 20 / 1000) {
      craterDiameter = diameter * 20 / 1000;
  }
  if (craterDiameter < diameter / 1000) {
      craterDiameter = diameter / 1000;
  }

  // 4. Calculate Seismic Magnitude (Richter Scale)
  // Empirical formula: Mw = 0.67 * log10(E) - 5.87 where E is in Joules
  const seismicMagnitude = Math.max(0, 0.67 * Math.log10(kineticEnergyJoules) - 5.87);

  return {
    energy: impactEnergyMegatons,
    craterDiameter: craterDiameter,
    formattedEnergy: formatNumber(impactEnergyMegatons),
    formattedCraterDiameter: formatNumber(craterDiameter),
    seismicMagnitude: parseFloat(seismicMagnitude.toFixed(1)),
  };
};
