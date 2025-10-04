import React, { useMemo } from 'react';
import type { AnimationState, ImpactResults } from '../types';

interface GlobeProps {
  animationState: AnimationState;
  results: ImpactResults | null;
}

const earthTextureUrl = "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg";
const cloudTextureUrl = "https://raw.githubusercontent.com/stemkoski/stemkoski.github.com/master/Three.js/images/clouds.png";


const Globe: React.FC<GlobeProps> = ({ animationState, results }) => {

  const craterSizeKm = results ? results.craterDiameter : 0;
  // Map crater diameter in km to a visual percentage of the globe.
  // Use a logarithmic scale to keep it visually manageable.
  const craterSizePercentage = Math.min(
    60, // Max visual size
    Math.log10(Math.max(1, craterSizeKm)) * 20
  );

  const trailParticles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      delay: `${i * 0.015}s`,
      scale: `${1 - i / 30}`,
      opacity: `${1 - i / 20}`,
      blur: `${i / 20}px`,
    }));
  }, []);

  const splashParticles = useMemo(() => {
    if (animationState !== 'impact') return [];
    return Array.from({ length: 60 }).map(() => {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 150 + Math.random() * 150; // spread distance
      return {
        '--tx': `${Math.cos(angle) * radius}px`,
        '--ty': `${Math.sin(angle) * radius}px`,
        '--r': `${Math.random() * 360}deg`,
        animationDuration: `${0.8 + Math.random() * 0.7}s`,
        animationDelay: `${Math.random() * 0.2}s`,
        width: `${2 + Math.random() * 4}px`,
        height: `${10 + Math.random() * 15}px`,
        backgroundColor: `hsl(20, 100%, ${50 + Math.random() * 20}%)`,
      };
    });
  }, [animationState]);


  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 xl:w-[500px] xl:h-[500px] flex items-center justify-center">
      <style>
        {`
          @keyframes rotate {
            from { background-position: 0% 50%; }
            to { background-position: 200% 50%; }
          }
          @keyframes rotate-fast {
            from { background-position: 0% 50%; }
            to { background-position: 200% 50%; }
          }
          @keyframes shootMeteor {
            0% { top: -20%; left: 110%; }
            100% { top: 48%; left: 48%; }
          }
          @keyframes impactFlash {
            0% { transform: scale(0); opacity: 0; }
            10% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes shockwave {
            0% { transform: scale(0); opacity: 0.8; border-width: 5px; }
            100% { transform: scale(3); opacity: 0; border-width: 0px; }
          }
          @keyframes impact-splash {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(var(--tx), var(--ty)) scale(0) rotate(var(--r));
              opacity: 0;
            }
          }
          @keyframes subtle-pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(0.99); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-globe {
            animation: fade-in-globe 1s ease-out forwards;
          }
          @keyframes fade-in-globe {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>

      {/* Earth Globe */}
      <div
        className="absolute w-full h-full rounded-full bg-cover bg-center shadow-2xl shadow-cyan-500/20"
        style={{
          backgroundImage: `url(${earthTextureUrl})`,
          backgroundSize: '200% 100%',
          animation: 'rotate 180s linear infinite',
        }}
      >
        <div 
          className="absolute w-full h-full rounded-full opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, hsla(0,0%,100%,.3) 0, hsla(0,0%,100%,0) 35%)'}}
        />
        <div className="absolute inset-0 rounded-full" style={{boxShadow: 'inset 0 0 50px 20px rgba(0,0,0,0.9)'}} />
      </div>
      
      {/* Cloud Layer */}
      <div
        className="absolute w-full h-full rounded-full bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url(${cloudTextureUrl})`,
          backgroundSize: '200% 100%',
          animation: 'rotate-fast 120s linear infinite',
        }}
      />
      
      {/* Post-Impact Visuals */}
      {results && animationState === 'idle' && (
        <>
          {/* Dust/Soot overlay */}
          <div className="absolute w-full h-full rounded-full bg-black/40 animate-fade-in-globe" style={{animationDuration: '3s'}} />
          
          {/* Crater effect */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-fade-in-globe"
            style={{
              width: `${craterSizePercentage}%`,
              height: `${craterSizePercentage}%`,
              animationDuration: '2s',
            }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,100,0,0.8) 0%, rgba(255,69,0,0.6) 40%, rgba(139,0,0,0.3) 70%, transparent 100%)',
                boxShadow: '0 0 10px 5px rgba(255,69,0,0.5), inset 0 0 15px 5px rgba(0,0,0,0.7)',
                animation: 'subtle-pulse 4s ease-in-out infinite',
              }}
            />
          </div>
        </>
      )}

      {/* Atmosphere Glow */}
      <div className="absolute w-[105%] h-[105%] rounded-full bg-cyan-400/20 blur-2xl" />

      {/* Meteor Trail */}
      {animationState === 'shooting' &&
        trailParticles.map((style, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-l from-orange-400 to-yellow-200 rounded-full"
            style={{
              animation: `shootMeteor 2s linear forwards`,
              animationDelay: style.delay,
              transform: `scale(${style.scale})`,
              opacity: style.opacity,
              filter: `blur(${style.blur})`,
              boxShadow: i === 0 
                ? '0 0 20px 10px rgba(251,191,36,0.5)' 
                : '0 0 10px 5px rgba(251,191,36,0.3)',
            }}
          />
        ))}

      {/* Impact Effect */}
      {animationState === 'impact' && (
        <>
          <div 
            className="absolute w-1/2 h-1/2 rounded-full bg-radial-gradient from-white via-yellow-200 to-transparent"
            style={{ animation: 'impactFlash 0.5s ease-out forwards' }}
          />
          <div 
            className="absolute w-1/4 h-1/4 rounded-full border-orange-300"
            style={{ animation: 'shockwave 1.5s ease-out forwards' }}
          />
          <div className="absolute top-1/2 left-1/2 w-px h-px">
            {splashParticles.map((style, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  ...style,
                  animationName: 'impact-splash',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export { Globe };