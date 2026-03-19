import { LogoHeader } from '../../src/components/auth/LogoHeader';
import { SignupProfileForm } from '../../src/components/auth/SignupProfileForm';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';

export default function SignupProfileScreen() {
  return (
    <ScreenContainer>
      <LogoHeader />
      <SignupProfileForm />
    </ScreenContainer>
  );
}
