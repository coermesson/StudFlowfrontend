const COR_PADRAO = '#C9D7F5';
const TEXTO_ESCURO = '#18181B';
const TEXTO_CLARO = '#F8FAFC';

function hashString(valor) {
  const texto = String(valor ?? '');
  let hash = 2166136261;

  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function criarGeradorSeed(seedInicial) {
  let estado = seedInicial >>> 0;

  return function proximoAleatorio() {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslParaRgb(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbParaHex({ r, g, b }) {
  const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function calcularLuminancia({ r, g, b }) {
  const canais = [r, g, b].map((valor) => {
    const normalizado = valor / 255;

    return normalizado <= 0.03928
      ? normalizado / 12.92
      : ((normalizado + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * canais[0] +
    0.7152 * canais[1] +
    0.0722 * canais[2]
  );
}

function obterCorTextoLegivel(rgb) {
  return calcularLuminancia(rgb) > 0.36
    ? TEXTO_ESCURO
    : TEXTO_CLARO;
}

function distanciaHue(h1, h2) {
  const diff = Math.abs(h1 - h2) % 360;

  return diff > 180 ? 360 - diff : diff;
}

function sortearHueDistante(rand, huesUsados, distanciaMinima = 45) {
  for (let tentativa = 0; tentativa < 40; tentativa += 1) {
    const candidato = Math.floor(rand() * 360);

    const longeSuficiente = huesUsados.every(
      (usado) => distanciaHue(candidato, usado) >= distanciaMinima
    );

    if (longeSuficiente) return candidato;
  }

  return Math.floor(rand() * 360);
}

/**
 * Gera um tema determinístico a partir de um tipo de entidade e seu ID.
 * Ex.: obterTemaPorEntidade('materia', item.materiaId)
 */
export function obterTemaPorEntidade(tipoEntidade, entidadeId, huesUsados = []) {
  if (
    entidadeId === undefined ||
    entidadeId === null ||
    String(entidadeId).trim() === ''
  ) {
    return {
      hue: null,
      cor: COR_PADRAO,
      texto: TEXTO_ESCURO,
    };
  }

  const chaveSeed = `${tipoEntidade || 'entidade'}:${entidadeId}`;
  const rand = criarGeradorSeed(hashString(chaveSeed));
  const hue = sortearHueDistante(rand, huesUsados, 45);
  const saturation = 45 + Math.floor(rand() * 45);
  const lightness = 26 + Math.floor(rand() * 58);
  const rgb = hslParaRgb(hue, saturation, lightness);

  return {
    hue,
    cor: rgbParaHex(rgb),
    texto: obterCorTextoLegivel(rgb),
  };
}

export function obterTemaMateria(materiaId, huesUsados = []) {
  return obterTemaPorEntidade('materia', materiaId, huesUsados);
}

export function obterTemaCurso(cursoId, huesUsados = []) {
  return obterTemaPorEntidade('curso', cursoId, huesUsados);
}

/**
 * Helper pronto para injetar variáveis CSS em cards de Kanban, To-Do ou Curso.
 */
export function obterEstilosTema(tema) {
  return {
    '--folder-color': tema.cor,
    '--folder-text-color': tema.texto,
  };
}