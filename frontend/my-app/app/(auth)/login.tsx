import { LogoHeader } from '../../src/components/auth/LogoHeader';
import { LoginForm } from '../../src/components/auth/LoginForm';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';

export default function LoginScreen() {
  return (
    <ScreenContainer>
      <LogoHeader />
      <LoginForm />
    </ScreenContainer>
  );
}
