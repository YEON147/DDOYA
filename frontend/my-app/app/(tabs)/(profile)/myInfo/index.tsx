import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { User, Users, CalendarDays, Ruler, Dumbbell, type LucideIcon } from 'lucide-react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { authApi } from '@/src/api/auth';
import { AppIcon } from '@/src/components/common/AppIcon';

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
        <AppIcon icon={Icon} size={16} color={colors.textMuted} />
        <Text className="pl-2 pr-4 text-[14px] font-scdream" style={{ color: colors.textMuted }}>
          {label}
        </Text>
      </View>
      <View className="flex-1 flex-row items-center justify-end">
        <Text
          className="text-right text-[14px] font-scdream leading-5"
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: line,
          paddingVertical: 16,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        className="text-[14px] font-scdream"
        style={{ color: destructive ? '#DC2626' : colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function MyInfoScreen() {
  const clearToken = useAuthStore((s) => s.clearToken);
  const profile = useUserProfileStore((s) => s.profile);

  const handlePasswordChange = () => {
    router.push('/(tabs)/(profile)/myInfo/password-change');
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
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
    Alert.alert('준비 중', '회원탈퇴 기능은 추후 연결 예정입니다.');
  };

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="내 정보" />}>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
      >
        <View className="items-center pb-8 pt-2">
          <View
            className="h-[76px] w-[76px] items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceWarm }}
          >
            <AppIcon icon={User} size={34} color={colors.textMuted} />
          </View>
          <Text
            className="mt-4 text-center text-[30px] font-scdream-bold tracking-tight"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {profile.nickname}
          </Text>
          <Text className="mt-1.5 text-center text-[12px] font-scdream" style={{ color: colors.textMuted }}>
            계정에서 사용 중인 이름이에요
          </Text>
        </View>

        <Text className="mb-1 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          계정 정보
        </Text>
        <InfoRow
          label="닉네임"
          value={profile.nickname}
          Icon={User}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/nickname')}
        />
        <InfoRow
          label="성별"
          value={profile.gender}
          Icon={Users}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/gender')}
        />
        <InfoRow
          label="생년월일"
          value={profile.birthDate}
          Icon={CalendarDays}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/birth-date')}
        />
        <InfoRow
          label="키"
          value={`${profile.heightCm} cm`}
          Icon={Ruler}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/height')}
        />
        <InfoRow
          label="몸무게"
          value={`${profile.weightKg} kg`}
          Icon={Dumbbell}
          onPress={() => router.push('/(tabs)/(profile)/myInfo/weight')}
        />

        <View className="h-8" />

        <Text className="mb-1 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
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
    paddingTop: 8,
    paddingBottom: 32,
  },
});
