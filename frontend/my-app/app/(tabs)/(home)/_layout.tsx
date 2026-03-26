import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="intake-verify" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
