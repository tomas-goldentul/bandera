import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Leaderboard from '../components/Leaderboard';
import { MODE_LABELS, ROUNDS_PER_GAME, useGame } from '../context/GameContext';
import { colors, ui } from '../theme';

export default function GameOverScreen() {
  const { playerName, mode, score, hits, leaderboard, newRecord, startGame, goHome } = useGame();

  const ranking = leaderboard
    .filter((e) => e.mode === mode)
    .sort((a, b) => b.best - a.best || b.games - a.games);
  const position = ranking.findIndex((e) => e.name.toLowerCase() === playerName.toLowerCase()) + 1;
  const record = ranking[position - 1]?.best ?? score;
  const isRecord = newRecord;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[ui.card, styles.summary]}>
          <Text style={styles.emoji}>{isRecord ? '🏆' : '🏁'}</Text>
          <Text style={styles.title}>¡Fin de la partida!</Text>
          <Text style={styles.player}>
            {playerName} · {MODE_LABELS[mode]}
          </Text>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.points}>puntos</Text>
          <Text style={styles.detail}>
            Acertaste {hits} de {ROUNDS_PER_GAME}
          </Text>
          <Text style={[styles.detail, isRecord && styles.record]}>
            {isRecord ? '¡Nuevo récord personal!' : `Tu récord: ${record}`}
            {position > 0 ? ` · Puesto #${position}` : ''}
          </Text>
        </View>

        <Pressable onPress={startGame} style={({ pressed }) => [ui.button, pressed && ui.pressed]}>
          <Text style={ui.buttonText}>Jugar otra vez</Text>
        </Pressable>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [ui.button, ui.buttonSecondary, pressed && ui.pressed]}
        >
          <Text style={[ui.buttonText, ui.buttonSecondaryText]}>Cambiar jugador o modo</Text>
        </Pressable>

        <Leaderboard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  summary: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  player: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  score: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '900',
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  points: {
    color: colors.muted,
    marginTop: -6,
  },
  detail: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 8,
  },
  record: {
    color: colors.gold,
    fontWeight: '800',
  },
});
