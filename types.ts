export interface SimulationParams {
  diameter: number; // in meters
  speed: number;    // in km/s
  angle: number;    // in degrees
}

export interface ImpactCalculations {
  energy: number; // in megatons of TNT
  craterDiameter: number; // in km
  formattedEnergy: string;
  formattedCraterDiameter: string;
  seismicMagnitude: number;
}

export interface ImpactResults extends ImpactCalculations {
  narrative: string;
}

export type AnimationState = 'idle' | 'shooting' | 'impact';

export interface NasaNeoData {
  designation: string;
  diameter: number; // in meters
  velocity: number; // in km/s
  closeApproachDate: string;
  missDistance: number; // in km
}