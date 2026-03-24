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

/** GET /intake-schedules — 일별 섭취 스케줄 */
export type IntakeScheduleItemStatus = 'TAKEN' | 'MISSED' | 'SKIPPED';

export interface DailyIntakeScheduleSlotItem {
  scheduleId: number;
  userSupplementId: number;
  alias: string;
  dosePerIntake: number;
  intakeRecordId: number;
  status: IntakeScheduleItemStatus;
  actionAt: string | null;
}

export interface DailyIntakeTimeSlot {
  intakeTime: string;
  plannedAt: string;
  items: DailyIntakeScheduleSlotItem[];
}

export interface DailyIntakeScheduleData {
  targetDate: string;
  timeSlots: DailyIntakeTimeSlot[];
}

export type DailyIntakeScheduleResponse = SuccessResponse<DailyIntakeScheduleData>;

export interface DailyIntakeScheduleQuery {
  date?: string;
}
