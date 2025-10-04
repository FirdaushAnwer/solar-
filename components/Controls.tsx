import React, { useMemo } from 'react';

interface ControlsProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  logarithmic?: boolean;
}

// These helper components are defined outside the main component
// to prevent them from being recreated on every render.
export const DiameterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m-7-7l-3 3m6 0l-3 3m0 8l3-3m-6 0l3-3" />
  </svg>
);

export const SpeedIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export const AngleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const formatDisplayValue = (value: number, unit: string) => {
  if (unit === 'meters' && value >= 1000) {
    return `${(value / 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})} km`;
  }
  return `${value.toLocaleString()} ${unit}`;
};

export const Controls: React.FC<ControlsProps> = ({
  label, unit, value, min, max, step, onChange, icon, logarithmic = false
}) => {

  const minLog = useMemo(() => Math.log(min), [min]);
  const maxLog = useMemo(() => Math.log(max), [max]);
  const scale = useMemo(() => (maxLog - minLog) / (100 - 1), [minLog, maxLog]);

  const valueToPosition = (val: number) => {
    if (!logarithmic) return ((val - min) / (max - min)) * 99 + 1;
    return (Math.log(val) - minLog) / scale + 1;
  };
  
  const positionToValue = (pos: number) => {
    if (!logarithmic) return min + ((pos - 1) / 99) * (max - min);
    return Math.exp(minLog + (pos - 1) * scale);
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = parseFloat(e.target.value);
    const newValue = positionToValue(position);
    onChange(newValue);
  };
  
  const sliderValue = valueToPosition(value);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="flex items-center space-x-2 text-slate-300">
          {icon}
          <span className="font-bold">{label}</span>
        </label>
        <span className="font-orbitron text-lg text-cyan-400 bg-slate-900/50 px-3 py-1 rounded">
          {formatDisplayValue(value, unit)}
        </span>
      </div>
      <input
        type="range"
        min={logarithmic ? 1 : min}
        max={logarithmic ? 100 : max}
        step={logarithmic ? 1 : step}
        value={logarithmic ? sliderValue : value}
        onChange={logarithmic ? handleSliderChange : (e) => onChange(parseFloat(e.target.value))}
        className="custom-slider w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
      />
    </div>
  );
};