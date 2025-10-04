
import { GoogleGenAI } from "@google/genai";
import { SimulationParams, ImpactCalculations } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateImpactNarrative = async (
  params: SimulationParams,
  calculations: ImpactCalculations
): Promise<string> => {
  const { diameter, speed, angle } = params;
  const { formattedEnergy, formattedCraterDiameter, seismicMagnitude } = calculations;

  const prompt = `
    You are a planetary scientist and a masterful storyteller. 
    Describe the consequences of a meteor impact on Earth with the following parameters. 
    Be vivid, dramatic, and scientifically plausible. Structure your response in three paragraphs.

    **Impact Parameters:**
    - Meteor Diameter: ${diameter} meters
    - Impact Velocity: ${speed} km/s
    - Impact Angle: ${angle} degrees

    **Calculated Effects:**
    - Impact Energy: ${formattedEnergy} Megatons of TNT
    - Estimated Crater Diameter: ${formattedCraterDiameter} km
    - Seismic Magnitude: ${seismicMagnitude} on the Richter scale

    **Narrative Structure:**
    1.  **The Impact Moment:** Describe the final moments of the meteor's descent, the atmospheric entry, the blinding flash of light, and the initial explosion upon impact.
    2.  **Immediate Aftermath:** Detail the formation of the crater, the massive thermal pulse, the devastating air blast (shockwave), and the ground-shaking earthquake that radiates from ground zero.
    3.  **Regional & Global Consequences:** Explain the broader effects. Mention the ejecta (debris) thrown into the atmosphere, potential for tsunamis if it hit water, and the short and long-term climate effects based on the scale of the impact.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate narrative from Gemini API.");
  }
};
