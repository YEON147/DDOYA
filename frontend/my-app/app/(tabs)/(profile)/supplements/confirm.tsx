import { Redirect } from 'expo-router';

/** 등록 확인 화면은 플로우에서 제외됨 — 영양제 목록으로 이동 */
export default function SupplementConfirmRedirectScreen() {
  return <Redirect href="/(tabs)/(profile)/supplements" />;
}
