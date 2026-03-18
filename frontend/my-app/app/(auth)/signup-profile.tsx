import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '../../src/components/auth/LogoHeader';
import { SignupProfileForm } from '../../src/components/auth/SignupProfileForm';
import { colors } from '../../constants/theme/colors';

export default function SignupProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerClassName="flex-grow">
        <LogoHeader />
        <SignupProfileForm />
      </ScrollView>
    </SafeAreaView>
  );
}
