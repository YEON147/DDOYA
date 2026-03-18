import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TimePicker } from '@/src/components/common/TimePicker';
import { useSupplementStore } from '@/src/store/supplementStore';
import { colors } from '@/constants/theme/colors';

export default function SupplementDetailScreen() {
  const { supplementId } = useLocalSearchParams();
  const router = useRouter();
  const { getSupplementById, updateSupplement } = useSupplementStore();
  const [loading, setLoading] = useState(true);

  // States
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dailyDose, setDailyDose] = useState(1);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockAlertEnabled, setStockAlertEnabled] = useState(false);
  const [intakeTimes, setIntakeTimes] = useState<string[]>([]);
  const [unit, setUnit] = useState('정');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);

  const units = ['정', '캡슐', '포', '개', 'g', 'ml'];

  useEffect(() => {
    if (supplementId) {
      const data = getSupplementById(parseInt(supplementId as string));
      if (data) {
        setName(data.name);
        setImageUrl(data.image_url);
        setDailyDose(data.daily_dose);
        setStockQuantity(data.stock_quantity);
        setStockAlertEnabled(data.stock_alert_enabled);
        setIntakeTimes([...data.intake_times]);
        setUnit(data.unit || '정');
      }
      setLoading(false);
    }
  }, [supplementId, getSupplementById]);

  const handleIncreaseDose = () => {
    setDailyDose((prev) => prev + 1);
    setIntakeTimes((prev) => [...prev, '']);
  };

  const handleDecreaseDose = () => {
    if (dailyDose > 1) {
      setDailyDose((prev) => prev - 1);
      setIntakeTimes((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    // Validation
    if (intakeTimes.some((time) => time === '')) {
      Alert.alert('알림', '모든 섭취 시점을 선택해 주세요.');
      return;
    }

    const uniqueTimes = new Set(intakeTimes);
    if (uniqueTimes.size !== intakeTimes.length) {
      Alert.alert('알림', '중복된 섭취 시간이 있습니다.');
      return;
    }

    // Sort times
    const sortedTimes = [...intakeTimes].sort((a, b) => a.localeCompare(b));

    // Persist to store
    if (supplementId) {
      updateSupplement(parseInt(supplementId as string), {
        daily_dose: dailyDose,
        stock_quantity: stockQuantity,
        stock_alert_enabled: stockAlertEnabled,
        intake_times: sortedTimes,
        unit: unit,
      });
    }

    Alert.alert('성공', '수정사항이 저장되었습니다.');
    router.back();
  };

  if (loading) return null;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surface }}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: colors.background }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>영양제 상세</Text>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Text className="font-bold text-lg" style={{ color: colors.primary }}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Basic Info */}
        <View className="items-center mb-10">
          <Image
            source={{ uri: imageUrl }}
            className="w-36 h-36 rounded-3xl mb-4"
            style={{ backgroundColor: colors.background }}
            resizeMode="cover"
          />
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>{name}</Text>
        </View>

        {/* Daily Dose */}
        <View className="mb-8">
          <Text className="text-gray-400 mb-3 font-bold">일일 섭취 횟수</Text>
          <View className="flex-row items-center justify-between p-5 rounded-3xl" style={{ backgroundColor: colors.background }}>
            <TouchableOpacity
              onPress={handleDecreaseDose}
              disabled={dailyDose <= 1}
              className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm ${dailyDose <= 1 ? 'opacity-30' : ''}`}
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="remove" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>{dailyDose}회</Text>
            <TouchableOpacity
              onPress={handleIncreaseDose}
              className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory */}
        <View className="mb-8">
          <Text className="text-gray-400 mb-3 font-bold">재고 관리</Text>
          <View className="p-5 rounded-3xl" style={{ backgroundColor: colors.background }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-medium" style={{ color: colors.text }}>현재 재고</Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold mr-2" style={{ color: colors.text }}>{stockQuantity}</Text>
                <TouchableOpacity
                  onPress={() => setUnitPickerVisible(true)}
                  className="flex-row items-center bg-white px-3 py-1 rounded-xl shadow-sm"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-gray-500 font-bold mr-1">{unit}</Text>
                  <Ionicons name="chevron-down" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-medium" style={{ color: colors.text }}>재고 알림</Text>
              <Switch
                value={stockAlertEnabled}
                onValueChange={setStockAlertEnabled}
                trackColor={{ false: '#d1d5db', true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Intake Times */}
        <View className="mb-12">
          <Text className="text-gray-400 mb-3 font-bold">섭취 시점</Text>
          {intakeTimes.map((time, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row justify-between items-center p-5 rounded-3xl mb-3 shadow-sm"
              style={{ backgroundColor: colors.background }}
              onPress={() => {
                setActiveTimeIndex(index);
                setPickerVisible(true);
              }}
            >
              <Text className="text-lg font-medium" style={{ color: colors.text }}>{index + 1}회차 섭취 시간</Text>
              <View className="flex-row items-center">
                <Text className={`text-xl font-bold mr-2 ${!time ? 'text-gray-300' : ''}`} style={{ color: time ? colors.text : undefined }}>
                  {time || '미선택'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TimePicker
          isVisible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onConfirm={(selectedTime) => {
            if (activeTimeIndex !== null) {
              const newTimes = [...intakeTimes];
              newTimes[activeTimeIndex] = selectedTime;
              setIntakeTimes(newTimes);
            }
          }}
          initialTime={(activeTimeIndex !== null && intakeTimes[activeTimeIndex]) ? intakeTimes[activeTimeIndex] : undefined}
        />

        {/* Unit Picker Modal */}
        <Modal
          visible={unitPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setUnitPickerVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setUnitPickerVisible(false)}
            />
            <View className="bg-white rounded-t-[32px] px-8 pb-12 pt-6 shadow-2xl">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold" style={{ color: colors.text }}>단위 선택</Text>
                <TouchableOpacity onPress={() => setUnitPickerVisible(false)}>
                  <Text className="text-base font-semibold" style={{ color: colors.primary }}>취소</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap justify-between">
                {units.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => {
                      setUnit(u);
                      setUnitPickerVisible(false);
                    }}
                    className="w-[30%] py-4 rounded-2xl mb-4 items-center justify-center border"
                    style={{
                      backgroundColor: unit === u ? colors.primary : colors.background,
                      borderColor: unit === u ? colors.primary : colors.background,
                    }}
                  >
                    <Text
                      className="text-lg font-bold"
                      style={{ color: unit === u ? 'white' : colors.text }}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}
