import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { MODE_LABELS, useGame } from '../context/GameContext';
import { colors, ui } from '../theme';

export default function GameHeader() {
  const { playerName, mode, finishGame } = useGame();

  const confirmFinish = () =>
    Alert.alert('¿Terminar la partida?', 'Tu puntaje actual se guardará en el ranking.', [
      { text: 'Seguir jugando', style: 'cancel' },
      { text: 'Terminar', style: 'destructive', onPress: finishGame },
    ]);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.player} numberOfLines={1}>
          👤 {playerName}
        </Text>
        <Text style={styles.mode}>Modo {MODE_LABELS[mode]}</Text>
      </View>
      <Pressable
        onPress={confirmFinish}
        style={({ pressed }) => [ui.button, ui.buttonSecondary, styles.button, pressed && ui.pressed]}
      >
        <Text style={[ui.buttonText, ui.buttonSecondaryText, styles.buttonText]}>Terminar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  player: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  mode: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  buttonText: {
    fontSize: 14,
  },
});
