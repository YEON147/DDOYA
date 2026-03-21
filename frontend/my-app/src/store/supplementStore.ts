import { create } from 'zustand';

/** 목록·상세용 로컬 목 데이터. OCR/알약 등록 단계 상태는 `useSupplementCreateStore` 사용. */
export interface Supplement {
  supplement_id: number;
  image_url: string;
  name: string;
  primary_ingredient: string;
  daily_dose: number;
  stock_quantity: number;
  stock_alert_enabled: boolean;
  intake_times: string[];
  unit: string;
}

interface SupplementStore {
  supplements: Supplement[];
  setSupplements: (supplements: Supplement[]) => void;
  updateSupplement: (id: number, data: Partial<Supplement>) => void;
  getSupplementById: (id: number) => Supplement | undefined;
}

/** 외부 placeholder 도메인(DNS 차단 환경) 대비 — 로컬 data URI */
const MOCK_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Initial mock data
const initialSupplements: Supplement[] = [
  // BE연동시 삭제 예정
  // {
  //   supplement_id: 1,
  //   image_url: 'https://via.placeholder.com/100',
  //   name: '비타민 D',
  //   primary_ingredient: '비타민 D3',
  //   daily_dose: 2,
  //   stock_quantity: 24,
  //   stock_alert_enabled: true,
  //   intake_times: ['07:30', '17:30'],
  //   unit: '정',
  // },
  // {
  //   supplement_id: 2,
  //   image_url: 'https://via.placeholder.com/100',
  //   name: '오메가-3',
  //   primary_ingredient: 'EPA/DHA',
  //   daily_dose: 1,
  //   stock_quantity: 15,
  //   stock_alert_enabled: false,
  //   intake_times: ['08:00'],
  //   unit: '캡슐',
  // },
  // {
  //   supplement_id: 3,
  //   image_url: 'https://via.placeholder.com/100',
  //   name: '프로바이오틱스',
  //   primary_ingredient: 'Lactobacillus',
  //   daily_dose: 1,
  //   stock_quantity: 42,
  //   stock_alert_enabled: true,
  //   intake_times: ['07:00'],
  //   unit: '포',
  // },
];

export const useSupplementStore = create<SupplementStore>((set, get) => ({
  supplements: initialSupplements,
  setSupplements: (supplements) => set({ supplements }),
  updateSupplement: (id, data) =>
    set((state) => ({
      supplements: state.supplements.map((s) =>
        s.supplement_id === id ? { ...s, ...data } : s
      ),
    })),
  getSupplementById: (id) => get().supplements.find((s) => s.supplement_id === id),
}));
