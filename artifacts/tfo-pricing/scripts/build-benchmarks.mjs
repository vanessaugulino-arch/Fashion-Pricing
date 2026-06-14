#!/usr/bin/env node
/**
 * build-benchmarks.mjs
 * Reads Data/Benchmarks_Varejo_Moda_Brasil.xlsx and writes
 * src/data/benchmarks.json consumed by engine/benchmarks.ts.
 *
 * Run from the artifacts/tfo-pricing/ directory (CWD):
 *   node scripts/build-benchmarks.mjs
 */

import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const cwd = process.cwd();
const XLSX_INPUT = path.resolve(cwd, '../../Data/Benchmarks_Varejo_Moda_Brasil.xlsx');
const JSON_OUTPUT = path.resolve(cwd, 'src/data/benchmarks.json');

// ─── helpers ──────────────────────────────────────────────────────────────────

function cleanStr(v) {
  if (typeof v !== 'string') return String(v ?? '');
  return v
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[✀-➿⚠️✅💡ℹ️]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNum(v) { return typeof v === 'number' && isFinite(v); }

/** Returns rows starting after the header row (0-based). */
function getDataRows(ws, headerRow) {
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }).slice(headerRow + 1);
}

/**
 * Normalises a raw string to a lowercase ASCII slug.
 * "Bijuterias / Semijóias / Joias" → "bijuterias_semijoias_joias"
 */
