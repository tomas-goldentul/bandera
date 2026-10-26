import { StyleSheet, Text, View } from 'react-native';

import { ROUND_TIME, useGame } from '../context/GameContext';
import { colors, ui } from '../theme';

export default function Timer() {
  const { timeLeft } = useGame();

  const color = timeLeft <= 5 ? colors.danger : timeLeft <= 10 ? colors.warning : colors.success;
  const percent = Math.max(0, Math.min(1, timeLeft / ROUND_TIME)) * 100;

  return (
    <View style={[ui.card, styles.box]}>
      <Text style={styles.label}>TIEMPO</Text>
      <Text style={[styles.time, { color }]}>{timeLeft}s</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
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
  time: {
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
