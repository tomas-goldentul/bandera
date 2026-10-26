import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HINT_COST, MODES, useGame } from '../context/GameContext';
import { ui } from '../theme';

// Botones de pista y de pasar al siguiente país.
export default function GameActions() {
  const { mode, canHint, requestHint, roundActive, skipCountry } = useGame();
  const hintLabel = mode === MODES.FLAG ? 'Revelar letra' : 'Borrar opción';

  return (
    <View style={styles.row}>
      <Pressable
        onPress={requestHint}
        disabled={!canHint}
        style={({ pressed }) => [ui.button, styles.hint, !canHint && ui.disabled, pressed && ui.pressed]}
      >
        <Text style={ui.buttonText}>
          💡 {hintLabel} (−{HINT_COST}s)
        </Text>
      </Pressable>
      <Pressable
        onPress={skipCountry}
        disabled={!roundActive}
        style={({ pressed }) => [
          ui.button,
          ui.buttonSecondary,
          styles.skip,
          !roundActive && ui.disabled,
          pressed && ui.pressed,
        ]}
      >
        <Text style={[ui.buttonText, ui.buttonSecondaryText]}>Pasar ⏭</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  hint: {
    flex: 1,
    backgroundColor: '#FACC15',
  },
  skip: {
    paddingHorizontal: 18,
  },
});
