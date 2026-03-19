import { LogoHeader } from '../../src/components/auth/LogoHeader';
import { SignupForm } from '../../src/components/auth/SignupForm';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';

export default function SignupScreen() {
  return (
    <ScreenContainer>
      <LogoHeader />
      <SignupForm />
    </ScreenContainer>
  );
}
