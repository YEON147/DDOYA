import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised, softWellnessCard } from '@/constants/theme/neumorphism';

interface TimePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  initialTime?: string;
  title?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialTime = '09:00',
  title = '알람 설정',
}) => {
  const [date, setDate] = React.useState(new Date());

  // Sync internal date state when modal opens or initialTime changes
  React.useEffect(() => {
    if (isVisible) {
      const [hours, minutes] = (initialTime || '09:00').split(':').map(Number);
      const d = new Date();
      d.setHours(hours || 9);
      d.setMinutes(minutes || 0);
      d.setSeconds(0);
      d.setMilliseconds(0);
      setDate(d);
    }
  }, [isVisible, initialTime]);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    onConfirm(`${hours}:${minutes}`);
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: `${colors.brown}55` }}>
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <View
          className="rounded-t-[32px] px-8 pb-12 pt-7"
          style={[
            softWellnessCard(32),
            {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              backgroundColor: colors.cardIvory,
            },
          ]}
        >
          <View className="mb-1 h-1 w-10 self-center rounded-full" style={{ backgroundColor: `${colors.primary}44` }} />
          <View className="mb-5 mt-4 flex-row items-center justify-between">
            <Text className="text-xl font-scdream-bold" style={{ color: colors.brown }}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text className="text-base font-scdream-medium" style={{ color: colors.textMuted }}>
                취소
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-10 py-2" style={neuInset(20, colors.input)}>
            <View className="items-center justify-center">
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                onChange={onChange}
                locale="ko-KR"
                textColor={colors.text}
                style={{ width: '100%', height: 180 }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.92}
            className="h-14 items-center justify-center rounded-full"
            style={neuRaised(28, colors.point)}
          >
            <Text className="text-lg font-scdream text-white">확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
