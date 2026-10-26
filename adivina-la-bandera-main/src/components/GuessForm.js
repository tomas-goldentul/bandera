import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useGame } from '../context/GameContext';
import { colors, ui } from '../theme';
import { normalize } from '../utils/game';

const MAX_SUGGESTIONS = 5;

// Input para escribir el país, con sugerencias para seleccionarlo.
export default function GuessForm() {
  const { countries, currentCountry, round, roundActive, guess } = useGame();
  // Lo que el jugador está tipeando: estado local del input, no del juego.
  const [text, setText] = useState('');
  const [roundKey, setRoundKey] = useState(null);

  // Limpiar el input cuando aparece una bandera nueva.
  const currentKey = `${round}-${currentCountry?.iso2}`;
  if (currentKey !== roundKey) {
    setRoundKey(currentKey);
    setText('');
  }

  const query = normalize(text);
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return countries
      .map((c) => ({ name: c.name, key: normalize(c.name) }))
      .filter((c) => c.key.includes(query))
      .sort((a, b) => Number(b.key.startsWith(query)) - Number(a.key.startsWith(query)))
      .slice(0, MAX_SUGGESTIONS);
  }, [countries, query]);

  const submit = (value) => {
    if (!roundActive || !normalize(value)) return;
    if (guess(value)) setText('');
    else setText(value);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          style={[ui.input, styles.input]}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => submit(text)}
          placeholder="¿De qué país es? (en inglés)"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="send"
          submitBehavior="submit"
        />
        <Pressable
          onPress={() => submit(text)}
          disabled={!roundActive || !query}
          style={({ pressed }) => [
            ui.button,
            styles.send,
            (!roundActive || !query) && ui.disabled,
            pressed && ui.pressed,
          ]}
        >
          <Text style={ui.buttonText}>Arriesgar</Text>
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map((s) => (
            <Pressable
              key={s.name}
              onPress={() => submit(s.name)}
              disabled={!roundActive}
              style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
            >
              <Text style={styles.suggestionText}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
  },
  send: {
    paddingHorizontal: 14,
  },
  suggestions: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionPressed: {
    backgroundColor: colors.cardAlt,
  },
  suggestionText: {
    color: colors.text,
    fontSize: 16,
  },
});
