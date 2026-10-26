import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { loadLeaderboard, saveLeaderboard } from '../storage/leaderboard';
import {
  acceptedAnswers,
  buildCapitalOptions,
  letterIndexes,
  normalize,
  randomItem,
} from '../utils/game';

const FLAGS_URL = 'https://countriesnow.space/api/v0.1/countries/flag/images';
const CAPITALS_URL = 'https://countriesnow.space/api/v0.1/countries/capital';

export const MODES = { FLAG: 'flag', CAPITAL: 'capital' };
export const MODE_LABELS = { flag: 'Banderas', capital: 'Capitales' };

export const ROUND_TIME = 15; 
export const ROUNDS_PER_GAME = 10; 
export const HINT_COST = 2; 
export const AUTO_HINT_EVERY = 5;
export const CORRECT_POINTS = 10;
export const WRONG_PENALTY = 1;
const RESULT_DELAY = 1800; 

const GameContext = createContext(null);

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.error || !Array.isArray(json.data)) throw new Error(json.msg || 'Respuesta inválida');
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}


async function fetchCountries() {
  const [flagsRes, capitalsRes] = await Promise.allSettled([
    fetchJson(FLAGS_URL),
    fetchJson(CAPITALS_URL),
  ]);
  if (flagsRes.status === 'rejected') throw flagsRes.reason;

  const capitalByIso = new Map();
  if (capitalsRes.status === 'fulfilled') {
    capitalsRes.value.forEach((c) => {
      if (c.iso2 && c.capital?.trim()) capitalByIso.set(c.iso2, c.capital.trim());
    });
  }

  return flagsRes.value
    .filter((c) => c.name?.trim() && c.flag?.trim())
    .map((c) => ({
      name: c.name.trim(),
      flag: c.flag.trim(),
      iso2: c.iso2,
      iso3: c.iso3,
      capital: capitalByIso.get(c.iso2) ?? null,
    }));
}

function vibrate(type) {
  Haptics.notificationAsync(type).catch(() => {});
}

