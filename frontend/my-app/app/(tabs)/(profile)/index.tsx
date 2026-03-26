import { router } from 'expo-router';
import { Pill, FileText, User, Bell } from 'lucide-react-native';
import { ProfileMenuButton } from '@/src/components/profile/ProfileMenuButton';
import { IntakeRoutine } from '@/src/components/profile/IntakeRoutine';
import { colors } from '@/constants/theme/colors';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { AppIcon } from '@/src/components/common/AppIcon';
import { useAuthStore } from '@/src/store/authStore';
import { View, Text } from 'react-native';
import { neuRaised } from '@/constants/theme/neumorphism';

export default function ProfileScreen() {
  const { nickname } = useAuthStore();

  return (
    <ScreenContainer>
        <View
          className="relative mb-3 mt-1 overflow-hidden rounded-[20px] px-5 py-5"
          style={[
            neuRaised(20, colors.cardIvory),
            { borderWidth: 1, borderColor: `${colors.shadowDark}14` },
          ]}
        >
          <View className="items-center pb-5 pt-1">
            <View
              className="h-[76px] w-[76px] items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceWarm }}
            >
              <AppIcon icon={User} size={34} color={colors.textMuted} strokeWidth={1.75} />
            </View>
            <Text
              className="mt-3 text-[24px] font-scdream-bold tracking-tight"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {nickname || '회원'}
            </Text>
            <Text className="mt-3 text-[13px] font-scdream" style={{ color: colors.textMuted }}>
              DDOYA와 건강해지기 : 2일차
            </Text>
          </View>

          <View className="my-4" style={{ borderTopWidth: 1, borderColor: `${colors.shadowDark}18` }} />
          <View className="gap-0.5">
          <ProfileMenuButton
            label="내 정보"
            icon={<AppIcon icon={User} size={23} color={colors.iconMuted} strokeWidth={1.75} />}
            onPress={() => router.push('/myInfo' as never)}
            variant="flat"
            withBorder
          />
          <ProfileMenuButton
            label="영양제 관리"
            icon={<AppIcon icon={Pill} size={23} color={colors.iconMuted} strokeWidth={1.75} />}
            onPress={() => router.push('/supplements')}
            variant="flat"
            withBorder
          />
          <ProfileMenuButton
            label="알림 설정"
            icon={<AppIcon icon={Bell} size={28} color={colors.iconMuted} strokeWidth={1.75} />}
            onPress={() => router.push('/notification-settings' as never)}
          />
          <ProfileMenuButton
            label="리포트"
            icon={<AppIcon icon={FileText} size={23} color={colors.iconMuted} strokeWidth={1.75} />}
            onPress={() => router.push('/reports')}
            variant="flat"
          />
          </View>
        </View>

      <View className="mt-1">
        <IntakeRoutine />
      </View>
    </ScreenContainer>
  );
}
