import { StyleSheet, Text, View } from 'react-native';

import { CORRECT_POINTS, MODES, WRONG_PENALTY, useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function RoundBanner() {
  const { roundResult, feedback, mode } = useGame();

  let tone = null;
  let title = '';
  let detail = '';

  if (roundResult) {
    const { type, answer, bonus, points } = roundResult;
    const solution =
      mode === MODES.CAPITAL ? `${answer.capital} (capital de ${answer.name})` : answer.name;
    if (type === 'correct') {
      tone = colors.success;
      title = `✅ ¡Correcto! +${points}`;
      detail = `${solution} · ${CORRECT_POINTS} pts + ${bonus}s de bonus`;
    } else if (type === 'timeout') {
      tone = colors.warning;
      title = '⏰ ¡Se acabó el tiempo!';
      detail = `Era: ${solution}`;
    } else {
      tone = colors.muted;
      title = '⏭ Pasaste esta bandera';
      detail = `Era: ${solution}`;
    }
  } else if (feedback) {
    tone = colors.danger;
    title = `❌ Incorrecto  −${WRONG_PENALTY}`;
    detail = `"${feedback.text}" no es la respuesta`;
  }

  return (
    <View style={[styles.banner, tone && { borderColor: tone, backgroundColor: `${tone}22` }]}>
      {tone ? (
        <>
          <Text style={[styles.title, { color: tone }]}>{title}</Text>
          <Text style={styles.detail} numberOfLines={2}>
            {detail}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  detail: {
    color: colors.text,
    fontSize: 14,
    marginTop: 2,
  },
});
