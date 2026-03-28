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

export type AppAlertPayload = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type Listener = (p: AppAlertPayload) => void;

let listener: Listener | null = null;

export function registerAppAlert(fn: Listener | null) {
  listener = fn;
}

export function appAlert(title: string, message?: string, buttons?: AppAlertButton[]) {
  if (listener) {
    listener({ title, message, buttons });
    return;
  }
  Alert.alert(title, message, buttons);
}
