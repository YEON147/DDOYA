import { SuccessResponse } from './types';

export interface RecommendedProduct {
  productId: number;
  name: string;
  pillImageUrl: string;
  brand?: string;
  price?: number;
}

export interface IntakeTimeRecommendation {
  userSupplementId: number;
  name: string;
  currentIntakeTime: string;
  recommendedIntakeTime: string;
  reason?: string;
}

export interface ReportDetail {
  reportId: number;
  date: string;
  summary: string;
  analysisResult: string;
  recommendedProducts: RecommendedProduct[];
  intakeTimeRecommendations: IntakeTimeRecommendation[];
  hasSupplementChanges: boolean;
}

export type ReportResponse = SuccessResponse<ReportDetail>;
