import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '../context/GameContext';
import { colors } from '../theme';

export default function CapitalOptions() {
  const { currentCountry, options, removedOptions, wrongOptions, roundActive, roundResult, guessCapital } =
    useGame();
  if (!currentCountry) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.question}>
        ¿Cuál es la capital de <Text style={styles.country}>{currentCountry.name}</Text>?
      </Text>

      {options.map((option) => {
        const removed = removedOptions.includes(option);
        const wrong = wrongOptions.includes(option);
        const isAnswer = option === currentCountry.capital;
        const showCorrect = !!roundResult && isAnswer;
        const disabled = !roundActive || removed || wrong;

        return (
          <Pressable
            key={option}
            onPress={() => guessCapital(option)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.option,
              removed && styles.removed,
              wrong && styles.wrong,
              showCorrect && styles.correct,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                (removed || wrong) && styles.strike,
                showCorrect && styles.correctText,
              ]}
            >
              {wrong ? '✗ ' : showCorrect ? '✓ ' : ''}
              {option}
            </Text>
            {removed && <Text style={styles.tag}>pista</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  question: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  country: {
    fontWeight: '800',
    color: colors.primary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  pressed: {
    backgroundColor: colors.cardAlt,
  },
  removed: {
    opacity: 0.35,
  },
  wrong: {
    borderColor: colors.danger,
    opacity: 0.6,
  },
  correct: {
    borderColor: colors.success,
    backgroundColor: '#14532D',
  },
  optionText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  correctText: {
    color: '#BBF7D0',
  },
  tag: {
    color: colors.muted,
    fontSize: 12,
  },
});