function slug(raw) {
  return cleanStr(raw)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip combining diacritics
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Given an array of [min, max] numeric pairs, return overall [min, max]. */
function agg(pairs) {
  const ok = pairs.filter(([a, b]) => isNum(a) && isNum(b) && (a > 0 || b > 0));
  if (!ok.length) return null;
  return [
    parseFloat(Math.min(...ok.map(([a]) => a)).toFixed(4)),
    parseFloat(Math.max(...ok.map(([, b]) => b)).toFixed(4)),
  ];
}

// ─── Segment mappings (slug → code key(s)) ────────────────────────────────────

// Varejo sheet: row 3+ has col[1]=segmento, col[2]=subsegmento
// Bijuterias and Acessórios need special handling by subsegmento.
const VAREJO_SIMPLE = {
  vestuario_feminino:     ['vestuario_feminino'],
  vestuario_masculino:    ['vestuario_masculino'],
  vestuario_infantil:     ['vestuario_infantil'],
  calcados_femininos:     ['calcados_femininos'],
  calcados_masculinos:    ['calcados_masculinos'],
  calcados_infantis:      ['calcados_infantis'],
  underwear_feminino:     ['underwear_feminino'],
  underwear_masculino:    ['underwear_masculino'],
  underwear_infantil:     ['underwear_infantil'],
  moda_fitness_feminino:  ['fitness_feminino'],
  moda_fitness_masculino: ['fitness_masculino'],
  moda_fitness_infantil:  ['fitness_infantil'],
  moda_praia_feminino:    ['moda_praia_feminino'],
  moda_praia_masculino:   ['moda_praia_masculino'],
  moda_praia_infantil:    ['moda_praia_infantil'],
};

// Acessórios varejo: split by subsegmento slug
const ACESSORIOS_SEG_SLUG = 'acessorios_bolsas_e_cintos';
const ACESSORIOS_SUBSEG = {
  feminino_geral:   'acessorios_bolsas_feminino',
  feminino_premium: 'acessorios_bolsas_feminino',
  masculino_geral:  'acessorios_bolsas_masculino',
};

// Bijuterias varejo slug (exact from debug)
const BIJUTERIAS_VAREJO_SLUG = 'bijuterias_semijoias_joias';

// Atacado sheet: row 3+ has col[1]=segmento, col[2]=subseg, col[3]=mbMin, col[5]=mbMax
const ATACADO_MAP = {
  vestuario_feminino:       ['vestuario_feminino'],
  vestuario_masculino:      ['vestuario_masculino'],
  vestuario_infantil:       ['vestuario_infantil'],
  calcados_femininos:       ['calcados_femininos'],
  calcados_masculinos:      ['calcados_masculinos'],
  // exact slug from debug: acessorios_bolsas_cintos
  acessorios_bolsas_cintos: ['acessorios_bolsas_feminino','acessorios_bolsas_masculino','acessorios','acessorios_infantil'],
  bijuterias_semijoias:     ['bijuterias_joias'],
  moda_fitness:             ['fitness_feminino','fitness_masculino','fitness_infantil','fitness'],
  underwear:                ['underwear_feminino','underwear_masculino','underwear_infantil','underwear'],
  moda_praia:               ['moda_praia_feminino','moda_praia_masculino','moda_praia_infantil','moda_praia'],
};

// Remarcacao sheet: col[1]=segmento, col[3]=remMin, col[5]=remMax
const REMARCACAO_MAP = {
  vestuario_feminino:    ['vestuario_feminino'],
  vestuario_masculino:   ['vestuario_masculino'],
  vestuario_infantil:    ['vestuario_infantil'],
  calcados_femininos:    ['calcados_femininos'],
  calcados_masculinos:   ['calcados_masculinos'],
  acessorios_bolsas:     ['acessorios_bolsas_feminino','acessorios_bolsas_masculino','acessorios'],
  bijuterias_semijoias:  ['bijuterias_joias'],
  moda_fitness:          ['fitness_feminino','fitness_masculino','fitness_infantil','fitness'],
  moda_praia:            ['moda_praia_feminino','moda_praia_masculino','moda_praia_infantil','moda_praia'],
  underwear:             ['underwear_feminino','underwear_masculino','underwear_infantil','underwear'],
};

// Invest_Marketing: col[0]=segmento (no leading empty col)
const INVEST_SEG_MAP = {
  vestuario_feminino:      'vestuario_feminino',
  vestuario_masculino:     'vestuario_masculino',
  vestuario_infantil:      'vestuario_infantil',
  calcados_femininos:      'calcados_femininos',
  calcados_masculinos:     'calcados_masculinos',
  calcados_infantis:       'calcados_infantis',
  bijuterias_semijoias_joias: 'bijuterias_joias',
  underwear_feminino:      'underwear_feminino',
  underwear_masculino:     'underwear_masculino',
  underwear_infantil:      'underwear_infantil',
  moda_fitness_feminino:   'fitness_feminino',
  moda_fitness_masculino:  'fitness_masculino',
  moda_fitness_infantil:   'fitness_infantil',
  moda_praia_feminino:     'moda_praia_feminino',
  moda_praia_masculino:    'moda_praia_masculino',
  moda_praia_infantil:     'moda_praia_infantil',
};

// Aggregate keys: varejo derived from their sub-components (not read directly from xlsx)
const VAREJO_AGGREGATES = {
  acessorios:          ['acessorios_bolsas_feminino','acessorios_bolsas_masculino'],
  acessorios_infantil: ['acessorios_bolsas_feminino'],
  calcados_infantis:   ['calcados_femininos','calcados_masculinos'],
  fitness:             ['fitness_feminino','fitness_masculino','fitness_infantil'],
  underwear:           ['underwear_feminino','underwear_masculino','underwear_infantil'],
  moda_praia:          ['moda_praia_feminino','moda_praia_masculino','moda_praia_infantil'],
};

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseBenchmarksVarejo(ws) {
  const buckets = {}; // key → [[min,max], ...]

  function push(key, min, max) {
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push([min, max]);
  }

  for (const row of getDataRows(ws, 2)) {
    const segSlug = slug(row[1]);
    const subSlug = slug(row[2]);
    const mbMin = row[4];
    const mbMax = row[6];

    if (!segSlug || !isNum(mbMin) || !isNum(mbMax) || mbMin <= 0) continue;

    if (segSlug === ACESSORIOS_SEG_SLUG) {
      const mapped = ACESSORIOS_SUBSEG[subSlug] ?? 'acessorios_bolsas_feminino';
      push(mapped, mbMin, mbMax);
    } else if (segSlug === BIJUTERIAS_VAREJO_SLUG) {
      push('bijuterias_joias', mbMin, mbMax);
    } else {
      const keys = VAREJO_SIMPLE[segSlug];
      if (keys) keys.forEach(k => push(k, mbMin, mbMax));
    }
  }

  return buckets;
}

function parseBenchmarksAtacado(ws) {
  const buckets = {};

  for (const row of getDataRows(ws, 2)) {
    const segSlug = slug(row[1]);
    const mbMin = row[3];
    const mbMax = row[5];

    if (!segSlug || !isNum(mbMin) || !isNum(mbMax) || mbMin <= 0) continue;

    const keys = ATACADO_MAP[segSlug];
    if (keys) keys.forEach(k => {
      if (!buckets[k]) buckets[k] = [];
      buckets[k].push([mbMin, mbMax]);
    });
  }

  return buckets;
}

function parseRemarcacao(ws) {
  const buckets = {};

  for (const row of getDataRows(ws, 2)) {
    const segSlug = slug(row[1]);
    const remMin = row[3];
    const remMax = row[5];

    if (!segSlug || !isNum(remMin) || !isNum(remMax) || (remMin === 0 && remMax === 0)) continue;

    const keys = REMARCACAO_MAP[segSlug];
    if (keys) keys.forEach(k => {
      if (!buckets[k]) buckets[k] = [];
      buckets[k].push([remMin, remMax]);
    });
  }

  return buckets;
}

function parseInvestMarketing(ws) {
  const records = [];

  for (const row of getDataRows(ws, 2)) {
    const segSlug = slug(row[0]);
    const subSlug = slug(row[1]);
    const porte   = slug(row[2]);
    const posic   = slug(row[3]);
    const invMin  = row[4];
    const invMax  = row[6];

    if (!segSlug || !isNum(invMin) || !isNum(invMax) || invMin <= 0) continue;

    let mappedSeg = INVEST_SEG_MAP[segSlug];
    if (!mappedSeg && segSlug.includes('acessorio')) {
      mappedSeg = subSlug.includes('masculino')
        ? 'acessorios_bolsas_masculino'
        : 'acessorios_bolsas_feminino';
    }
    if (!mappedSeg) continue;

    records.push({ segmento: mappedSeg, porte, posicionamento: posic, min: invMin, max: invMax });
  }

  return records;
}

// ─── Build margemBruta ────────────────────────────────────────────────────────

function buildMargemBruta(vBuckets, aBuckets) {
  const result = {};

  // 1. All keys directly found in either bucket (non-aggregate)
  const allKeys = new Set([...Object.keys(vBuckets), ...Object.keys(aBuckets)]);
  for (const key of allKeys) {
    const vRange = agg(vBuckets[key] || []);
    const aRange = agg(aBuckets[key] || []);
    result[key] = {
      varejo:  vRange  || [0.50, 0.70],
      atacado: aRange  || [0.35, 0.50],
    };
  }

  // 2. Aggregate keys: ALWAYS derive varejo from sub-components (override fallback)
  for (const [aggKey, sources] of Object.entries(VAREJO_AGGREGATES)) {
    const vPairs = sources.flatMap(s => vBuckets[s] || []);
    const aPairs = sources.flatMap(s => aBuckets[s] || []);
    const vRange = agg(vPairs);
    const aRange = agg(aPairs);

    if (!result[aggKey]) {
      if (vRange || aRange) {
        result[aggKey] = { varejo: vRange || [0.50, 0.70], atacado: aRange || [0.35, 0.50] };
      }
    } else {
      // Override varejo with component data (not the fallback from step 1)
      if (vRange) result[aggKey].varejo = vRange;
      if (aRange) result[aggKey].atacado = aRange;
    }
  }

  // 3. Default — representative mid-market fallback (Vestuário Geral)
  if (!result.default) {
    result.default = { varejo: [0.50, 0.70], atacado: [0.22, 0.38] };
  }

  return result;
}

// ─── Build remarcacao ─────────────────────────────────────────────────────────

function buildRemarcacao(remBuckets) {
  const result = {};

  for (const [key, pairs] of Object.entries(remBuckets)) {
    const range = agg(pairs);
    if (range) result[key] = range;
  }

  if (!result.default) {
    result.default = [0.12, 0.45]; // representative mid-market fallback
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('📊 build-benchmarks: lendo', XLSX_INPUT);

if (!fs.existsSync(XLSX_INPUT)) {
  if (fs.existsSync(JSON_OUTPUT)) {
    console.log('⚠️  Planilha não encontrada. Usando benchmarks.json existente (sem regeneração).');
    process.exit(0);
  }
  console.error('❌  Planilha não encontrada e benchmarks.json ausente:', XLSX_INPUT);
  process.exit(1);
}

const wb = XLSX.readFile(XLSX_INPUT);

for (const required of ['Benchmarks_Varejo','Benchmarks_Atacado','Remarcacao','Invest_Marketing']) {
  if (!wb.Sheets[required]) {
    console.error(`❌  Aba "${required}" não encontrada. Abas: ${wb.SheetNames.join(', ')}`);
    process.exit(1);
  }
}

const vBuckets = parseBenchmarksVarejo(wb.Sheets['Benchmarks_Varejo']);
const aBuckets = parseBenchmarksAtacado(wb.Sheets['Benchmarks_Atacado']);
const remBuckets = parseRemarcacao(wb.Sheets['Remarcacao']);
const investRecords = parseInvestMarketing(wb.Sheets['Invest_Marketing']);

const margemBruta = buildMargemBruta(vBuckets, aBuckets);
const remarcacao  = buildRemarcacao(remBuckets);

const output = {
  _meta: {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    source: 'Benchmarks_Varejo_Moda_Brasil.xlsx',
  },
  margemBruta,
  remarcacao,
  investMarketing: investRecords,
};

const outDir = path.dirname(JSON_OUTPUT);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(JSON_OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

console.log('✅  benchmarks.json gerado:', JSON_OUTPUT);
console.log(`   margemBruta: ${Object.keys(margemBruta).length} segmentos`);
console.log(`   remarcacao:  ${Object.keys(remarcacao).length} segmentos`);
console.log(`   investMarketing: ${investRecords.length} registros`);
