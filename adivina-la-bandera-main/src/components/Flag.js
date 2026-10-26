import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useGame } from '../context/GameContext';
import { colors } from '../theme';
import { flagSources } from '../utils/game';

// Wikimedia rechaza descargas sin un User-Agent descriptivo.
const IMAGE_HEADERS = { 'User-Agent': 'AdivinaLaBandera/1.0 (educational Expo project)' };

export default function Flag() {
  const { currentCountry } = useGame();
  // Cuántas URLs fallaron para el país actual (estado visual, no del juego).
  const [failed, setFailed] = useState({ iso: null, count: 0 });

  const index = failed.iso === currentCountry?.iso2 ? failed.count : 0;
  const uri = currentCountry ? flagSources(currentCountry)[index] : undefined;
  // Mismo objeto mientras no cambie la URL: el timer re-renderiza cada segundo
  // y un source nuevo haría que la imagen se vuelva a descargar.
  const source = useMemo(() => (uri ? { uri, headers: IMAGE_HEADERS } : null), [uri]);

  if (!currentCountry) return null;

  return (
    <View style={styles.frame}>
      {source ? (
        <Image
          source={source}
          style={styles.image}
          contentFit="contain"
          transition={250}
          recyclingKey={uri}
          accessibilityLabel="Bandera a adivinar"
          onError={() => setFailed({ iso: currentCountry.iso2, count: index + 1 })}
        />
      ) : (
        <Text style={styles.error}>No se pudo cargar la bandera 😕</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  error: {
    color: colors.muted,
    fontSize: 15,
  },
});