export function GameProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [screen, setScreen] = useState('home'); 
  const [mode, setMode] = useState(MODES.FLAG);
  const [playerName, setPlayerName] = useState('');
  const [currentCountry, setCurrentCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [hits, setHits] = useState(0);
  const [roundResult, setRoundResult] = useState(null); 
  const [feedback, setFeedback] = useState(null); 

  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [elapsed, setElapsed] = useState(0);

  const [revealed, setRevealed] = useState([]); // índices de letras visibles (modo banderas)
  const [options, setOptions] = useState([]); // opciones de capital (modo capitales)
  const [removedOptions, setRemovedOptions] = useState([]); // borradas por pistas
  const [wrongOptions, setWrongOptions] = useState([]); // elegidas y erróneas

  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);
  const [newRecord, setNewRecord] = useState(false);

  const usedRef = useRef(new Set()); // países ya jugados en la partida
  const autoHintAtRef = useRef(0);

  const capitalsAvailable = useMemo(
    () => countries.filter((c) => c.capital).length >= 3,
    [countries]
  );


  const [fetchAttempt, setFetchAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchCountries()
      .then((list) => {
        if (cancelled) return;
        setCountries(list);
        setCurrentCountry(randomItem(list));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e?.name === 'AbortError'
            ? 'La API tardó demasiado en responder.'
            : 'No se pudieron cargar los países. Revisá la conexión a internet.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchAttempt]);

  const loadCountries = useCallback(() => {
    setLoading(true);
    setError(null);
    setFetchAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    saveLeaderboard(leaderboard);
  }, [leaderboard]);

  const players = useMemo(() => {
    const byName = new Map();
    [...leaderboard]
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      .forEach((e) => {
        const key = e.name.toLowerCase();
        if (!byName.has(key)) byName.set(key, e.name);
      });
    return [...byName.values()];
  }, [leaderboard]);


  const pickCountry = useCallback(
    (gameMode) => {
      const pool = gameMode === MODES.CAPITAL ? countries.filter((c) => c.capital) : countries;
      let available = pool.filter((c) => !usedRef.current.has(c.iso2));
      if (!available.length) {
        usedRef.current.clear();
        available = pool;
      }
      const country = randomItem(available);
      usedRef.current.add(country.iso2);
      return country;
    },
    [countries]
  );

  const setupRound = useCallback(
    (country, gameMode) => {
      setCurrentCountry(country);
      setTimeLeft(ROUND_TIME);
      setElapsed(0);
      autoHintAtRef.current = 0;
      setRevealed([]);
      setRemovedOptions([]);
      setWrongOptions([]);
      setRoundResult(null);
      setFeedback(null);
      setOptions(gameMode === MODES.CAPITAL ? buildCapitalOptions(country, countries) : []);
    },
    [countries]
  );

  const startGame = useCallback(() => {
    const name = playerName.trim();
    if (!name || !countries.length) return false;
    if (mode === MODES.CAPITAL && !capitalsAvailable) return false;
    usedRef.current.clear();
    setPlayerName(name);
    setScore(0);
    setHits(0);
    setRound(1);
    setupRound(pickCountry(mode), mode);
    setScreen('game');
    return true;
  }, [playerName, countries, mode, capitalsAvailable, setupRound, pickCountry]);

  const saveResult = useCallback(
    (finalScore, finalHits) => {
      const name = playerName.trim();
      if (!name) return;
      const isSame = (e) => e.mode === mode && e.name.toLowerCase() === name.toLowerCase();
      const previous = leaderboard.find(isSame);
      setNewRecord(!previous || finalScore > previous.best);
      setLeaderboard((prev) => {
        const existing = prev.find(isSame);
        const updated = {
          name,
          mode,
          best: existing ? Math.max(existing.best, finalScore) : finalScore,
          bestHits: existing ? Math.max(existing.bestHits ?? 0, finalHits) : finalHits,
          last: finalScore,
          games: (existing?.games ?? 0) + 1,
          total: (existing?.total ?? 0) + finalScore,
          updatedAt: Date.now(),
        };
        return [...prev.filter((e) => !isSame(e)), updated];
      });
    },
    [playerName, mode, leaderboard]
  );

  const finishGame = useCallback(() => {
    saveResult(score, hits);
    setRoundResult(null);
    setScreen('gameover');
  }, [saveResult, score, hits]);

  const nextCountry = useCallback(() => {
    if (round >= ROUNDS_PER_GAME) {
      finishGame();
      return;
    }
    setRound((r) => r + 1);
    setupRound(pickCountry(mode), mode);
  }, [round, mode, finishGame, setupRound, pickCountry]);

  const resetScore = useCallback(() => setScore(0), []);

  const goHome = useCallback(() => {
    setRoundResult(null);
    setScreen('home');
  }, []);

  const clearLeaderboard = useCallback(() => setLeaderboard([]), []);

  // Si el timer llega a 0 sin respuesta, la ronda termina por tiempo.
  const timedOut = screen === 'game' && !!currentCountry && !roundResult && timeLeft <= 0;
  const result = useMemo(
    () => roundResult ?? (timedOut ? { type: 'timeout', points: 0, answer: currentCountry } : null),
    [roundResult, timedOut, currentCountry]
  );
  const roundActive = screen === 'game' && !!currentCountry && !result;

  useEffect(() => {
    if (timedOut) vibrate(Haptics.NotificationFeedbackType.Warning);
  }, [timedOut]);

  // Después de mostrar el resultado de la ronda, pasar al siguiente país.
  useEffect(() => {
    if (!result) return;
    const id = setTimeout(nextCountry, RESULT_DELAY);
    return () => clearTimeout(id);
  }, [result, nextCountry]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 1500);
    return () => clearTimeout(id);
  }, [feedback]);

  useEffect(() => {
    if (!roundActive) return;
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [roundActive, currentCountry]);


  const correctAnswer = useCallback(() => {
    const bonus = timeLeft; 
    const points = CORRECT_POINTS + bonus;
    setScore((s) => s + points);
    setHits((h) => h + 1);
    setRoundResult({ type: 'correct', points, bonus, answer: currentCountry });
    setFeedback(null);
    vibrate(Haptics.NotificationFeedbackType.Success);
  }, [timeLeft, currentCountry]);

  const wrongAnswer = useCallback((text) => {
    setScore((s) => s - WRONG_PENALTY);
    setFeedback({ text, at: Date.now() });
    vibrate(Haptics.NotificationFeedbackType.Error);
  }, []);

  const guess = useCallback(
    (text) => {
      if (!roundActive || !normalize(text)) return false;
      if (acceptedAnswers(currentCountry.name).has(normalize(text))) {
        correctAnswer();
        return true;
      }
      wrongAnswer(text.trim());
      return false;
    },
    [roundActive, currentCountry, correctAnswer, wrongAnswer]
  );

  const guessCapital = useCallback(
    (option) => {
      if (!roundActive || removedOptions.includes(option) || wrongOptions.includes(option)) {
        return false;
      }
      if (option === currentCountry.capital) {
        correctAnswer();
        return true;
      }
      setWrongOptions((prev) => [...prev, option]);
      wrongAnswer(option);
      return false;
    },
    [roundActive, removedOptions, wrongOptions, currentCountry, correctAnswer, wrongAnswer]
  );

  const skipCountry = useCallback(() => {
    if (!roundActive) return;
    setRoundResult({ type: 'skip', points: 0, answer: currentCountry });
  }, [roundActive, currentCountry]);


  const hintTargets = useMemo(() => {
    if (!currentCountry) return [];
    if (mode === MODES.FLAG) {
      return letterIndexes(currentCountry.name).filter((i) => !revealed.includes(i));
    }
    return options.filter(
      (o) => o !== currentCountry.capital && !removedOptions.includes(o) && !wrongOptions.includes(o)
    );
  }, [currentCountry, mode, revealed, options, removedOptions, wrongOptions]);

  const minHidden = mode === MODES.FLAG ? 1 : 0;
  const canHint = roundActive && hintTargets.length > minHidden;

  const applyHint = useCallback(() => {
    if (hintTargets.length <= minHidden) return false;
    const target = randomItem(hintTargets);
    if (mode === MODES.FLAG) setRevealed((prev) => [...prev, target]);
    else setRemovedOptions((prev) => [...prev, target]);
    return true;
  }, [hintTargets, minHidden, mode]);

  const requestHint = useCallback(() => {
    if (!roundActive) return;
    if (applyHint()) setTimeLeft((t) => Math.max(0, t - HINT_COST));
  }, [roundActive, applyHint]);

  // Pista automática cada 5 segundos.
  useEffect(() => {
    if (!roundActive || elapsed === 0 || elapsed % AUTO_HINT_EVERY !== 0) return;
    if (autoHintAtRef.current === elapsed) return;
    autoHintAtRef.current = elapsed;
    applyHint();
  }, [elapsed, roundActive, applyHint]);

  const value = {
    countries,
    loading,
    error,
    loadCountries,
    capitalsAvailable,
    screen,
    mode,
    setMode,
    playerName,
    setPlayerName,
    currentCountry,
    score,
    round,
    hits,
    roundActive,
    roundResult: result,
    feedback,
    startGame,
    finishGame,
    nextCountry,
    skipCountry,
    resetScore,
    goHome,
    guess,
    guessCapital,
    timeLeft,
    revealed,
    options,
    removedOptions,
    wrongOptions,
    canHint,
    requestHint,
    players,
    leaderboard,
    newRecord,
    clearLeaderboard,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame() debe usarse dentro de <GameProvider>');
  return ctx;
}
