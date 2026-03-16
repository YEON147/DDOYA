import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '../../src/components/auth/LogoHeader';
import { LoginForm } from '../../src/components/auth/LoginForm';
import { colors } from '../../constants/theme/colors';

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerClassName="flex-grow">
        <LogoHeader />
        <LoginForm />
      </ScrollView>
    </SafeAreaView>
  );
}
