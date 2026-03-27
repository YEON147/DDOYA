import { SuccessResponse } from './types';

/** 리포트 상세 조회 응답 (GET /reports) */
export interface ReportDetail {
  report_id: number;
  reportId?: number;
  needsRefresh: boolean;
  updated_at: string;
  updatedAt?: string;
  is_editable: boolean;
  isEditable?: boolean;
  ingredient_analysis?: IngredientAnalysis[];
  ingredientAnalysis?: IngredientAnalysis[];
  comments: ReportComments | null;
  recommended_products_by_ingredient: RecommendedProductsByIngredient[];
  recommendedProductsByIngredient?: RecommendedProductsByIngredient[];
  timing_recommendations: TimingRecommendation[];
  timingRecommendations?: TimingRecommendation[];
}

export interface ReportComments {
  excessComment: string;
  deficiencyComment: string;
  productComment: string;
  scheduleComment: string;
}

export interface RecommendedProductsByIngredient {
  ingredient_id: number;
  ingredientId?: number;
  ingredient_name: string;
  ingredientName?: string;
  recommended_products: RecommendedProduct[];
  recommendedProducts?: RecommendedProduct[];
}

export interface RecommendedProduct {
  product_code: string;
  productCode?: string;
  product_name: string;
  productName?: string;
  brand?: string;
  pill_image_url?: string;
  pillImageUrl?: string;
}

export interface IngredientAnalysis {
  ingredient_id?: number;
  ingredientId?: number;
  normalized_ingredient_name?: string;
  normalizedIngredientName?: string;
  analysis_type?: 'EXCESS' | 'DEFICIENCY' | 'NORMAL';
  analysisType?: 'EXCESS' | 'DEFICIENCY' | 'NORMAL';
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

export interface ReportIntakeTimingsSaveRequest {
  userSupplements: {
    userSupplementId: number;
    intakeTimes: string[];
  }[];
}

export interface ReportIntakeTimingsSaveData {
  reportId: number;
  saved_count: number;
  updated_supplement_count: number;
  needsRefresh: boolean;
}

export type ReportResponse = SuccessResponse<ReportDetail>;
export type ReportCreateResponse = SuccessResponse<ReportCreateDetail>;
export type ReportIntakeTimingsSaveResponse = SuccessResponse<ReportIntakeTimingsSaveData>;
