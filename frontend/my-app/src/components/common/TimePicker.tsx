import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '@/constants/theme/colors';

interface TimePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  initialTime?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialTime = '09:00',
}) => {
  const [date, setDate] = useState(() => {
    const [hours, minutes] = (initialTime || '09:00').split(':').map(Number);
    const d = new Date();
    d.setHours(hours || 9);
    d.setMinutes(minutes || 0);
    return d;
  });

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
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white rounded-t-[32px] px-8 pb-12 pt-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>알람 설정</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>취소</Text>
            </TouchableOpacity>
          </View>

          {/* Picker Area */}
          <View
            className="items-center justify-center rounded-2xl py-2 mb-10 overflow-hidden"
            style={{ backgroundColor: colors.background }}
          >
            <DateTimePicker
              value={date}
              mode="time"
              display="spinner"
              onChange={onChange}
              locale="ko-KR"
              textColor="#000000"
              style={{ width: '100%', height: 180 }}
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            className="py-4 rounded-3xl items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.text }}
          >
            <Text className="text-white text-lg font-bold">확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
