import { View } from 'react-native';
import Logo from '../../../assets/images/ddoya_logo.svg';

export function LogoHeader() {
  return (
    <View className="items-center justify-center pt-12 pb-8">
      <Logo width={220} height={76} />
    </View>
  );
}