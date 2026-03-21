import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Minus, Plus, Trash2 } from 'lucide-react-native';
import { TimePicker } from '@/src/components/common/TimePicker';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { AppIcon } from '@/src/components/common/AppIcon';
import {
  useSupplementDetail,
  useUpdateSupplement,
  useDeleteSupplement
} from '@/hooks/useSupplement';
const line = `${colors.shadowDark}44`;

const smallNeuBtn = (disabled?: boolean) => [
  neuRaised(14, colors.input),
  {
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: disabled ? 0.38 : 1,
  },
];

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
                <AppIcon icon={Trash2} size={24} color="#ef4444" />
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
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-1 items-center pb-6">
          <Image
            source={{ uri: pillImageUrl }}
            className="mb-3 h-[104px] w-[104px] rounded-2xl"
            style={{ backgroundColor: colors.input }}
            resizeMode="cover"
          />
          <Text
            className="px-4 text-center text-[16px] font-scdream-medium leading-6"
            style={{ color: colors.text }}
            numberOfLines={2}
          >
            {alias}
          </Text>
        </View>

        <Text className="mb-1.5 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          일일 섭취 횟수
        </Text>
        <View className="flex-row items-center justify-between border-b py-3.5" style={{ borderColor: line }}>
          <TouchableOpacity
            onPress={handleDecreaseDose}
            disabled={dailyDose <= 1}
            activeOpacity={0.88}
            style={smallNeuBtn(dailyDose <= 1)}
          >
            <AppIcon icon={Minus} size={22} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-[21px] font-scdream-bold" style={{ color: colors.text }}>
            {dailyDose}회
          </Text>
          <TouchableOpacity onPress={handleIncreaseDose} activeOpacity={0.88} style={smallNeuBtn()}>
            <AppIcon icon={Plus} size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text
          className="mb-1.5 mt-7 text-[12px] font-scdream tracking-wide"
          style={{ color: colors.textMuted }}
        >
          재고 관리
        </Text>
        <View className="border-b py-3.5" style={{ borderColor: line }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] font-scdream" style={{ color: colors.text }}>
              현재 재고
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[21px] font-scdream-bold" style={{ color: colors.text }}>
                {stockQuantity}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-between border-b py-3.5" style={{ borderColor: line }}>
          <Text className="text-[14px] font-scdream" style={{ color: colors.text }}>
            재고 알림
          </Text>
          <Switch
            value={stockNotificationEnabled}
            onValueChange={setStockNotificationEnabled}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
          />
        </View>

        <Text
          className="mb-1 mt-7 text-[12px] font-scdream tracking-wide"
          style={{ color: colors.textMuted }}
        >
          섭취 시점
        </Text>
        {intakeSchedules.map((schedule, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.65}
            className="flex-row items-center justify-between border-b py-3.5"
            style={{ borderColor: line }}
            onPress={() => {
              setActiveTimeIndex(index);
              setPickerVisible(true);
            }}
          >
            <Text className="text-[14px] font-scdream" style={{ color: colors.text }}>
              {index + 1}회차
            </Text>
            <View className="flex-row items-center">
              <Text
                className="mr-1 text-[14px] font-scdream-medium"
                style={{ color: schedule.intakeTime ? colors.text : `${colors.textMuted}99` }}
              >
                {schedule.intakeTime || '선택'}
              </Text>
              <AppIcon icon={ChevronRight} size={16} color={colors.textMuted} style={{ opacity: 0.6 }} />
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-8" />
      </ScrollView>

      <TimePicker
        isVisible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={(selectedTime) => {
          if (activeTimeIndex !== null) {
            setIntakeSchedules((prev) => {
              const next = [...prev];
              const cur = next[activeTimeIndex];
              if (cur) {
                next[activeTimeIndex] = { ...cur, intakeTime: selectedTime };
              }
              return next;
            });
          }
        }}
        initialTime={
          activeTimeIndex !== null && intakeSchedules[activeTimeIndex]?.intakeTime
            ? intakeSchedules[activeTimeIndex].intakeTime
            : undefined
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 24,
  },
});
