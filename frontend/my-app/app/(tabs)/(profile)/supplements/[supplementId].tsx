import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { useReport } from '@/hooks/useReport';
import { getBodyPartImageSource } from '@/constants/bodyPartImages';

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
  const { data: report } = useReport();
  const updateMutation = useUpdateSupplement();
  const deleteMutation = useDeleteSupplement();

  // States
  const [alias, setAlias] = useState('');
  const [pillImageUrl, setPillImageUrl] = useState('');
  const [bodyPartId, setBodyPartId] = useState<number | null>(null);
  const [pillImageLoadFailed, setPillImageLoadFailed] = useState(false);
  const [dailyDose, setDailyDose] = useState(1);
  const [dosePerIntake, setDosePerIntake] = useState(1);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockNotificationEnabled, setStockNotificationEnabled] = useState(false);
  const [intakeSchedules, setIntakeSchedules] = useState<{ scheduleId?: number | null; intakeTime: string }[]>([]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);

  // Sync with Supplement data and Report recommendations
  useEffect(() => {
    if (supplement) {
      setAlias(supplement.alias);
      setPillImageUrl(supplement.pillImageUrl);
      setBodyPartId(typeof supplement.bodyPartId === 'number' ? supplement.bodyPartId : null);
      setPillImageLoadFailed(false);
      
      // Determine daily dose: Priority to Report if specified
      let initialDose = supplement.dailyDose;
      if (report?.intakeTimeRecommendations) {
        const recommendations = report.intakeTimeRecommendations.filter(r => r.userSupplementId === id);
        if (recommendations.length > 0) {
          initialDose = recommendations.length;
        }
      }
      setDailyDose(initialDose);
      
      setDosePerIntake(supplement.dosePerIntake);
      setStockQuantity(supplement.stockQuantity);
      setStockNotificationEnabled(supplement.stockNotificationEnabled);
      
      // Process schedules: ensure length matches initialDose
      let schedules = supplement.intakeSchedules.map(s => ({
        scheduleId: s.scheduleId,
        intakeTime: s.intakeTime,
      }));

      // Pad if less than daily dose
      if (schedules.length < initialDose) {
        const diff = initialDose - schedules.length;
        for (let i = 0; i < diff; i++) {
          schedules.push({ scheduleId: null, intakeTime: '' });
        }
      } else if (schedules.length > initialDose) {
        schedules = schedules.slice(0, initialDose);
      }
      
      setIntakeSchedules(schedules);
    }
  }, [supplement, report, id]);

  const handleIncreaseDose = () => {
    setDailyDose((prev) => {
      const nextDose = prev + 1;
      setIntakeSchedules((prevSchedules) => [
        ...prevSchedules, 
        { scheduleId: null, intakeTime: '' }
      ]);
      return nextDose;
    });
  };

  const handleDecreaseDose = () => {
    if (dailyDose > 1) {
      setDailyDose((prev) => {
        const nextDose = prev - 1;
        setIntakeSchedules((prevSchedules) => prevSchedules.slice(0, -1));
        return nextDose;
      });
    }
  };

  const handleSave = () => {
    // Validation
    if (intakeSchedules.some((s) => s.intakeTime === '')) {
      Alert.alert('알림', '모든 섭취 시점의 시간을 선택해 주세요.');
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
  const bodyPartImageSource = getBodyPartImageSource(bodyPartId);
  const useRemotePillImage = !!pillImageUrl?.trim() && !pillImageLoadFailed;

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="영양제 상세"
          title=""
          right={
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleDelete}>
                <AppIcon icon={Trash2} size={24} color="#ef4444" />
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
          {useRemotePillImage ? (
            <Image
              source={{ uri: pillImageUrl }}
              className="mb-5 h-[124px] w-[124px] rounded-2xl"
              style={{ backgroundColor: colors.input }}
              resizeMode="cover"
              onError={() => setPillImageLoadFailed(true)}
            />
          ) : (
            <Image
              source={bodyPartImageSource}
              className="mb-8 h-[124px] w-[124px] rounded-2xl"
              style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: `${colors.shadowDark}33` }}
              resizeMode="cover"
            />
          )}
          <View className="w-full px-4">
            <TextInput
              value={alias}
              onChangeText={setAlias}
              placeholder="별칭을 입력해 주세요"
              placeholderTextColor={`${colors.textMuted}88`}
              className="rounded-2xl px-4 py-3 text-center text-[18px] font-scdream-medium"
              style={{
                color: colors.text,
                backgroundColor: colors.input,
                borderWidth: 1,
                borderColor: `${colors.shadowDark}44`,
              }}
              maxLength={24}
            />
          </View>
        </View>

        <Text className="mb-1.5 text-base font-scdream tracking-wide" style={{ color: colors.textMuted }}>
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
          <Text className="text-[23px] font-scdream-bold" style={{ color: colors.text }}>
            {dailyDose}회
          </Text>
          <TouchableOpacity onPress={handleIncreaseDose} activeOpacity={0.88} style={smallNeuBtn()}>
            <AppIcon icon={Plus} size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text
          className="mb-1.5 mt-7 text-base font-scdream tracking-wide"
          style={{ color: colors.textMuted, alignSelf: 'flex-start' }}
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
            <Text className="text-[17px] font-scdream" style={{ color: colors.text }}>
              {index + 1}회차
            </Text>
            <View className="flex-row items-center">
              <Text
                className={
                  schedule.intakeTime
                    ? 'mr-1 text-[20px] font-scdream-bold'
                    : 'mr-1 text-[20px] font-scdream-medium'
                }
                style={{ color: schedule.intakeTime ? colors.text : `${colors.textMuted}99` }}
              >
                {schedule.intakeTime || '선택'}
              </Text>
              <AppIcon icon={ChevronRight} size={16} color={colors.textMuted} style={{ opacity: 0.6 }} />
            </View>
          </TouchableOpacity>
        ))}

        <Text
          className="mb-1.5 mt-7 text-base font-scdream tracking-wide"
          style={{ color: colors.textMuted, alignSelf: 'flex-start' }}
        >
          재고 관리
        </Text>
        <View className="border-b py-3.5" style={{ borderColor: line }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-scdream" style={{ color: colors.text }}>
              현재 재고
            </Text>
            <View className="w-[80px] items-end pr-8">
              <Text className="text-[20px] font-scdream-bold" style={{ color: colors.text }}>
                {stockQuantity}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-between border-b py-3.5" style={{ borderColor: line }}>
          <Text className="text-[17px] font-scdream" style={{ color: colors.text }}>
            재고 알림
          </Text>
          <View className="pr-4">
            <Switch
              value={stockNotificationEnabled}
              onValueChange={setStockNotificationEnabled}
              trackColor={{ false: '#d1d5db', true: colors.primary }}
            />
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>

      <View
        className="px-7 pb-6 pt-3"
        style={{
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderColor: line,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.9}
          className="h-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-[18px] font-scdream-bold" style={{ color: '#ffffff' }}>
            저장
          </Text>
        </TouchableOpacity>
      </View>

      <TimePicker
        isVisible={pickerVisible}
        title="섭취 시각 설정"
        onClose={() => setPickerVisible(false)}
        onConfirm={(selectedTime) => {
          if (activeTimeIndex !== null) {
            setIntakeSchedules((prev) => {
              const next = [...prev];
              const cur = next[activeTimeIndex];
              if (cur) {
                next[activeTimeIndex] = { ...cur, intakeTime: selectedTime };
              }
              // Sort by time, keeping empty times at the bottom
              return next.sort((a, b) => {
                if (!a.intakeTime) return 1;
                if (!b.intakeTime) return -1;
                return a.intakeTime.localeCompare(b.intakeTime);
              });
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
    paddingHorizontal: 26,
    paddingTop: 34,
    paddingBottom: 24,
  },
});
