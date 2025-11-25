
// This file is deprecated. 
// Analysis is now handled locally via 'localAnalysisService.ts' and 'pythonTracer.ts'.
import { SimulationResponse } from '../types';

export const analyzeCode = async (code: string, language: string, output: string): Promise<SimulationResponse> => {
    throw new Error("AI Service is disabled. Use local analysis.");
};
