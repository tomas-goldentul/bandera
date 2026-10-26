import { StyleSheet, Text, View } from 'react-native';

import { ROUNDS_PER_GAME, useGame } from '../context/GameContext';
import { colors, ui } from '../theme';

export default function ScoreBoard() {
  const { score, round, hits } = useGame();

  return (
    <View style={[ui.card, styles.box]}>
      <Text style={styles.label}>PUNTAJE</Text>
      <Text style={[styles.score, score < 0 && { color: colors.danger }]}>{score}</Text>
      <Text style={styles.detail}>
        Bandera {round}/{ROUNDS_PER_GAME} · {hits} ✓
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    paddingVertical: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  score: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
  },
});
