import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider, useGame } from './src/context/GameContext';
import GameOverScreen from './src/screens/GameOverScreen';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';

// La pantalla visible también sale del Context: no hay props entre componentes.
function CurrentScreen() {
  const { screen } = useGame();
  if (screen === 'game') return <GameScreen />;
  if (screen === 'gameover') return <GameOverScreen />;
  return <HomeScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <CurrentScreen />
      </GameProvider>
    </SafeAreaProvider>
  );
}
