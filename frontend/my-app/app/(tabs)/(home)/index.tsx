import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { CardContainer } from '@/src/components/common/CardContainer';
import { Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <NicknameHeader />
      <CardContainer>
        <Text>Hello</Text>
      </CardContainer>
    </ScreenContainer>
  );
}