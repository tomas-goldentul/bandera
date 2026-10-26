import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Leaderboard from '../components/Leaderboard';
import PlayerSetup from '../components/PlayerSetup';
import {
  AUTO_HINT_EVERY,
  CORRECT_POINTS,
  HINT_COST,
  ROUNDS_PER_GAME,
  ROUND_TIME,
  WRONG_PENALTY,
} from '../context/GameContext';
import { colors, ui } from '../theme';

const RULES = [
  `${ROUNDS_PER_GAME} banderas por partida, ${ROUND_TIME} segundos cada una.`,
  `Acierto: +${CORRECT_POINTS} puntos + los segundos que te sobren.`,
  `Error: −${WRONG_PENALTY} punto (podés seguir intentando).`,
  `Cada ${AUTO_HINT_EVERY}s llega una pista sola. Pedir una pista cuesta ${HINT_COST}s.`,
  'Banderas: la pista revela una letra. Capitales: borra una opción.',
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🌎</Text>
          <Text style={styles.title}>Adivina la Bandera</Text>
          <Text style={styles.subtitle}>¿Cuántos países reconocés?</Text>
        </View>

        <PlayerSetup />

        <View style={ui.card}>
          <Text style={ui.sectionTitle}>📜 Reglas</Text>
          {RULES.map((rule) => (
            <Text key={rule} style={styles.rule}>
              • {rule}
            </Text>
          ))}
        </View>

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
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
  },
  rule: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
});
