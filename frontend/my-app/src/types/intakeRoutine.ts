import { SuccessResponse } from './types';

export interface IntakeRoutineSettingItem {
  userIntakeTimingSettingId: number;
  intakeTiming: string; // Display name (e.g., "아침 식사 후")
  intakeTime: string;   // Format: "HH:mm"
  enumOrdinal: number;  // For sorting
}

export interface IntakeRoutineSettingsListResponse {
  settings: IntakeRoutineSettingItem[];
}

export interface IntakeRoutineUpdateRequest {
  intakeTime: string; // Format: "HH:mm"
}

export type IntakeRoutineListResponse = SuccessResponse<IntakeRoutineSettingsListResponse>;
export type IntakeRoutineDetailResponse = SuccessResponse<IntakeRoutineSettingItem>;
