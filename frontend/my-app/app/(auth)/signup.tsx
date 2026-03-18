import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '../../src/components/auth/LogoHeader';
import { SignupForm } from '../../src/components/auth/SignupForm';
import { colors } from '../../constants/theme/colors';

export default function SignupScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerClassName="flex-grow">
        <LogoHeader />
        <SignupForm />
      </ScrollView>
    </SafeAreaView>
  );
}
