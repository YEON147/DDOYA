import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { User, Users, CalendarDays, Ruler, Dumbbell, type LucideIcon } from 'lucide-react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { authApi } from '@/src/api/auth';
import { AppIcon } from '@/src/components/common/AppIcon';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/src/services/notificationService';
import { useMyProfile } from '@/hooks/useUser';
import { useEffect } from 'react';
import { appAlert } from '@/src/utils/appAlert';

const line = `${colors.shadowDark}44`;

type InfoRowProps = {
  label: string;
  value: string;
  Icon: LucideIcon;
  onPress: () => void;
};

function InfoRow({ label, value, Icon, onPress }: InfoRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-between border-b py-4"
      style={{ borderColor: line }}
    >
      <View className="flex-row items-center">
        <AppIcon icon={Icon} size={15} color={colors.textMuted} />
        <Text className="pl-2 pr-4 text-md font-scdream" style={{ color: colors.textMuted }}>
          {label}
        </Text>
      </View>
      <View className="flex-1 flex-row items-center justify-end">
        <Text
          className="text-right text-md font-scdream leading-5"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

type ActionRowProps = {
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function ActionRow({ label, destructive, onPress }: ActionRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-between border-b py-4"
      style={{ borderColor: line }}
    >
      <Text
        className="text-md font-scdream"
        style={{ color: destructive ? '#DC2626' : colors.text }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MyInfoScreen() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const profile = useUserProfileStore((s) => s.profile);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const { data: me } = useMyProfile();

  useEffect(() => {
    if (!me) return;
    setProfile({
      nickname: me.nickname ?? '',
      gender: me.gender === 'MALE' ? '남성' : me.gender === 'FEMALE' ? '여성' : '',
      birthDate: me.birthDate ?? '',
      heightCm: typeof me.heightCm === 'number' ? String(me.heightCm) : '',
      weightKg: typeof me.weightKg === 'number' ? String(me.weightKg) : '',
    });
  }, [me, setProfile]);

  const handlePasswordChange = () => {
    router.push('/(tabs)/(profile)/myInfo/password-change');
  };

  const handleLogout = () => {
    appAlert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            // 로그아웃 시 토큰 비활성화 먼저 시도
            const token = (await Notifications.getDevicePushTokenAsync()).data;
            if (token) {
              await notificationService.deactivateTokenOnServer(token);
            }
          } catch {
            // 토큰 비활성화 실패 시에도 로그아웃 흐름은 계속 진행
          }

          try {
            await authApi.logout();
          } catch {
            // 서버 로그아웃 실패 시에도 로컬 세션은 종료한다.
          }
          await clearToken();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    appAlert('준비 중', '회원탈퇴 기능은 추후 연결 예정입니다.');
  };

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="내 정보"
          title=""
        />
      }
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
      >
        <View className="items-center pb-9 pt-3">
          <View
            className="h-[72px] w-[72px] items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceWarm }}
          >
            <AppIcon icon={User} size={30} color={colors.textMuted} />
          </View>
          <Text
            className="mt-4 text-center text-2xl font-scdream-bold tracking-tight"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {profile.nickname || '회원'}
          </Text>
        </View>

        <Text className="mb-2 text-sm font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          계정 정보
        </Text>
        <InfoRow
          label="닉네임"
          value={profile.nickname || '-'}
          Icon={User}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/nickname')}
        />
        <InfoRow
          label="성별"
          value={profile.gender || '-'}
          Icon={Users}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/gender')}
        />
        <InfoRow
          label="생년월일"
          value={profile.birthDate || '-'}
          Icon={CalendarDays}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/birth-date')}
        />
        <InfoRow
          label="키"
          value={profile.heightCm ? `${profile.heightCm} cm` : '-'}
          Icon={Ruler}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/height')}
        />
        <InfoRow
          label="몸무게"
          value={profile.weightKg ? `${profile.weightKg} kg` : '-'}
          Icon={Dumbbell}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/weight')}
        />

        <View className="h-10" />

        <Text className="mb-2 text-sm font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          계정 관리
        </Text>
        <ActionRow label="비밀번호 변경" onPress={handlePasswordChange} />
        <ActionRow label="로그아웃" onPress={handleLogout} />
        <ActionRow label="회원탈퇴" destructive onPress={handleWithdraw} />

        <View className="h-10" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 36,
  },
});
