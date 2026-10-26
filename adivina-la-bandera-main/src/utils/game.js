
export function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}


export function normalize(text) {
  let out = String(text ?? '').toLowerCase().trim();
  try {
    out = out.normalize('NFD');
  } catch {
  }
  return out
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}


export function acceptedAnswers(name) {
  const answers = new Set([normalize(name)]);
  const withoutParens = name.replace(/\(.*?\)/g, ' ');
  if (withoutParens !== name) answers.add(normalize(withoutParens));
  answers.delete('');
  return answers;
}

export function isLetter(char) {
  return char.toLowerCase() !== char.toUpperCase() || /\d/.test(char);
}

export function letterIndexes(name) {
  return [...name].map((char, i) => (isLetter(char) ? i : -1)).filter((i) => i >= 0);
}

// 3 opciones de capital: la correcta + 2 capitales distintas al azar.
export function buildCapitalOptions(country, countries, total = 3) {
  const correct = country.capital;
  const others = new Map();
  countries.forEach((c) => {
    if (!c.capital) return;
    const key = normalize(c.capital);
    if (key !== normalize(correct) && !others.has(key)) others.set(key, c.capital);
  });
  const wrong = shuffle([...others.values()]).slice(0, total - 1);
  return shuffle([correct, ...wrong]);
}

// La API devuelve SVGs de Wikimedia. Probamos, en orden:
// 1) PNG que Wikimedia genera a partir de ese SVG (liviano y rápido),
// 2) la URL original de la API,
// 3) flagcdn.com por código ISO, por si Wikimedia limita las descargas.
export function flagSources(country) {
  const sources = [];
  const url = (country.flag || '').trim();
  const match = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|en))\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/
  );
  if (match) {
    const [, base, a, ab, file] = match;
    const ext = /\.svg$/i.test(file) ? '.png' : '';
    sources.push(`${base}/thumb/${a}/${ab}/${file}/330px-${file}${ext}`);
  }
  if (url) sources.push(url);
  if (country.iso2) sources.push(`https://flagcdn.com/w320/${country.iso2.toLowerCase()}.png`);
  return sources;
}
