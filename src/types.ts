export type NutrientType =
  | 'Magnesium'
  | 'Potassium'
  | 'Nitrogen'
  | 'Iron'
  | 'Phosphorus'
  | 'Calcium'
  | 'Zinc'
  | 'Sulfur'
  | 'Manganese'
  | 'Boron'
  | 'Other'
  | 'None';

export type IssueCategory = 'deficiency' | 'disease_or_pest' | 'environmental' | 'healthy';

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';

export interface ImmediateAction {
  title: string;
  instruction: string;
  method: string;
}

export interface SoilAndPh {
  optimalPh: string;
  explanation: string;
  testAdvice: string;
}

export interface DiagnosisData {
  isPlant: boolean;
  nonPlantReason?: string;
  plantName: string;
  primaryDiagnosis: string;
  shortSummary: string; // e.g. "Likely magnesium deficiency — 78%"
  confidence: number;
  category: IssueCategory;
  deficiencyType: NutrientType;
  severity: SeverityLevel;
  affectedArea: string;
  visualSymptoms: string[];
  rootCauses: string[];
  immediateActions: ImmediateAction[];
  longTermRemedies: string[];
  soilAndPh: SoilAndPh;
  preventionTips: string[];
  funBotanyFact?: string;
}

export interface ScanRecord {
  id: string;
  timestamp: number;
  thumbnail: string;
  image: string;
  diagnosis: DiagnosisData;
  checklistState?: Record<string, boolean>;
}

export interface OfflineNutrientGuide {
  name: string;
  symbol: string;
  mobility: 'Mobile (Old foliage first)' | 'Immobile (New growth first)';
  shortDescription: string;
  classicSymptom: string;
  visualMarkers: string[];
  organicFix: string;
  chemicalFix: string;
  soilPhLockout: string;
  colorTheme: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
