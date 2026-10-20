export type ForensicVerdict =
  | 'Authentic'
  | 'Likely Authentic'
  | 'Suspicious'
  | 'Likely Forged';

export type TechniqueKey =
  | 'copy_move'
  | 'splicing'
  | 'double_compression'
  | 'metadata'
  | 'noise'
  | 'cfa'
  | 'ela'
  | 'prnu'
  | 'shadow'
  | 'xai'
  | 'adversarial';

export type StatusTagLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'UNAVAILABLE';

export interface TechniqueReport {
  score: number | null;
  available: boolean;
  message: string;
  map_base64: string | null;
  details: Record<string, any>;
}

export interface ForensicResponse {
  verdict: ForensicVerdict;
  confidence: number;
  raw_forgery_probability: number;
  technique_scores: Record<string, number | null>;
  technique_contributions: Record<string, number>;
  highlighted_image_base64: string;
  disclaimer: string;
  technique_reports: Record<string, TechniqueReport>;
}

export interface TechniquePlateMeta {
  index: string;
  key: TechniqueKey;
  title: string;
  tagline: string;
  description: string;
  example: string;
  domain: 'Spatial' | 'Frequency' | 'Container' | 'Sensor' | 'Physical' | 'Interpretability' | 'Robustness';
}
