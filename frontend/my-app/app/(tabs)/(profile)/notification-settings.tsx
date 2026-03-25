import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { TimePicker } from '@/src/components/common/TimePicker';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';
import { notificationApi, NotificationSettings } from '@/src/api/notification';

/**
 * 알림 설정 화면
 * - 섭취 알림, 재고 알림, 챙김 알림 활성화 여부를 관리합니다.
 * - 기존 프로필 메뉴 구성 방식을 참고하여 Neumorphism 디자인을 적용했습니다.
 */
export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    intakeNotificationEnabled: true,
    stockNotificationEnabled: true,
    carryNotificationEnabled: true,
  });
  const [carryTime, setCarryTime] = useState<string | null>(null);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 설정 로드
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await notificationApi.getNotificationSettings();
        if (response.data && response.data.data) {
          setSettings(response.data.data);
        }
        
        // 챙김 알림 시각 추가 조회
        const timeResponse = await notificationApi.getCarryNotificationTime();
        if (timeResponse.data && timeResponse.data.data) {
          setCarryTime(timeResponse.data.data.carry_notification_time);
        }
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
        // API 미구현 시에도 UI 테스트를 위해 에러 처리는 생략 가능하지만, 사용자 경험을 위해 기본값 유지
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 설정 변경 핸들러
  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    try {
      if (key === 'intakeNotificationEnabled') {
        await notificationApi.updateIntakeNotificationSetting(value);
      } else if (key === 'stockNotificationEnabled') {
        await notificationApi.updateStockNotificationSetting(value);
      } else if (key === 'carryNotificationEnabled') {
        await notificationApi.updateCarryNotificationSetting(value);
      }
    } catch (error) {
      console.error(`${key} 업데이트 실패:`, error);
      Alert.alert('오류', '알림 설정을 저장하지 못했습니다.');
      // 실패 시 롤백
      setSettings(settings);
    }
  };

  // 챙김 시각 변경 핸들러
  const handleCarryTimeChange = async (selectedTime: string) => {
    try {
      await notificationApi.updateCarryNotificationTime(selectedTime);
      setCarryTime(selectedTime);
    } catch (error) {
      console.error('챙김 알림 시각 업데이트 실패:', error);
      Alert.alert('오류', '알림 시각을 저장하지 못했습니다.');
    } finally {
      setIsTimePickerVisible(false);
    }
  };

  if (isLoading) return null;

  return (
    <ScreenContainer>
      <NicknameHeader message="알림 설정을 관리하세요" messageTone="subtle" />

      <View className="mt-4 gap-4 px-1">
        {/* 섭취 알림 설정 */}
        <SettingItem
          label="섭취 알림"
          description="정해진 섭취 시간에 맞춰 알림을 보내드려요."
          value={settings.intakeNotificationEnabled}
          onValueChange={(val) => handleToggle('intakeNotificationEnabled', val)}
        />

        {/* 재고 알림 설정 */}
        <SettingItem
          label="재고 알림"
          description="영양제 재고가 10개 이하로 남으면 알려드려요."
          value={settings.stockNotificationEnabled}
          onValueChange={(val) => handleToggle('stockNotificationEnabled', val)}
        />

        {/* 챙김 알림 설정 */}
        <SettingItem
          label="챙김 알림"
          description="매일 정해진 챙김 시간에 알림을 보내드려요."
          value={settings.carryNotificationEnabled}
          onValueChange={(val) => handleToggle('carryNotificationEnabled', val)}
        />

        {/* 챙김 알림 시각 설정 (챙김 알림이 활성화되어 있을 때만 표시) */}
        {settings.carryNotificationEnabled && (
          <View 
            className="flex-row items-center justify-between rounded-2xl px-5 py-5" 
            style={neuRaised(16, colors.surface)}
          >
            <View>
              <Text className="text-[16px] font-scdream-bold mb-1" style={{ color: colors.text }}>
                챙김 알림 시각
              </Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => setIsTimePickerVisible(true)}
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Text className="text-[16px] font-scdream-bold" style={{ color: colors.primary }}>
                {carryTime || '설정 필요'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TimePicker
        isVisible={isTimePickerVisible}
        title="챙김 알림 시각 설정"
        initialTime={carryTime || '22:00'}
        onClose={() => setIsTimePickerVisible(false)}
        onConfirm={handleCarryTimeChange}
      />
    </ScreenContainer>
  );
}

/** 
 * 개별 설정 항목 컴포넌트 
 * - Neumorphism 'raised' 스타일을 적용하여 일관성을 유지합니다.
 */
function SettingItem({ 
  label, 
  description, 
  value, 
  onValueChange 
}: { 
  label: string; 
  description: string; 
  value: boolean; 
  onValueChange: (val: boolean) => void; 
}) {
  return (
    <View 
      className="flex-row items-center rounded-2xl px-5 py-5" 
      style={neuRaised(16, colors.surface)}
    >
      <View className="flex-1 mr-3">
        <Text className="text-[16px] font-scdream-bold mb-1" style={{ color: colors.text }}>
          {label}
        </Text>
        <Text className="text-[12px] font-scdream-regular" style={{ color: colors.textMuted }}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D1D1', true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
