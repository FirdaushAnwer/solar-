import React from 'react';
import type { NasaNeoData } from '../types';

interface MeteorDataPanelProps {
  data: NasaNeoData[];
  isLoading: boolean;
}

const formatSimpleDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return dateString;
    }
}

const LoadingRow: React.FC = () => (
    <tr className="bg-slate-800/50">
        <td colSpan={5} className="text-center p-4">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                <span>Loading Data...</span>
            </div>
        </td>
    </tr>
);

export const MeteorDataPanel: React.FC<MeteorDataPanelProps> = ({ data, isLoading }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 backdrop-blur-sm">
      <h2 className="text-2xl font-orbitron text-white border-b-2 border-cyan-500/50 pb-2 mb-4">
        NEAR-EARTH OBJECT DATABASE
      </h2>
      <div className="max-h-[400px] overflow-y-auto relative">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-cyan-400 uppercase bg-slate-900/70 sticky top-0 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-6 py-3">Designation</th>
              <th scope="col" className="px-6 py-3">Approach Date</th>
              <th scope="col" className="px-6 py-3">Miss Distance (km)</th>
              <th scope="col" className="px-6 py-3">Diameter (m)</th>
              <th scope="col" className="px-6 py-3">Velocity (km/s)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && data.length === 0 && <LoadingRow />}
            {!isLoading && data.length === 0 && (
                 <tr className="bg-slate-800/50">
                    <td colSpan={5} className="text-center p-4 text-slate-400">
                        No Potentially Hazardous Asteroid data available at this time.
                    </td>
                </tr>
            )}
            {data.map((neo) => (
              <tr key={neo.designation} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-200">
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                  {neo.designation}
                </th>
                <td className="px-6 py-4">
                  {formatSimpleDate(neo.closeApproachDate)}
                </td>
                <td className="px-6 py-4">
                  {Math.round(neo.missDistance).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {neo.diameter.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {neo.velocity.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};