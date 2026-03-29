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
  /** 서버 `IntakeItemDto.bodyPartId` — 부위 일러스트 매칭용 */
  bodyPartId?: number | null;
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

export interface IntakeCertificationExpectedSchedule {
  scheduleId: number;
}

export interface IntakeCertificationRequest {
  expectedSchedules: IntakeCertificationExpectedSchedule[];
}

export interface IntakeCertificationResultItem {
  scheduleId: number;
  userSupplementId: number;
  dosePerIntake: number;
  detectedAmount: number;
  matched: boolean;
  beforeStatus: 'TAKEN' | 'MISSED' | 'SKIPPED';
  afterStatus: 'TAKEN' | 'MISSED' | 'SKIPPED';
  stockAdjusted: boolean;
}

export interface IntakeCertificationResultData {
  success: boolean;
  message: string;
  results: IntakeCertificationResultItem[];
}

export type IntakeCertificationResponse = SuccessResponse<IntakeCertificationResultData>;

export type IntakeRecordStatusUpdate = 'MISSED' | 'SKIPPED';

export interface IntakeRecordStatusUpdateRequest {
  status: IntakeRecordStatusUpdate;
}

export interface IntakeRecordStatusUpdateData {
  intakeRecordId: number;
  scheduleId: number;
  status: IntakeScheduleItemStatus;
  actionAt: string | null;
}

export type IntakeRecordStatusUpdateResponse = SuccessResponse<IntakeRecordStatusUpdateData>;
