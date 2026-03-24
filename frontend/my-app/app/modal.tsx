import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { colors } from '@/constants/theme/colors';

export default function ModalScreen() {
  return (
    <ScreenContainer scrollable={false} padding={0}>
      <View style={styles.container}>
        <Text className="text-xl font-scdream-medium" style={{ color: colors.text }}>
          This is a modal
        </Text>
        <Link href="/" dismissTo style={styles.link}>
          <Text className="text-base font-scdream-medium" style={{ color: colors.primary }}>
            Go to home screen
          </Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
