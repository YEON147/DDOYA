import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Pill, FileText, User } from 'lucide-react-native';
import { NicknameHeader } from '@/src/components/profile/NicknameHeader';
import { ProfileMenuButton } from '@/src/components/profile/ProfileMenuButton';
import { IntakeRoutine } from '@/src/components/profile/IntakeRoutine';
import { colors } from '@/constants/theme/colors';

export default function ProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-[#F5F6F7]">
      <View className="pt-12 pb-8"></View>
      {/* Upper Greeting */}
      <NicknameHeader />

      {/* Menu Buttons Area */}
      <View className="flex-row justify-around px-4 py-8 bg-white mx-6 rounded-3xl shadow-sm">
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

      {/* Intake Routine Area */}
      <IntakeRoutine />
    </ScrollView>
  );
}
