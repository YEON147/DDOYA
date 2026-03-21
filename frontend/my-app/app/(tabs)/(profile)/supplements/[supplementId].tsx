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
import { colors } from '@/constants/theme/colors';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import {
  useSupplementDetail,
  useUpdateSupplement,
  useDeleteSupplement
} from '@/src/hooks/useSupplement';
import { IntakeScheduleItem } from '@/src/types/types';

export default function SupplementDetailScreen() {
  const { supplementId } = useLocalSearchParams();
  const router = useRouter();

  const id = parseInt(supplementId as string);
  const { data: supplement, isLoading: detailLoading } = useSupplementDetail(id);
  const updateMutation = useUpdateSupplement();
  const deleteMutation = useDeleteSupplement();

  // States
  const [alias, setAlias] = useState('');
  const [pillImageUrl, setPillImageUrl] = useState('');
  const [dailyDose, setDailyDose] = useState(1);
  const [dosePerIntake, setDosePerIntake] = useState(1);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockNotificationEnabled, setStockNotificationEnabled] = useState(false);
  const [intakeSchedules, setIntakeSchedules] = useState<{ userSupplementScheduleId?: number | null; intakeTime: string }[]>([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);

  useEffect(() => {
    if (supplement) {
      setAlias(supplement.alias);
      setPillImageUrl(supplement.pillImageUrl);
      setDailyDose(supplement.dailyDose);
      setDosePerIntake(supplement.dosePerIntake);
      setStockQuantity(supplement.stockQuantity);
      setStockNotificationEnabled(supplement.stockNotificationEnabled);
      setIntakeSchedules(supplement.intakeSchedules.map(s => ({
        userSupplementScheduleId: s.userSupplementScheduleId,
        intakeTime: s.intakeTime,
      })));
    }
  }, [supplement]);

  const handleIncreaseDose = () => {
    setDailyDose((prev) => prev + 1);
    setIntakeSchedules((prev) => [...prev, { userSupplementScheduleId: null, intakeTime: '' }]);
  };

  const handleDecreaseDose = () => {
    if (dailyDose > 1) {
      setDailyDose((prev) => prev - 1);
      setIntakeSchedules((prev) => prev.slice(0, -1));
    }
  };

  const handleSave = () => {
    // Validation
    if (intakeSchedules.some((s) => s.intakeTime === '')) {
      Alert.alert('알림', '모든 섭취 시점을 선택해 주세요.');
      return;
    }

    const uniqueTimes = new Set(intakeSchedules.map(s => s.intakeTime));
    if (uniqueTimes.size !== intakeSchedules.length) {
      Alert.alert('알림', '중복된 섭취 시간이 있습니다.');
      return;
    }

    // Sort schedules by time
    const sortedSchedules = [...intakeSchedules].sort((a, b) => a.intakeTime.localeCompare(b.intakeTime));

    updateMutation.mutate({
      id,
      data: {
        alias,
        dailyDose,
        dosePerIntake,
        stockQuantity,
        stockNotificationEnabled,
        intakeSchedules: sortedSchedules,
      }
    }, {
      onSuccess: () => {
        Alert.alert('성공', '수정사항이 저장되었습니다.');
        router.back();
      },
      onError: () => {
        Alert.alert('오류', '저장에 실패했습니다.');
      }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      '영양제 삭제',
      '정말로 삭제하시겠습니까?',
      [
        { text: '아니요', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                Alert.alert('성공', '삭제되었습니다.');
                router.replace('/(tabs)/(profile)/supplements');
              },
              onError: () => {
                Alert.alert('오류', '삭제에 실패했습니다.');
              }
            });
          }
        },
      ]
    );
  };

  if (detailLoading || !supplement) return null;

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          title="영양제 상세"
          right={
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleDelete} className="mr-4">
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text className="font-bold text-lg" style={{ color: colors.primary }}>
                  저장
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      }
    >

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Basic Info */}
        <View className="items-center mb-10">
          <Image
            source={{ uri: pillImageUrl }}
            className="w-36 h-36 rounded-3xl mb-4"
            style={{ backgroundColor: colors.background }}
            resizeMode="cover"
          />
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>{alias}</Text>
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
                <View
                  className="flex-row items-center bg-white px-3 py-1 rounded-xl shadow-sm"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text className="text-gray-500 font-bold mr-1">정</Text>
                </View>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-medium" style={{ color: colors.text }}>재고 알림</Text>
              <Switch
                value={stockNotificationEnabled}
                onValueChange={setStockNotificationEnabled}
                trackColor={{ false: '#d1d5db', true: colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Intake Times */}
        <View className="mb-12">
          <Text className="text-gray-400 mb-3 font-bold">섭취 시점</Text>
          {intakeSchedules.map((schedule, index) => (
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
                <Text className={`text-xl font-bold mr-2 ${!schedule.intakeTime ? 'text-gray-300' : ''}`} style={{ color: schedule.intakeTime ? colors.text : undefined }}>
                  {schedule.intakeTime || '미선택'}
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
              const newSchedules = [...intakeSchedules];
              newSchedules[activeTimeIndex] = { ...newSchedules[activeTimeIndex], intakeTime: selectedTime };
              setIntakeSchedules(newSchedules);
            }
          }}
          initialTime={(activeTimeIndex !== null && intakeSchedules[activeTimeIndex]?.intakeTime) ? intakeSchedules[activeTimeIndex].intakeTime : undefined}
        />

      </ScrollView>
    </ScreenContainer>
  );
}
