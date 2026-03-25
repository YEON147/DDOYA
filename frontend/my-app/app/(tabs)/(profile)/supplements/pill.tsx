import { Redirect } from 'expo-router';

/** 이전 경로 호환: 알약 단계는 `pill-guide`로 통합 */
export default function SupplementPillRedirectScreen() {
  return <Redirect href="/(tabs)/(profile)/supplements/pill-guide" />;
}
