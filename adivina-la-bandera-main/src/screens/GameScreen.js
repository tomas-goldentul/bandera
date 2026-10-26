import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CapitalOptions from '../components/CapitalOptions';
import Flag from '../components/Flag';
import GameActions from '../components/GameActions';
import GameHeader from '../components/GameHeader';
import GuessForm from '../components/GuessForm';
import HintDisplay from '../components/HintDisplay';
import RoundBanner from '../components/RoundBanner';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import { MODES, useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function GameScreen() {
  const { mode } = useGame();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <GameHeader />
          <View style={styles.stats}>
            <ScoreBoard />
            <Timer />
          </View>
          <Flag />
          <RoundBanner />
          {mode === MODES.FLAG ? (
            <>
              <HintDisplay />
              <GuessForm />
            </>
          ) : (
            <CapitalOptions />
          )}
          <GameActions />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
});
