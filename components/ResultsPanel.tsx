
import React from 'react';
import type { ImpactResults } from '../types';

interface ResultsPanelProps {
  results: ImpactResults | null;
  isLoading: boolean;
  error: string | null;
}

const ResultItem: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="flex justify-between items-baseline bg-slate-800/50 p-3 rounded-md">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className="font-orbitron text-white text-lg font-bold">
      {value} <span className="text-cyan-400 text-sm">{unit}</span>
    </span>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400"></div>
    <p className="text-cyan-400 font-orbitron">Calculating Cosmic Consequences...</p>
  </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, isLoading, error }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 backdrop-blur-sm h-full flex flex-col">
      <h2 className="text-2xl font-orbitron text-white border-b-2 border-cyan-500/50 pb-2 mb-4">
        IMPACT ANALYSIS
      </h2>
      <div className="flex-grow">
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
        {!isLoading && !error && !results && (
          <div className="text-center text-slate-400 h-full flex items-center justify-center">
            <p>Awaiting simulation data...<br/>The fate of the world is in your hands.</p>
          </div>
        )}
        {results && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-3">
              <ResultItem label="Impact Energy" value={results.formattedEnergy} unit="Megatons" />
              <ResultItem label="Crater Diameter" value={results.formattedCraterDiameter} unit="km" />
              <ResultItem label="Seismic Magnitude" value={results.seismicMagnitude} unit="Richter" />
            </div>
            <div className="pt-4">
              <h3 className="text-lg font-orbitron text-cyan-400 mb-2">Scientific Narrative</h3>
              <div className="bg-slate-900/50 p-4 rounded-md text-slate-300 space-y-4 max-h-96 overflow-y-auto">
                {results.narrative.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
