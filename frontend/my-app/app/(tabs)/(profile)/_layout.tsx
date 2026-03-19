import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="supplements/index" />
      <Stack.Screen name="supplements/create" />
      <Stack.Screen name="supplements/[supplementId]" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="my-info" />
    </Stack>
  );
}