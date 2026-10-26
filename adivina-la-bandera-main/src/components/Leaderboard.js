import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { MODES, MODE_LABELS, useGame } from '../context/GameContext';
import { colors, ui } from '../theme';

const MEDALS = ['🥇', '🥈', '🥉'];
const MAX_ROWS = 10;

export default function Leaderboard() {
  const { leaderboard, mode, playerName, clearLeaderboard } = useGame();
  const [tab, setTab] = useState(mode);

  const rows = leaderboard
    .filter((e) => e.mode === tab)
    .sort((a, b) => b.best - a.best || b.games - a.games)
    .slice(0, MAX_ROWS);

  const confirmClear = () =>
    Alert.alert('¿Borrar el ranking?', 'Se eliminan los puntajes de todos los jugadores.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: clearLeaderboard },
    ]);

  return (
    <View style={ui.card}>
      <Text style={ui.sectionTitle}>🏆 Ranking</Text>

      <View style={styles.tabs}>
        {Object.values(MODES).map((m) => (
          <Pressable
            key={m}
            onPress={() => setTab(m)}
            style={[styles.tab, tab === m && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === m && styles.tabTextActive]}>{MODE_LABELS[m]}</Text>
          </Pressable>
        ))}
      </View>

      {rows.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay partidas en este modo. ¡Sé el primero!</Text>
      ) : (
        <>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.pos, styles.headerText]}>#</Text>
            <Text style={[styles.name, styles.headerText]}>Jugador</Text>
            <Text style={[styles.num, styles.headerText]}>Récord</Text>
            <Text style={[styles.num, styles.headerText]}>Partidas</Text>
          </View>
          {rows.map((e, i) => {
            const isMe = e.name.toLowerCase() === playerName.trim().toLowerCase();
            return (
              <View key={`${e.mode}-${e.name}`} style={[styles.row, isMe && styles.me]}>
                <Text style={styles.pos}>{MEDALS[i] ?? i + 1}</Text>
                <Text style={[styles.name, isMe && styles.meText]} numberOfLines={1}>
                  {e.name}
                </Text>
                <Text style={[styles.num, styles.best]}>{e.best}</Text>
                <Text style={styles.num}>{e.games}</Text>
              </View>
            );
          })}
        </>
      )}

      {leaderboard.length > 0 && (
        <Pressable onPress={confirmClear} style={styles.clear}>
          <Text style={styles.clearText}>Borrar ranking</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.cardAlt,
  },
  tabText: {
    color: colors.muted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  headerRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    borderRadius: 0,
  },
  headerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  me: {
    backgroundColor: '#0C4A6E',
  },
  pos: {
    width: 36,
    color: colors.text,
    fontSize: 16,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  meText: {
    fontWeight: '800',
  },
  num: {
    width: 64,
    textAlign: 'right',
    color: colors.muted,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  best: {
    color: colors.text,
    fontWeight: '800',
  },
  clear: {
    alignSelf: 'center',
    marginTop: 12,
    padding: 6,
  },
  clearText: {
    color: colors.danger,
    fontSize: 13,
  },
});
