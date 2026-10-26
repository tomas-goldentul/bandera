import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { useGame } from '../context/GameContext';
import { colors } from '../theme';
import { flagSources } from '../utils/game';

const IMAGE_HEADERS = { 'User-Agent': 'AdivinaLaBandera/1.0 (educational Expo project)' };

export default function Flag() {
  const { currentCountry } = useGame();
  const [failed, setFailed] = useState({ iso: null, count: 0 });

  const index = failed.iso === currentCountry?.iso2 ? failed.count : 0;
  const uri = currentCountry ? flagSources(currentCountry)[index] : undefined;

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
        <Text style={styles.error}>No se pudo cargar la bandera </Text>
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
