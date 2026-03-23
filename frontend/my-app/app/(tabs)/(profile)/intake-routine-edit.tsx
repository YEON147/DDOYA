import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { TimePicker } from '@/src/components/common/TimePicker';
import { useIntakeRoutineList, useUpdateIntakeTime } from '@/hooks/useIntakeRoutine';
import { IntakeRoutineSettingItem } from '@/src/types/intakeRoutine';

export default function IntakeRoutineEditScreen() {
  const router = useRouter();
  const { data: remoteSettings, isLoading, isError } = useIntakeRoutineList();
  const { mutateAsync: updateTime } = useUpdateIntakeTime();

  // Local state to track changes before committing
  const [localSettings, setLocalSettings] = useState<IntakeRoutineSettingItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // TimePicker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialTimeForPicker, setInitialTimeForPicker] = useState('09:00');

  useEffect(() => {
    if (remoteSettings) {
      setLocalSettings(remoteSettings);
    }
  }, [remoteSettings]);

  const handleOpenPicker = (item: IntakeRoutineSettingItem) => {
    setEditingId(item.userIntakeTimingSettingId);
    setInitialTimeForPicker(item.intakeTime);
    setPickerVisible(true);
  };

  const handleConfirmTime = (newTime: string) => {
    setLocalSettings(prev => 
      prev.map(item => 
        item.userIntakeTimingSettingId === editingId 
          ? { ...item, intakeTime: newTime } 
          : item
      )
    );
  };

  const handleSave = async () => {
    if (!remoteSettings) return;

    setIsSaving(true);
    try {
      // Find changed items
      const changedItems = localSettings.filter(local => {
        const remote = remoteSettings.find(r => r.userIntakeTimingSettingId === local.userIntakeTimingSettingId);
        return remote && remote.intakeTime !== local.intakeTime;
      });

      if (changedItems.length === 0) {
        router.back();
        return;
      }

      // Update each changed item
      await Promise.all(
        changedItems.map(item => 
          updateTime({ 
            id: item.userIntakeTimingSettingId, 
            data: { intakeTime: item.intakeTime } 
          })
        )
      );

      Alert.alert('성공', '섭취 루틴이 수정되었습니다.');
      router.back();
    } catch (error) {
      console.error('Failed to update intake routine:', error);
      Alert.alert('오류', '수정 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: colors.surface }}>
        <Text style={{ color: colors.text }}>데이터를 불러오지 못했습니다.</Text>
        <TouchableOpacity 
          className="mt-4 px-6 py-2 rounded-xl" 
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.back()}
        >
          <Text className="text-white">뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View className="px-6 pb-4 pt-14 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-[20px] font-scdream-medium" style={{ color: colors.text }}>
          섭취 루틴 수정
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6 rounded-[24px] overflow-hidden" style={neuRaised(1, colors.surface)}>
          {localSettings.map((item, index) => (
            <View 
              key={item.userIntakeTimingSettingId}
              className="flex-row items-center justify-between px-5 py-5"
              style={{
                backgroundColor: colors.surface,
                borderBottomWidth: index === localSettings.length - 1 ? 0 : 1,
                borderBottomColor: `${colors.shadowDark}22`,
              }}
            >
              <View>
                <Text className="text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                  {item.intakeTiming}
                </Text>
                <Text className="text-[18px] font-scdream-medium mt-1" style={{ color: colors.text }}>
                  {item.intakeTime}
                </Text>
              </View>

              <Pressable
                onPress={() => handleOpenPicker(item)}
                style={({ pressed }: { pressed: boolean }) => [
                  neuInset(12, colors.input),
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <Text className="font-scdream" style={{ color: colors.primary }}>변경</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View className="h-20" />
      </ScrollView>

      {/* Footer Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4" style={{ backgroundColor: colors.surface }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="h-14 items-center justify-center rounded-2xl"
          style={neuRaised(24, isSaving ? colors.textMuted : colors.primary)}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">확인</Text>
          )}
        </TouchableOpacity>
      </View>

      <TimePicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirmTime}
        initialTime={initialTimeForPicker}
      />
    </View>
  );
}
