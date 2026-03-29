import { Alert } from 'react-native';

/**
 * React Native `Alert.alert`와 동일한 인자(title, message?, buttons?)로 호출하되,
 * 앱 공통(Soft Wellness) 스타일 모달로 표시합니다.
 */
export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AppAlertOptions = {
  /** 설정 시 확인 버튼 없이 해당 ms 후 자동으로 닫힘 */
  autoDismissMs?: number;
};

export type AppAlertPayload = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
  autoDismissMs?: number;
};

type Listener = (p: AppAlertPayload) => void;

let listener: Listener | null = null;

export function registerAppAlert(fn: Listener | null) {
  listener = fn;
}

export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
  options?: AppAlertOptions,
) {
  if (listener) {
    listener({
      title,
      message,
      buttons,
      autoDismissMs: options?.autoDismissMs,
    });
    return;
  }
  Alert.alert(title, message, buttons);
}
