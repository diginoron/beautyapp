export interface FeatureAnalysis {
  feature: string;
  analysis: string;
}

export interface AnalysisResult {
  isValidFace: boolean;
  errorMessage?: string;
  harmonyScore: number;
  featureAnalysis: FeatureAnalysis[];
  suggestions: string[];
}

export interface MorphSuggestion {
  feature: string;
  suggestion: string;
}

export interface MorphResult {
  summary: string;
  suggestions: MorphSuggestion[];
  isValid: boolean;
  errorMessage?: string;
}

export interface ColorPalette {
  name: string;
  description: string;
  colors: string[];
}

export interface ColorHarmonyResult {
  isValidFace: boolean;
  errorMessage?: string;
  summary: string;
  palettes: ColorPalette[];
}

export interface Salon {
  name: string;
  address: string;
  phone: string;
  rating: number;
}

// FIX: Added HistoryItem interface for analysis history.
export interface HistoryItem {
  id: string;
  created_at: string;
  harmony_score: number;
  feature_analysis: FeatureAnalysis[];
  suggestions: string[];
  image_url: string;
}

// FIX: Added User interface for the authenticated user object.
export interface User {
  id: string;
  email?: string;
}
