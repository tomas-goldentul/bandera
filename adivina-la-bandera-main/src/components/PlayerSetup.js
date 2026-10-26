import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MODES, MODE_LABELS, useGame } from '../context/GameContext';
import { colors, ui } from '../theme';

const MODE_DESCRIPTIONS = {
  flag: 'Escribí o elegí el país de la bandera.',
  capital: 'Elegí la capital entre 3 opciones.',
};

// Antes de jugar: nombre del jugador y modo de juego.
export default function PlayerSetup() {
  const {
    playerName,
    setPlayerName,
    players,
    mode,
    setMode,
    startGame,
    loading,
    error,
    loadCountries,
    countries,
    capitalsAvailable,
  } = useGame();

  const canPlay =
    !loading && countries.length > 0 && playerName.trim().length > 0 &&
    (mode !== MODES.CAPITAL || capitalsAvailable);

  return (
    <View style={ui.card}>
      <Text style={ui.sectionTitle}>Jugador</Text>
      <TextInput
        style={ui.input}
        value={playerName}
        onChangeText={setPlayerName}
        placeholder="Tu nombre"
        placeholderTextColor={colors.muted}
        maxLength={20}
        autoCorrect={false}
        returnKeyType="done"
      />

      {players.length > 0 && (
        <View style={styles.chips}>
          {players.slice(0, 8).map((name) => {
            const selected = name.toLowerCase() === playerName.trim().toLowerCase();
            return (
              <Pressable
                key={name}
                onPress={() => setPlayerName(name)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={[ui.sectionTitle, styles.modeTitle]}>Modo de juego</Text>
      <View style={styles.modes}>
        {Object.values(MODES).map((m) => {
          const disabled = m === MODES.CAPITAL && !loading && !capitalsAvailable;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              disabled={disabled}
              style={[styles.mode, mode === m && styles.modeSelected, disabled && ui.disabled]}
            >
              <Text style={styles.modeIcon}>{m === MODES.FLAG ? '🏳️' : '🏛️'}</Text>
              <Text style={styles.modeName}>{MODE_LABELS[m]}</Text>
              <Text style={styles.modeDesc}>
                {disabled ? 'No disponible: falló la API de capitales.' : MODE_DESCRIPTIONS[m]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.status}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>Cargando países…</Text>
        </View>
      ) : error ? (
        <View style={styles.status}>
          <Text style={[styles.statusText, { color: colors.danger }]}>{error}</Text>
          <Pressable onPress={loadCountries} style={[ui.button, ui.buttonSecondary, styles.retry]}>
            <Text style={[ui.buttonText, ui.buttonSecondaryText]}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.statusText}>{countries.length} países cargados ✓</Text>
      )}

      <Pressable
        onPress={startGame}
        disabled={!canPlay}
        style={({ pressed }) => [ui.button, styles.play, !canPlay && ui.disabled, pressed && ui.pressed]}
      >
        <Text style={[ui.buttonText, styles.playText]}>¡Jugar!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#0C4A6E',
  },
  chipText: {
    color: colors.muted,
  },
  chipTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  modeTitle: {
    marginTop: 20,
  },
  modes: {
    flexDirection: 'row',
    gap: 10,
  },
  mode: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    padding: 12,
    gap: 2,
  },
  modeSelected: {
    borderColor: colors.primary,
  },
  modeIcon: {
    fontSize: 26,
  },
  modeName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  modeDesc: {
    color: colors.muted,
    fontSize: 12,
  },
  status: {
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  statusText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  retry: {
    paddingVertical: 8,
  },
  play: {
    marginTop: 16,
  },
  playText: {
    fontSize: 18,
  },
});
