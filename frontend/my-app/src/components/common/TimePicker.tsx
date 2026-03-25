import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';

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
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <View
          className="rounded-t-[32px] px-8 pb-12 pt-6"
          style={{
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderColor: `${colors.shadowDark}44`,
          }}
        >
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>취소</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-10 py-2" style={neuInset(20)}>
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
            activeOpacity={0.9}
            className="items-center justify-center rounded-3xl py-4"
            style={neuRaised(24, colors.primary)}
          >
            <Text className="text-lg font-bold text-white">확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
