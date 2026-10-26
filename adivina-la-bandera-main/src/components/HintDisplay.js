import { StyleSheet, Text, View } from 'react-native';

import { useGame } from '../context/GameContext';
import { colors } from '../theme';
import { isLetter } from '../utils/game';


export default function HintDisplay() {
  const { currentCountry, revealed, roundActive } = useGame();
  if (!currentCountry) return null;

  const chars = [...currentCountry.name].map((char, index) => ({ char, index }));
  const words = [];
  let word = [];
  chars.forEach((item) => {
    if (item.char === ' ') {
      if (word.length) words.push(word);
      word = [];
    } else {
      word.push(item);
    }
  });
  if (word.length) words.push(word);

  return (
    <View style={styles.wrap} accessibilityLabel="Pista del nombre del país">
      {words.map((w, wi) => (
        <View key={wi} style={styles.word}>
          {w.map(({ char, index }) => {
            const letter = isLetter(char);
            const visible = !letter || !roundActive || revealed.includes(index);
            const isHint = letter && roundActive && revealed.includes(index);
            return (
              <View key={index} style={[letter ? styles.box : styles.symbol, isHint && styles.boxHint]}>
                <Text style={[styles.char, isHint && styles.charHint]}>
                  {visible ? char.toUpperCase() : ''}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 14,
    rowGap: 8,
  },
  word: {
    flexDirection: 'row',
    gap: 3,
  },
  box: {
    width: 22,
    height: 30,
    borderBottomWidth: 3,
    borderBottomColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxHint: {
    borderBottomColor: colors.gold,
  },
  symbol: {
    height: 30,
    justifyContent: 'center',
  },
  char: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  charHint: {
    color: colors.gold,
  },
});
