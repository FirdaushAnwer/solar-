import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Controls, DiameterIcon, SpeedIcon, AngleIcon } from './components/Controls';
import { Globe } from './components/Globe';
import { ResultsPanel } from './components/ResultsPanel';
import { PredictionPanel } from './components/PredictionPanel';
import { MeteorDataPanel } from './components/MeteorDataPanel';
import { SimulationParams, ImpactResults, AnimationState, NasaNeoData } from './types';
import { calculateImpact } from './services/impactCalculator';
import { generateImpactNarrative } from './services/geminiService';

const staticPresets: NasaNeoData[] = [
  { designation: 'Chelyabinsk (2013 est.)', diameter: 20, velocity: 19, closeApproachDate: '2013-Feb-15', missDistance: 0 },
  { designation: 'Tunguska (1908 est.)', diameter: 60, velocity: 15, closeApproachDate: '1908-Jun-30', missDistance: 0 },
  { designation: 'Apophis (Potentially Hazardous)', diameter: 370, velocity: 30.7, closeApproachDate: '2029-Apr-13', missDistance: 31000 },
  { designation: 'Chicxulub (Dinosaur Killer)', diameter: 10000, velocity: 20, closeApproachDate: 'Past Event', missDistance: 0 },
];

const MeteorShowerBackground: React.FC = () => {
  const meteors = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="meteor"
        style={{
          top: `${Math.random() * 100}vh`,
          left: `calc(50% + ${Math.random() * 800}px)`,
          width: `${150 + Math.random() * 150}px`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${1 + Math.random() * 2}s`,
        }}
      />
    )),
    []
  );
  return <div className="meteor-shower -z-10">{meteors}</div>;
};


const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    diameter: 1000, // 1 km
    speed: 20, // 20 km/s
    angle: 45, // 45 degrees
  });
  const [results, setResults] = useState<ImpactResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  
  const [nasaData, setNasaData] = useState<NasaNeoData[]>([]);
  const [isNasaDataLoading, setIsNasaDataLoading] = useState<boolean>(true);
  const [selectedNeo, setSelectedNeo] = useState<string>('custom');
  const [prediction, setPrediction] = useState<NasaNeoData | null>(null);

  const calculateDiameter = (h: number): number => {
    const albedo = 0.15;
    const diameterInKm = (1329 / Math.sqrt(albedo)) * Math.pow(10, -0.2 * h);
    return Math.round(diameterInKm * 1000);
  };

  useEffect(() => {
    const fetchNasaData = async () => {
      setIsNasaDataLoading(true);
      try {
        const AU_TO_KM = 149597870.7;
        const nasaApiUrl = 'https://ssd-api.jpl.nasa.gov/cad.api?pha=true&date-min=now&body=Earth&sort=date&limit=20';
        const proxyUrl = `https://cors.eu.org/${nasaApiUrl}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from proxy with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.data) {
          // Fields: 0: des, 3: cd, 4: dist, 6: v_rel, 10: h
          const processedData: NasaNeoData[] = data.data.map((neo: any[]) => ({
            designation: neo[0].trim(),
            closeApproachDate: neo[3].trim(),
            missDistance: parseFloat(neo[4]) * AU_TO_KM,
            velocity: parseFloat(neo[6]),
            diameter: calculateDiameter(parseFloat(neo[10])),
          }));
          setNasaData(processedData);
          if (processedData.length > 0) {
            setPrediction(processedData[0]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch NASA NEO data:", e);
      } finally {
        setIsNasaDataLoading(false);
      }
    };

    fetchNasaData();
  }, []);
  
  const allPresets = [...staticPresets, ...nasaData];

  const handleParamChange = useCallback((param: keyof SimulationParams, value: number) => {
    setResults(null);
    setParams(prev => ({ ...prev, [param]: value }));
    setSelectedNeo('custom');
  }, []);
  
  const handleNeoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResults(null);
    const designation = e.target.value;
    setSelectedNeo(designation);
    if (designation === 'custom') {
      return;
    }
    const selected = allPresets.find(neo => neo.designation === designation);
    if (selected) {
      setParams({
        ...params,
        diameter: selected.diameter,
        speed: selected.velocity,
      });
    }
  };

  const handleSimulatePrediction = useCallback(() => {
    if (prediction) {
      setResults(null);
      setSelectedNeo(prediction.designation);
      setParams({
        ...params,
        diameter: prediction.diameter,
        speed: prediction.velocity,
      });
      // Scroll to the top to see the animation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [prediction, params]);

  const runSimulation = async () => {
    if (isLoading || animationState !== 'idle') return;

    setIsLoading(true);
    setResults(null);
    setError(null);
    setAnimationState('shooting');

    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnimationState('impact');

    try {
      const calculations = calculateImpact(params);
      const narrative = await generateImpactNarrative(params, calculations);
      setResults({ ...calculations, narrative });
    } catch (e) {
      console.error(e);
      setError('Failed to get simulation narrative. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnimationState('idle'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 overflow-hidden relative">
      <MeteorShowerBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900" />
      
      <header className="relative text-center p-4 md:p-6 border-b border-cyan-500/20">
        <h1 className="text-3xl md:text-5xl font-bold font-orbitron text-cyan-400 tracking-widest">
          METEOR IMPACT SIMULATOR
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Witness the power of the cosmos. Configure and simulate a celestial impact.
        </p>
      </header>

      <main className="relative grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-8 p-4 md:p-8">
        <div className="xl:col-span-3 space-y-6 bg-slate-800/50 p-6 rounded-lg border border-slate-700 backdrop-blur-sm">
          <h2 className="text-2xl font-orbitron text-white border-b-2 border-cyan-500/50 pb-2">IMPACT PARAMETERS</h2>
          
          <PredictionPanel prediction={prediction} onSimulate={handleSimulatePrediction} isLoading={isNasaDataLoading} />

          <div className="space-y-2 pt-4 border-t border-slate-700">
            <label htmlFor="neo-select" className="flex items-center space-x-2 text-slate-300 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Preset Scenario / Manual Override</span>
            </label>
            <select
              id="neo-select"
              value={selectedNeo}
              onChange={handleNeoSelect}
              disabled={isNasaDataLoading && nasaData.length === 0}
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 hover:border-slate-500 transition"
            >
              {isNasaDataLoading && nasaData.length === 0 ? (
                <option>Loading NEOs...</option>
              ) : (
                <>
                  <option value="custom">-- Custom Simulation --</option>
                  {allPresets.map(neo => (
                    <option key={neo.designation} value={neo.designation}>
                      {neo.designation}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <Controls 
            label="Meteor Diameter"
            unit="meters"
            value={params.diameter}
            min={10}
            max={100000}
            step={10}
            onChange={(val) => handleParamChange('diameter', val)}
            icon={<DiameterIcon />}
            logarithmic
          />
          <Controls
            label="Impact Velocity"
            unit="km/s"
            value={params.speed}
            min={11}
            max={72}
            step={1}
            onChange={(val) => handleParamChange('speed', val)}
            icon={<SpeedIcon />}
          />
          <Controls
            label="Impact Angle"
            unit="degrees"
            value={params.angle}
            min={5}
            max={90}
            step={1}
            onChange={(val) => handleParamChange('angle', val)}
            icon={<AngleIcon />}
          />
          <button
            onClick={runSimulation}
            disabled={isLoading || animationState !== 'idle'}
            className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg uppercase tracking-wider font-orbitron shadow-[0_0_15px_rgba(56,189,248,0.5)] disabled:shadow-none transform hover:scale-[1.02] active:scale-100"
          >
            {isLoading ? 'SIMULATING...' : (animationState !== 'idle' ? 'ANIMATING...' : 'INITIATE IMPACT')}
          </button>
        </div>

        <div className="xl:col-span-6 flex items-center justify-center min-h-[40vh] xl:min-h-0">
          <Globe animationState={animationState} results={results} />
        </div>

        <div className="xl:col-span-3">
          <ResultsPanel results={results} isLoading={isLoading} error={error} />
        </div>
      </main>

      <section className="relative px-4 md:px-8 pb-8">
        <MeteorDataPanel data={nasaData} isLoading={isNasaDataLoading} />
      </section>
    </div>
  );
};

export default App;