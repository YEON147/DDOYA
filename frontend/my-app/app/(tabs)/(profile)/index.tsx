import { router } from 'expo-router';
import { Pill, FileText, User } from 'lucide-react-native';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ProfileMenuButton } from '@/src/components/profile/ProfileMenuButton';
import { IntakeRoutine } from '@/src/components/profile/IntakeRoutine';
import { colors } from '@/constants/theme/colors';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { AppIcon } from '@/src/components/common/AppIcon';
import { View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScreenContainer>
        <NicknameHeader message="오늘도 건강한 하루를 보내세요!" messageTone="subtle" />

        <View className="mt-2 gap-2.5 px-1">
          <ProfileMenuButton
            label="내 정보"
            icon={<AppIcon icon={User} size={28} color={colors.text} />}
            onPress={() => router.push('/myInfo' as never)}
          />
          <ProfileMenuButton
            label="영양제 관리"
            icon={<AppIcon icon={Pill} size={28} color={colors.text} />}
            onPress={() => router.push('/supplements')}
          />
          <ProfileMenuButton
            label="리포트"
            icon={<AppIcon icon={FileText} size={28} color={colors.text} />}
            onPress={() => router.push('/reports')}
          />
        </View>

        <View className="mt-7">
          <IntakeRoutine />
        </View>
    </ScreenContainer>
  );
}
