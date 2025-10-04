import React from 'react';
import type { NasaNeoData } from '../types';
import { DiameterIcon, SpeedIcon } from './Controls';

interface PredictionPanelProps {
  prediction: NasaNeoData | null;
  onSimulate: () => void;
  isLoading: boolean;
}

const WarningIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const CalendarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const DistanceIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
    </svg>
);

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between text-slate-300">
        <div className="flex items-center space-x-2">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-bold text-white">{value}</span>
    </div>
);

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

const formatDistance = (km: number) => {
    const LD_KM = 384400;
    const lunarDistances = km / LD_KM;
    if (km > 1_000_000) {
        return `${(km / 1_000_000).toFixed(2)}M km (${lunarDistances.toFixed(1)} LD)`;
    }
    return `${km.toLocaleString(undefined, {maximumFractionDigits: 0})} km (${lunarDistances.toFixed(1)} LD)`;
};

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ prediction, onSimulate, isLoading }) => {
  return (
    <div className="border border-yellow-500/50 bg-slate-900/70 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-2">
            <WarningIcon />
            <h3 className="font-orbitron text-yellow-400">NEXT THREAT ADVISORY</h3>
        </div>

        {isLoading && <p className="text-slate-400 text-center py-4">Scanning for threats...</p>}
        
        {!isLoading && !prediction && <p className="text-slate-400 text-center py-4">No imminent threats detected in the PHA database.</p>}

        {prediction && (
            <div className="animate-fade-in space-y-3">
                <div className="text-center bg-slate-800/50 p-2 rounded-md">
                    <p className="text-lg font-bold text-white">{prediction.designation}</p>
                    <p className="text-sm text-slate-400">Closest Approach</p>
                    <p className="font-orbitron text-xl text-red-500 animate-pulse">{formatDate(prediction.closeApproachDate)}</p>
                </div>
                <div className="space-y-2 text-sm pt-2">
                   <StatItem icon={<DistanceIcon />} label="Miss Distance" value={formatDistance(prediction.missDistance)} />
                   <StatItem icon={<DiameterIcon />} label="Est. Diameter" value={`${prediction.diameter.toLocaleString()} m`} />
                   <StatItem icon={<SpeedIcon />} label="Rel. Velocity" value={`${prediction.velocity.toFixed(1)} km/s`} />
                </div>
                <button 
                    onClick={onSimulate}
                    className="w-full mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-all duration-200 text-sm uppercase tracking-wider font-orbitron transform hover:scale-[1.02] active:scale-100"
                >
                    Simulate This Threat
                </button>
            </div>
        )}
    </div>
  );
};