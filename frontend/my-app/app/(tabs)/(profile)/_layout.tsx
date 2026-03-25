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
      <Stack.Screen name="supplements/label-preview" />
      <Stack.Screen name="supplements/pill-guide" />
      <Stack.Screen name="supplements/pill" />
      <Stack.Screen name="supplements/confirm" />
      <Stack.Screen name="supplements/[supplementId]" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="intake-routine-edit" />
      <Stack.Screen name="myInfo/index" />
      <Stack.Screen name="myInfo/nickname" />
      <Stack.Screen name="myInfo/gender" />
      <Stack.Screen name="myInfo/birth-date" />
      <Stack.Screen name="myInfo/height" />
      <Stack.Screen name="myInfo/weight" />
      <Stack.Screen name="myInfo/password-change" />
    </Stack>
  );
}