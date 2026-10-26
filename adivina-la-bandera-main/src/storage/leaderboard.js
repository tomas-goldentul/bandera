// React Native no trae `localStorage` como el navegador. Este import de
// expo-sqlite (incluido en Expo Go) instala un `localStorage` global con la
// misma API (getItem / setItem / removeItem) que persiste en el teléfono.
import 'expo-sqlite/localStorage/install';

const KEY = 'adivina-la-bandera:leaderboard';

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Si falla el guardado, el ranking sigue funcionando en memoria.
  }
}
