import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { AppButton } from '@/src/components/common/AppButton';
import { AppIcon } from '@/src/components/common/AppIcon';

export default function MyInfoBirthDateScreen() {
  const birthDate = useUserProfileStore((s) => s.profile.birthDate);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const [value, setValue] = useState(birthDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() => {
    if (birthDate) {
      const parsed = new Date(birthDate);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return new Date(2000, 0, 1);
  });
  const isValid = value.trim().length > 0;

  const formatBirthDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openBirthDatePicker = () => {
    if (value) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) setTempDate(parsed);
    }
    setIsDatePickerOpen((prev) => !prev);
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) return;
    setTempDate(selectedDate);
    setValue(formatBirthDate(selectedDate));
    if (Platform.OS === 'android') {
      setIsDatePickerOpen(false);
    }
  };

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('생년월일', '생년월일을 입력해주세요.');
      return;
    }
    setProfile({ birthDate: value.trim() });
    router.back();
  };

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="생년월일 변경"
          title=""
        />
      }
    >
      <View className="flex-1 w-full items-center px-6 pb-6 pt-6">
        <View className="w-full max-w-[340px] flex-1">
          <Text className="mb-2 ml-1 text-sm font-scdream tracking-wide" style={{ color: colors.textMuted }}>
            생년월일 변경
          </Text>
          <Pressable onPress={openBirthDatePicker} className="px-4" style={neuInset(16)}>
            <View className="h-[52px] flex-row items-center justify-between">
              <Text
                className="text-sm font-scdream"
                style={{ color: value ? colors.text : colors.textMuted }}
              >
                {value || '생년월일을 선택해주세요'}
              </Text>
              <AppIcon icon={CalendarDays} size={16} color={colors.textMuted} />
            </View>
          </Pressable>
          {isDatePickerOpen ? (
            <View className="px-4 pt-1">
              <View className="items-center rounded-2xl py-2" style={neuInset(16, colors.input)}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  locale="ko-KR"
                  style={{ width: '100%', height: 180 }}
                  textColor={colors.text}
                />
              </View>
              {Platform.OS === 'ios' ? (
                <View className="mt-2 flex-row justify-end">
                  <TouchableOpacity
                    className="rounded-xl px-4 py-2"
                    style={neuInset(12, colors.surface)}
                    onPress={() => setIsDatePickerOpen(false)}
                  >
                    <Text className="text-sm font-scdream-medium" style={{ color: colors.textMuted }}>
                      닫기
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}
          <AppButton
            title="저장"
            variant={isValid ? 'primary' : 'disabled'}
            onPress={handleSave}
            disabled={!isValid}
            className="mt-auto mb-[10px] h-[56px] w-full"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
