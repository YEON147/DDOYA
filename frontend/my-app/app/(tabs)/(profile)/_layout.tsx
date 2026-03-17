import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="supplements"
        options={{
          headerTitle: '영양제 관리',
          headerBackTitle: '뒤로',
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          headerTitle: '리포트',
          headerBackTitle: '뒤로',
        }}
      />
      <Stack.Screen
        name="my-info"
        options={{
          headerTitle: '내 정보',
          headerBackTitle: '뒤로',
        }}
      />
    </Stack>
  );
}
