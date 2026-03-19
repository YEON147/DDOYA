import { router } from 'expo-router';
import { Pill, FileText, User } from 'lucide-react-native';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ProfileMenuButton } from '@/src/components/profile/ProfileMenuButton';
import { IntakeRoutine } from '@/src/components/profile/IntakeRoutine';
import { colors } from '@/constants/theme/colors';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { CardContainer } from '@/src/components/common/CardContainer';
import { View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScreenContainer>
        <NicknameHeader message="오늘도 건강한 하루 보내세요!" />
        
        <View className="flex-row justify-around py-8">
          <ProfileMenuButton
            label="영양제 관리"
            icon={<Pill size={28} color={colors.text} />}
            onPress={() => router.push('/supplements')}
          />
          <ProfileMenuButton
            label="리포트"
            icon={<FileText size={28} color={colors.text} />}
            onPress={() => router.push('/reports')}
          />
          <ProfileMenuButton
            label="내 정보"
            icon={<User size={28} color={colors.text} />}
            onPress={() => router.push('/my-info')}
          />
        </View>

        <IntakeRoutine />
    </ScreenContainer>
  );
}
