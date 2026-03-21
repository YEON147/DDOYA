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
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TimePicker } from '@/src/components/common/TimePicker';
import { useSupplementStore } from '@/src/store/supplementStore';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';

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
  const { getSupplementById, updateSupplement } = useSupplementStore();
  const [loading, setLoading] = useState(true);

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
      const data = getSupplementById(parseInt(supplementId as string, 10));
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
    if (intakeTimes.some((time) => time === '')) {
      Alert.alert('알림', '모든 섭취 시점을 선택해 주세요.');
      return;
    }

    const uniqueTimes = new Set(intakeTimes);
    if (uniqueTimes.size !== intakeTimes.length) {
      Alert.alert('알림', '중복된 섭취 시간이 있습니다.');
      return;
    }

    const sortedTimes = [...intakeTimes].sort((a, b) => a.localeCompare(b));

    if (supplementId) {
      updateSupplement(parseInt(supplementId as string, 10), {
        daily_dose: dailyDose,
        stock_quantity: stockQuantity,
        stock_alert_enabled: stockAlertEnabled,
        intake_times: sortedTimes,
        unit,
      });
    }

    Alert.alert('성공', '수정사항이 저장되었습니다.');
    router.back();
  };

  if (loading) return null;

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          title="영양제 상세"
          right={
            <Pressable onPress={handleSave} hitSlop={12}>
              {({ pressed }) => (
                <Text
                  className="text-[14px] font-scdream-medium"
                  style={{ color: colors.primary, opacity: pressed ? 0.55 : 1 }}
                >
                  저장
                </Text>
              )}
            </Pressable>
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
            source={{ uri: imageUrl }}
            className="mb-3 h-[104px] w-[104px] rounded-2xl"
            style={{ backgroundColor: colors.input }}
            resizeMode="cover"
          />
          <Text
            className="px-4 text-center text-[16px] font-scdream-medium leading-6"
            style={{ color: colors.text }}
            numberOfLines={2}
          >
            {name}
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
            <Ionicons name="remove" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-[21px] font-scdream-bold" style={{ color: colors.text }}>
            {dailyDose}회
          </Text>
          <TouchableOpacity onPress={handleIncreaseDose} activeOpacity={0.88} style={smallNeuBtn()}>
            <Ionicons name="add" size={22} color={colors.text} />
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
              <TouchableOpacity
                onPress={() => setUnitPickerVisible(true)}
                activeOpacity={0.88}
                style={[
                  neuRaised(999, colors.input),
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    gap: 4,
                  },
                ]}
              >
                <Text className="text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                  {unit}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-between border-b py-3.5" style={{ borderColor: line }}>
          <Text className="text-[14px] font-scdream" style={{ color: colors.text }}>
            재고 알림
          </Text>
          <Switch
            value={stockAlertEnabled}
            onValueChange={setStockAlertEnabled}
            trackColor={{ false: '#d1d5db', true: colors.primary }}
          />
        </View>

        <Text
          className="mb-1 mt-7 text-[12px] font-scdream tracking-wide"
          style={{ color: colors.textMuted }}
        >
          섭취 시점
        </Text>
        {intakeTimes.map((time, index) => (
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
                style={{ color: time ? colors.text : `${colors.textMuted}99` }}
              >
                {time || '선택'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ opacity: 0.6 }} />
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
            const newTimes = [...intakeTimes];
            newTimes[activeTimeIndex] = selectedTime;
            setIntakeTimes(newTimes);
          }
        }}
        initialTime={
          activeTimeIndex !== null && intakeTimes[activeTimeIndex]
            ? intakeTimes[activeTimeIndex]
            : undefined
        }
      />

      <Modal
        visible={unitPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnitPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => setUnitPickerVisible(false)} />
          <View
            className="rounded-t-3xl px-5 pb-10 pt-4"
            style={{
              backgroundColor: colors.surface,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: line,
            }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[16px] font-scdream-medium" style={{ color: colors.text }}>
                단위
              </Text>
              <Pressable onPress={() => setUnitPickerVisible(false)} hitSlop={12}>
                {({ pressed }) => (
                  <Text
                    className="text-[14px] font-scdream-medium"
                    style={{ color: colors.primary, opacity: pressed ? 0.55 : 1 }}
                  >
                    닫기
                  </Text>
                )}
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {units.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => {
                    setUnit(u);
                    setUnitPickerVisible(false);
                  }}
                  activeOpacity={0.88}
                  className="min-w-[29%] flex-1 basis-[29%] items-center justify-center py-2.5"
                  style={[
                    neuRaised(12, unit === u ? colors.primary : colors.surface),
                    unit === u ? {} : { borderWidth: StyleSheet.hairlineWidth, borderColor: line },
                  ]}
                >
                  <Text
                    className="text-[14px] font-scdream-medium"
                    style={{ color: unit === u ? '#fff' : colors.text }}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
