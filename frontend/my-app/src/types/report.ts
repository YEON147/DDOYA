import { SuccessResponse } from './types';

/** 리포트 상세 조회 응답 (GET /reports) */
export interface ReportDetail {
  reportId: number;
  needsRefresh: boolean;
  updatedAt: string;
  isEditable: boolean;
  comments: ReportComments | null;
  recommendedProductsByIngredient: RecommendedProductsByIngredient[];
  timing_recommendations: TimingRecommendation[];
}

export interface ReportComments {
  excessComment: string;
  deficiencyComment: string;
  productComment: string;
  scheduleComment: string;
}

export interface RecommendedProductsByIngredient {
  ingredientId: number;
  ingredientName: string;
  recommendedProducts: RecommendedProduct[];
}

export interface RecommendedProduct {
  productCode: string;
  productName: string;
  brand?: string;
  pillImageUrl?: string;
}

/** 리포트 생성/갱신 응답 (POST /reports) */
export interface ReportCreateDetail {
  reportId: number;
  needsRefresh: boolean;
  updatedAt: string;
  is_editable: boolean;
  ingredient_analysis: any[];
  recommended_products: RecommendedProduct[];
  timing_recommendations: TimingRecommendation[];
  comments: any;
}

export interface TimingRecommendation {
  user_supplement_id: number;
  alias: string;
  intake_timings: IntakeTimingInfo[];
}

export interface IntakeTimingInfo {
  intake_timing: string;
  intake_time: string | null;
}

export type ReportResponse = SuccessResponse<ReportDetail>;
export type ReportCreateResponse = SuccessResponse<ReportCreateDetail>;
