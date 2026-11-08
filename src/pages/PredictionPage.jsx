import { useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BadgeInfo, ChartNoAxesCombined, CircleAlert, Database, Download, FileImage, FileSpreadsheet, Info, Printer, RotateCcw, SlidersHorizontal } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import { publicAsset } from '../lib/publicAsset';
import './PredictionPage.css';
import './PredictionExport.css';
import './PredictionModel.css';

const VARIABLES = [
  { key: 'rain', label: 'Curah hujan', unit: 'mm', color: '#168c84' },
  { key: 'humidity', label: 'Kelembapan', unit: '%', color: '#4f8cbf' },
  { key: 'temperature', label: 'Suhu', unit: '°C', color: '#ed8a45' },
  { key: 'sanitation', label: 'Skor sanitasi', unit: '/5', color: '#8a72b8' },
  { key: 'outbreak', label: 'Laporan wabah lokal', unit: 'kasus', color: '#d8654b' },
];
const AR_ORDER = 1;
const MA_ORDER = 1;
const TARGETS = ['Diare wisatawan', 'Kasus diare akut', 'KLB gastroenteritis'];
const DESTINATIONS = ['Gianyar, Bali', 'Ubud, Gianyar', 'Sanur, Denpasar', 'Kuta, Badung', 'Nusa Penida, Klungkung'];
const avg = (items) => items.reduce((sum, value) => sum + value, 0) / (items.length || 1);
const sd = (items) => Math.sqrt(avg(items.map((value) => (value - avg(items)) ** 2))) || 1;
const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const monthKey = (month, offset = 0) => {
  const [year, value] = month.split('-').map(Number);
  const date = new Date(year, value - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (month, offset = 0, options = { month: 'long', year: 'numeric' }) => {
  const [year, value] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(year, value - 1 + offset, 1));
};

function renderForecastChart({ rows, forecastRows, month, rangeDescription }) {
  const historical = rows.slice(-8).map((row, index, list) => ({
    value: row.cases,
    label: monthLabel(month, index - list.length + 1, { month: 'short' }),
  }));
  const points = [...historical, ...forecastRows.map((row) => ({ value: row.value, label: row.label }))];
  const chart = { width: 720, height: 260, left: 52, right: 12, top: 20, bottom: 42 };
  const maxValue = Math.max(1, ...points.map((point) => point.value), ...forecastRows.map((row) => row.upper)) * 1.12;
  const x = (index) => chart.left + (index * (chart.width - chart.left - chart.right)) / Math.max(points.length - 1, 1);
  const y = (value) => chart.height - chart.bottom - (value / maxValue) * (chart.height - chart.top - chart.bottom);
  const path = (items) => items.map((point, index) => `${index ? 'L' : 'M'} ${x(point.index)} ${y(point.value)}`).join(' ');
  const actualPoints = historical.map((point, index) => ({ ...point, index }));
  const forecastPoints = points.slice(historical.length - 1).map((point, index) => ({ ...point, index: historical.length - 1 + index }));
  const lastHistoricalValue = historical.at(-1)?.value ?? 0;
  const upper = [{ index: historical.length - 1, value: lastHistoricalValue }, ...forecastRows.map((row, index) => ({ index: historical.length + index, value: row.upper }))];
  const lower = [...forecastRows.map((row, index) => ({ index: historical.length + index, value: row.lower })), { index: historical.length - 1, value: lastHistoricalValue }].reverse();
  const rangePath = [...upper, ...lower].map((point, index, polygon) => `${index ? 'L' : 'M'} ${x(point.index)} ${y(point.value)}${index === polygon.length - 1 ? ' Z' : ''}`).join(' ');
  const ticks = Array.from({ length: 5 }, (_, index) => (maxValue * index) / 4);

  return <div className="gg-forecast-visual">
    <div className="gg-chart-legend"><span><i className="actual"/> Historis</span><span><i className="forecast"/> Prediksi</span><span><i className="range"/> Rentang ilustratif</span></div>
    <svg className="gg-forecast-svg" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-labelledby="gg-chart-title gg-chart-description">
      <title id="gg-chart-title">Grafik data historis dan hasil prediksi per bulan</title>
      <desc id="gg-chart-description">Grafik garis membandingkan delapan periode historis terakhir dengan ramalan untuk {forecastRows.length} bulan mendatang.</desc>
      <defs><linearGradient id="gg-range-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f4a261" stopOpacity=".25"/><stop offset="100%" stopColor="#f4a261" stopOpacity=".04"/></linearGradient></defs>
      {ticks.map((tick) => <g key={tick}><line x1={chart.left} x2={chart.width - chart.right} y1={y(tick)} y2={y(tick)} stroke="#e9eee9" strokeDasharray="4 6"/><text x={chart.left - 10} y={y(tick) + 4} textAnchor="end" className="gg-chart-axis-label">{Math.round(tick)}</text></g>)}
      {forecastRows.length > 0 && <path d={rangePath} fill="url(#gg-range-fill)"/>}
      <path d={path(actualPoints)} fill="none" stroke="#14877b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      {forecastRows.length > 0 && <path d={path(forecastPoints)} fill="none" stroke="#e58a42" strokeWidth="3.5" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round"/>}
      {actualPoints.map((point) => <circle key={`actual-${point.index}`} cx={x(point.index)} cy={y(point.value)} r={point.index === actualPoints.length - 1 ? 5 : 3.5} fill="white" stroke="#14877b" strokeWidth="2.5"><title>{point.label} historis: {point.value} kasus</title></circle>)}
      {forecastRows.map((row, index) => <g key={row.month}><circle cx={x(historical.length + index)} cy={y(row.value)} r="4.5" fill="#fff" stroke="#e58a42" strokeWidth="3"><title>{row.label}: {row.value} kasus</title></circle></g>)}
      {points.map((point, index) => {
        const showLabel = index === historical.length - 1 || index >= historical.length;
        return showLabel && <text key={`label-${index}`} x={x(index)} y={chart.height - 13} textAnchor="middle" className={`gg-chart-axis-label ${index >= historical.length ? 'future' : ''}`}>{point.label}</text>;
      })}
    </svg>
    <p className="gg-chart-note">Pita warna menunjukkan rentang ilustratif {rangeDescription}, bukan interval prediksi statistik terkalibrasi.</p>
  </div>;
}

function renderValidationChart(validationRows) {
  const width = 720;
  const height = 220;
  const left = 54;
  const right = 12;
  const top = 18;
  const bottom = 34;
  const maxValue = Math.max(1, ...validationRows.flatMap((row) => [row.actual, row.predicted])) * 1.12;
  const x = (index) => left + (index * (width - left - right)) / Math.max(validationRows.length - 1, 1);
  const y = (value) => height - bottom - (value / maxValue) * (height - top - bottom);
  const line = (key) => validationRows.map((row, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(row[key])}`).join(' ');
  const ticks = Array.from({ length: 5 }, (_, index) => (maxValue * index) / 4);

  return <div className="gg-validation-chart-wrap">
    <div className="gg-chart-legend"><span><i className="actual"/> Aktual</span><span><i className="forecast"/> Prediksi walk-forward</span></div>
    <svg className="gg-forecast-svg gg-validation-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="gg-validation-title gg-validation-description">
      <title id="gg-validation-title">Validasi walk-forward, prediksi dibanding data aktual</title>
      <desc id="gg-validation-description">{validationRows.length} periode uji, tiap prediksi dibuat hanya dengan data periode sebelumnya.</desc>
      {ticks.map((tick) => <g key={tick}><line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke="#e9eee9" strokeDasharray="4 6"/><text x={left - 10} y={y(tick) + 4} textAnchor="end" className="gg-chart-axis-label">{Math.round(tick)}</text></g>)}
      <path d={line('actual')} fill="none" stroke="#14877b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={line('predicted')} fill="none" stroke="#e58a42" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" strokeLinejoin="round"/>
      {validationRows.map((row, index) => <g key={row.month}><circle cx={x(index)} cy={y(row.actual)} r="4" fill="white" stroke="#14877b" strokeWidth="2"><title>{row.label}: aktual {row.actual} kasus</title></circle><circle cx={x(index)} cy={y(row.predicted)} r="4" fill="white" stroke="#e58a42" strokeWidth="2"><title>{row.label}: prediksi {row.predicted} kasus</title></circle>{validationRows.length <= 6 && <text x={x(index)} y={height - 10} textAnchor="middle" className="gg-chart-axis-label">{row.label}</text>}</g>)}
    </svg>
  </div>;
}

function renderResidualChart(validationRows) {
  const width = 720;
  const height = 190;
  const left = 54;
  const right = 12;
  const top = 16;
  const bottom = 34;
  const maxError = Math.max(1, ...validationRows.map((row) => Math.abs(row.residual))) * 1.15;
  const zeroY = top + (height - top - bottom) / 2;
  const x = (index) => left + ((index + 0.5) * (width - left - right)) / validationRows.length;
  const y = (value) => zeroY - (value / maxError) * ((height - top - bottom) / 2);

  return <svg className="gg-forecast-svg gg-residual-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="gg-residual-title gg-residual-description">
    <title id="gg-residual-title">Residual validasi per bulan</title>
    <desc id="gg-residual-description">Residual adalah kasus aktual dikurangi prediksi walk-forward. Garis tengah menunjukkan galat nol.</desc>
    <line x1={left} x2={width - right} y1={zeroY} y2={zeroY} stroke="#8fa39a" strokeDasharray="5 5"/>
    {[-1, 1].map((multiple) => <line key={multiple} x1={left} x2={width - right} y1={y(maxError * multiple * .5)} y2={y(maxError * multiple * .5)} stroke="#edf1ed" strokeDasharray="3 6"/>)}
    {validationRows.map((row, index) => {
      const barTop = Math.min(zeroY, y(row.residual));
      const barHeight = Math.max(2, Math.abs(zeroY - y(row.residual)));
      return <g key={row.month}><rect x={x(index) - Math.min(20, (width - left - right) / validationRows.length / 4)} y={barTop} width={Math.min(40, (width - left - right) / validationRows.length / 2)} height={barHeight} rx="4" fill={row.residual >= 0 ? '#e58a42' : '#438db4'}><title>{row.label}: {row.residual >= 0 ? '+' : ''}{row.residual.toFixed(1)} kasus galat</title></rect><text x={x(index)} y={height - 10} textAnchor="middle" className="gg-chart-axis-label">{validationRows.length <= 8 ? row.label : String(index + 1)}</text></g>;
    })}
  </svg>;
}

function makeDemo(target) {
  return Array.from({ length: 24 }, (_, index) => {
    const season = Math.sin((index / 12) * Math.PI * 2 - 0.7);
    const rain = Math.round(130 + season * 86 + (index % 4) * 9);
    const humidity = Math.round(74 + season * 8 + (index % 3));
    const temperature = +(28.2 + season * 1.7 + ((index % 5) - 2) * 0.12).toFixed(1);
    const sanitation = +(3.2 + ((index + 1) % 4) * 0.25).toFixed(1);
    const outbreak = (index % 7 === 0 ? 4 : index % 5 === 0 ? 2 : 0);
    const multiplier = target === TARGETS[2] ? 0.32 : target === TARGETS[1] ? 1.18 : 1;
    const cases = Math.max(3, Math.round((18 + rain * 0.045 + humidity * 0.16 + (5 - sanitation) * 5.4 + outbreak * 2.4 + Math.max(0, temperature - 28) * 1.8 + season * 5) * multiplier));
    return { cases, rain, humidity, temperature, sanitation, outbreak };
  });
}
function toCsv(rows) { return rows.map((row) => [row.cases, row.rain, row.humidity, row.temperature, row.sanitation, row.outbreak].join(',')).join('\n'); }
function parseCsv(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const fields = line.split(/[;,\t]/).map((field) => field.trim());
    const hasMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(fields[0]);
    const values = fields.slice(hasMonth ? 1 : 0).map(Number);
    if (values.length < 5 || values.length > 6 || !values.every(Number.isFinite)) return null;
    const [cases, rain, humidity, temperature, sanitation, outbreak = 0] = values;
    return { month: hasMonth ? fields[0] : null, cases, rain, humidity, temperature, sanitation, outbreak };
  }).filter(Boolean);
}
function solve(matrix, values) {
  const n = values.length;
  const a = matrix.map((row, index) => [...row, values[index]]);
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    if (Math.abs(a[pivot][column]) < 1e-9) return null;
    [a[column], a[pivot]] = [a[pivot], a[column]];
    const divisor = a[column][column];
    for (let j = column; j <= n; j += 1) a[column][j] /= divisor;
    for (let row = 0; row < n; row += 1) {
      if (row === column) continue;
      const factor = a[row][column];
      for (let j = column; j <= n; j += 1) a[row][j] -= factor * a[column][j];
    }
  }
  return a.map((row) => row[n]);
}
function regress(matrix, outcome) {
  const xtx = matrix[0].map((_, i) => matrix[0].map((_, j) => matrix.reduce((sum, row) => sum + row[i] * row[j], 0)));
  const xty = matrix[0].map((_, i) => matrix.reduce((sum, row, index) => sum + row[i] * outcome[index], 0));
  xtx.forEach((row, index) => { if (index > 0) row[index] += 1e-8; });
  return solve(xtx, xty);
}
function fitArmax(rows, variables) {
  const target = rows.map((row) => row.cases);
  const countMean = avg(target);
  const countSd = sd(target);
  const scales = Object.fromEntries(variables.map((key) => [key, { mean: avg(rows.map((row) => row[key])), sd: sd(rows.map((row) => row[key])) }]));
  const normalizedTarget = target.map((value) => (value - countMean) / countSd);
  const exogenous = rows.map((row) => variables.map((key) => (row[key] - scales[key].mean) / scales[key].sd));
  const outcome = normalizedTarget.slice(AR_ORDER);
  const baseMatrix = rows.slice(AR_ORDER).map((_, index) => [1, ...normalizedTarget.slice(index, index + AR_ORDER).reverse(), 0, ...exogenous[index + AR_ORDER]]);
  let coefficients = regress(baseMatrix, outcome);
  if (!coefficients) return null;
  let residuals = Array(rows.length).fill(0);
  const getResiduals = (fitted, matrix) => {
    const updated = Array(rows.length).fill(0);
    matrix.forEach((row, index) => {
      const time = index + AR_ORDER;
      updated[time] = normalizedTarget[time] - row.reduce((sum, value, column) => sum + value * fitted[column], 0);
    });
    return updated;
  };
  residuals = getResiduals(coefficients, baseMatrix);

  let innovationScale = sd(residuals.slice(AR_ORDER));
  for (let iteration = 0; iteration < 20; iteration += 1) {
    innovationScale = sd(residuals.slice(AR_ORDER));
    const matrix = rows.slice(AR_ORDER).map((_, index) => {
      const time = index + AR_ORDER;
      return [1, ...normalizedTarget.slice(time - AR_ORDER, time).reverse(), ...residuals.slice(time - MA_ORDER, time).reverse().map((value) => value / innovationScale), ...exogenous[time]];
    });
    const fitted = regress(matrix, outcome);
    if (!fitted) return null;
    const updatedResiduals = getResiduals(fitted, matrix);
    const difference = Math.max(...fitted.map((value, index) => Math.abs(value - coefficients[index])));
    coefficients = fitted;
    residuals = updatedResiduals;
    if (difference < 1e-7) break;
  }
  const rmse = Math.sqrt(avg(residuals.slice(AR_ORDER).map((value) => (value * countSd) ** 2)));
  return { coefficients, countMean, countSd, scales, innovationScale, residuals, rmse, observations: rows.length - AR_ORDER };
}
function forecast(model, rows, variables, futureX, horizon) {
  const result = [];
  let previous = (rows.at(-1).cases - model.countMean) / model.countSd;
  let previousInnovation = model.residuals.at(-1) / model.innovationScale;
  for (let period = 0; period < horizon; period += 1) {
    const periodX = Array.isArray(futureX) ? futureX[period] : futureX;
    const inputs = [1, previous, previousInnovation, ...variables.map((key) => (periodX[key] - model.scales[key].mean) / model.scales[key].sd)];
    const normalized = inputs.reduce((sum, value, index) => sum + value * model.coefficients[index], 0);
    previous = normalized;
    previousInnovation = 0;
    result.push(Math.round(Math.max(0, model.countMean + normalized * model.countSd) * 10) / 10);
  }
  return result;
}

function inspectDataset(rows, lastObservedMonth) {
  const explicitDates = rows.some((row) => row.month);
  const mixedDateFormats = explicitDates && rows.some((row) => !row.month);
  const timeline = explicitDates
    ? rows.map((row) => row.month)
    : rows.map((_, index) => monthKey(lastObservedMonth, index - rows.length + 1));
  const invalidOrder = explicitDates && timeline.some((month, index) => index > 0 && month <= timeline[index - 1]);
  const missingMonths = explicitDates && !invalidOrder
    ? timeline.slice(1).reduce((total, month, index) => {
      const previous = timeline[index].split('-').map(Number);
      const current = month.split('-').map(Number);
      return total + Math.max(0, (current[0] - previous[0]) * 12 + current[1] - previous[1] - 1);
    }, 0)
    : 0;
  const invalidCases = rows.some((row) => row.cases < 0);
  const invalidSanitation = rows.some((row) => row.sanitation < 1 || row.sanitation > 5);
  const valid = rows.length > 0 && !mixedDateFormats && !invalidOrder && !missingMonths && !invalidCases && !invalidSanitation;
  const warnings = [];
  if (!explicitDates) warnings.push('CSV tidak memiliki tanggal per baris; periode diasumsikan berurutan bulanan sampai bulan terakhir yang dipilih.');
  if (mixedDateFormats) warnings.push('Jangan campur baris bertanggal dan tanpa tanggal. Tambahkan YYYY-MM ke semua baris atau hapus tanggal dari semuanya.');
  if (invalidOrder) warnings.push('Tanggal harus berurutan dari bulan paling lama ke paling baru tanpa duplikasi.');
  if (missingMonths) warnings.push(`${missingMonths} bulan kosong terdeteksi. Lengkapi data atau perbaiki rentang tanggal sebelum melatih model.`);
  if (invalidCases) warnings.push('Jumlah kasus tidak boleh negatif.');
  if (invalidSanitation) warnings.push('Skor sanitasi harus berada pada rentang 1–5.');
  return {
    valid,
    timeline,
    explicitDates,
    warnings,
    missingMonths,
    firstMonth: timeline[0] ?? '',
    lastMonth: timeline.at(-1) ?? lastObservedMonth,
  };
}

function evaluateWalkForward(rows, variables, timeline) {
  const holdoutCount = Math.min(6, Math.floor(rows.length * 0.25));
  const firstTestIndex = rows.length - holdoutCount;
  if (holdoutCount < 3 || firstTestIndex <= variables.length + 3) return [];
  return rows.slice(firstTestIndex).map((actualRow, offset) => {
    const index = firstTestIndex + offset;
    const trainingRows = rows.slice(0, index);
    const model = fitArmax(trainingRows, variables);
    if (!model) return null;
    const predicted = forecast(model, trainingRows, variables, [actualRow], 1)[0];
    return {
      month: timeline[index],
      label: timeline[index] ? monthLabel(timeline[index], 0, { month: 'short' }) : String(index + 1),
      actual: actualRow.cases,
      predicted,
      residual: actualRow.cases - predicted,
    };
  }).filter(Boolean);
}

function percentile(values, proportion) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(proportion * sorted.length) - 1)];
}

export default function PredictionPage() {
  const [target, setTarget] = useState(TARGETS[0]);
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [dataset, setDataset] = useState(() => makeDemo(TARGETS[0]));
  const [csv, setCsv] = useState(() => toCsv(makeDemo(TARGETS[0])));
  const [demo, setDemo] = useState(true);
  const [variables, setVariables] = useState(['rain', 'humidity', 'temperature', 'sanitation']);
  const [horizon, setHorizon] = useState(3);
  const [lastObservedMonth, setLastObservedMonth] = useState(currentMonth);
  const [futureXByMonth, setFutureXByMonth] = useState(() => Array.from({ length: 6 }, () => ({ rain: 140, humidity: 78, temperature: 29, sanitation: 3.5, outbreak: 0 })));
  const [dataSource, setDataSource] = useState('');
  const [caseDefinition, setCaseDefinition] = useState('');
  const [inputError, setInputError] = useState('');
  const parsedRows = useMemo(() => parseCsv(csv), [csv]);
  const rows = demo ? dataset : parsedRows;
  const dataQuality = inspectDataset(rows, lastObservedMonth);
  const effectiveLastMonth = dataQuality.lastMonth || lastObservedMonth;
  const model = !inputError && dataQuality.valid && variables.length > 0 && rows.length > variables.length + 3 ? fitArmax(rows, variables) : null;
  const validationRows = model ? evaluateWalkForward(rows, variables, dataQuality.timeline) : [];
  const validationMae = avg(validationRows.map((row) => Math.abs(row.residual)));
  const validationRmse = Math.sqrt(avg(validationRows.map((row) => row.residual ** 2)));
  const hasEmpiricalRange = validationRows.length >= 5;
  const rangeError = hasEmpiricalRange
    ? percentile(validationRows.map((row) => Math.abs(row.residual)), 0.9)
    : model?.rmse ?? 0;
  const predictions = model ? forecast(model, rows, variables, futureXByMonth, horizon) : [];
  const last = rows.at(-1)?.cases ?? 0;
  const forecastRows = predictions.map((value, index) => {
    const margin = rangeError * Math.sqrt(index + 1);
    const previousValue = index === 0 ? last : predictions[index - 1];
    return {
      month: monthLabel(effectiveLastMonth, index + 1),
      label: monthLabel(effectiveLastMonth, index + 1, { month: 'short' }),
      value,
      lower: Math.max(0, Math.round((value - margin) * 10) / 10),
      upper: Math.round((value + margin) * 10) / 10,
      change: ((value - previousValue) / Math.max(previousValue, 1)) * 100,
    };
  });
  const change = predictions.length ? ((predictions.at(-1) - last) / Math.max(last, 1)) * 100 : 0;
  const toggleVariable = (key) => setVariables((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  const handleCsv = (value) => { setCsv(value); setDemo(false); setDataSource((current) => current === 'Data sintetis untuk demonstrasi' ? '' : current); const rowsParsed = parseCsv(value); setInputError(rowsParsed.length < value.trim().split(/\r?\n/).filter(Boolean).length ? 'Gunakan format opsional YYYY-MM, lalu kasus, hujan, kelembapan, suhu, sanitasi, dan laporan wabah (opsional). Angka desimal gunakan titik.' : ''); };
  const loadDemo = () => { const sample = makeDemo(target); setDataset(sample); setCsv(toCsv(sample)); setDemo(true); setInputError(''); setDataSource('Data sintetis untuk demonstrasi'); };
  const changeTarget = (value) => { setTarget(value); if (demo) { const sample = makeDemo(value); setDataset(sample); setCsv(toCsv(sample)); } };
  const updateFutureValue = (monthIndex, key, value) => setFutureXByMonth((current) => current.map((month, index) => index === monthIndex ? { ...month, [key]: Number(value) } : month));
  const exportCsv = () => {
    const source = demo ? 'data_sintetis_demo' : 'data_pengguna';
    const headers = ['periode', 'jenis_data', 'destinasi', 'target', 'bulan_ramalan', 'kasus', 'rentang_bawah_ilustratif', 'rentang_atas_ilustratif', ...VARIABLES.map((variable) => variable.key), 'sumber_data', 'definisi_kasus'];
    const historical = rows.map((row, index) => [dataQuality.timeline[index], 'historis', destination, target, '', row.cases, '', '', ...VARIABLES.map((variable) => row[variable.key]), dataSource || source, caseDefinition || target]);
    const forecasts = forecastRows.map((row, index) => [row.month, 'ramalan', destination, target, index + 1, row.value, row.lower, row.upper, ...VARIABLES.map((variable) => futureXByMonth[index][variable.key]), dataSource || source, caseDefinition || target]);
    const content = [headers, ...historical, ...forecasts].map((row) => row.map((field) => typeof field === 'string' && /[",\r\n]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gastro-predict-${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 900;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#f4faf8';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.roundRect(48, 48, 1304, 804, 32);
    context.fill();
    context.fillStyle = '#0f766e';
    context.font = '700 24px Arial';
    context.fillText('NUSA GASTRO · NUSA PREDICT', 96, 116);
    context.fillStyle = '#163b3a';
    context.font = '700 42px Arial';
    context.fillText('Prediksi risiko cerna', 96, 178);
    context.fillStyle = '#718581';
    context.font = '22px Arial';
    context.fillText(`${destination} · ${target}`, 96, 222);
    context.fillStyle = '#0f766e';
    context.font = '700 36px Arial';
    context.fillText(`${predictions.at(-1)} kasus`, 96, 294);
    context.fillStyle = '#83918d';
    context.font = '18px Arial';
    context.fillText(`Ramalan ${forecastRows.at(-1)?.month} · ${change >= 0 ? '+' : ''}${change.toFixed(1)}% dari data terakhir`, 96, 328);
    const chartLeft = 110;
    const chartTop = 390;
    const chartHeight = 300;
    const chartWidth = 1180;
    const historical = rows.slice(-8);
    const series = [...historical.map((row) => row.cases), ...predictions];
    const seriesMax = Math.max(1, ...series, ...forecastRows.map((row) => row.upper)) * 1.12;
    const pointX = (index) => chartLeft + (index * chartWidth) / Math.max(series.length - 1, 1);
    const pointY = (value) => chartTop + chartHeight - (value / seriesMax) * chartHeight;
    context.strokeStyle = '#e4eeea';
    context.lineWidth = 2;
    for (let line = 0; line <= 4; line += 1) {
      const y = chartTop + (chartHeight * line) / 4;
      context.beginPath(); context.moveTo(chartLeft, y); context.lineTo(chartLeft + chartWidth, y); context.stroke();
    }
    context.beginPath();
    context.moveTo(pointX(historical.length - 1), pointY(historical.at(-1).cases));
    forecastRows.forEach((row, index) => context.lineTo(pointX(historical.length + index), pointY(row.upper)));
    [...forecastRows].reverse().forEach((row, index) => context.lineTo(pointX(historical.length + forecastRows.length - 1 - index), pointY(row.lower)));
    context.closePath();
    context.fillStyle = '#f9e3ce';
    context.fill();
    context.beginPath();
    historical.forEach((row, index) => index ? context.lineTo(pointX(index), pointY(row.cases)) : context.moveTo(pointX(index), pointY(row.cases)));
    context.strokeStyle = '#14877b';
    context.lineWidth = 5;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.stroke();
    context.beginPath();
    context.moveTo(pointX(historical.length - 1), pointY(historical.at(-1).cases));
    forecastRows.forEach((row, index) => context.lineTo(pointX(historical.length + index), pointY(row.value)));
    context.strokeStyle = '#e58a42';
    context.setLineDash([12, 8]);
    context.stroke();
    context.setLineDash([]);
    series.forEach((value, index) => {
      context.beginPath();
      context.arc(pointX(index), pointY(value), index >= historical.length ? 7 : 6, 0, Math.PI * 2);
      context.fillStyle = '#fff';
      context.fill();
      context.strokeStyle = index >= historical.length ? '#e58a42' : '#14877b';
      context.lineWidth = 4;
      context.stroke();
      context.fillStyle = '#728580';
      context.font = '14px Arial';
      const monthOffset = index - historical.length + 1;
      const label = monthLabel(effectiveLastMonth, monthOffset, { month: 'short' });
      context.fillText(label, pointX(index) - context.measureText(label).width / 2, chartTop + chartHeight + 28);
    });
    context.fillStyle = '#82918d';
    context.font = '16px Arial';
    context.fillText(`ARMAX(1,1,${variables.length}) · RMSE latih ${model.rmse.toFixed(1)} · MAE walk-forward ${validationRows.length ? validationMae.toFixed(1) : 'n/a'} kasus · ${demo ? 'data sintetis/demo' : 'data pengguna'}`, 96, 764);
    context.fillStyle = '#a07540';
    context.font = '15px Arial';
    context.fillText(`${demo ? 'Data sintetis/demo' : 'Data pengguna'} bukan surveilans terverifikasi. Bukan diagnosis atau peringatan resmi.`, 96, 800);
    const link = document.createElement('a');
    link.download = `nusa-predict-${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return <main className="gg-prediction-page"><SiteHeader/><div className="gg-prediction-content"><div className="gg-prediction-intro"><span className="gg-prediction-kicker"><img src={publicAsset('nusa-gastro-assets/features/gastro-predict.png')} alt="" /><span className="gg-kicker">NUSA PREDICT · ARMAX</span></span><h1>Prediksi risiko cerna<br/>untuk keputusan perjalanan.</h1><p>Pilih kasus yang dipantau, tentukan variabel X, lalu latih model dari deret historis bulanan.</p></div>
      <div className="gg-model-notice"><BadgeInfo size={18}/><div><b>Transparansi model</b><span>Model ARMAX(1,1,k={variables.length}) dihitung dari data yang kamu masukkan, dengan satu lag kasus, satu lag residual, dan k variabel eksogen. Sampel awal di bawah ini adalah data sintetis untuk demonstrasi, bukan angka surveilans atau model tervalidasi. Gunakan data lokal terverifikasi sebelum mengambil keputusan kesehatan.</span></div><span className={demo ? 'gg-data-badge synthetic' : 'gg-data-badge'}>{demo ? 'DATA SINTETIS' : 'DATA PENGGUNA'}</span></div>
      <section className="gg-card gg-config-card"><div className="gg-prediction-card-head"><span className="gg-prediction-number">01</span><div><h2>Konfigurasikan prediksi</h2><p>Tentukan variabel kasus target dan faktor X (eksogen).</p></div><SlidersHorizontal size={19}/></div><div className="gg-prediction-fields"><label>DESTINASI<select value={destination} onChange={(event) => setDestination(event.target.value)}>{DESTINATIONS.map((value) => <option key={value}>{value}</option>)}</select></label><label>KASUS YANG DIPREDIKSI<select value={target} onChange={(event) => changeTarget(event.target.value)}>{TARGETS.map((value) => <option key={value}>{value}</option>)}</select></label><label>JANGKA RAMALAN<select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((value) => <option value={value} key={value}>{value} bulan ke depan</option>)}</select></label><label>BULAN TERAKHIR (JIKA CSV TANPA TANGGAL)<input type="month" disabled={dataQuality.explicitDates} value={lastObservedMonth} onChange={(event) => setLastObservedMonth(event.target.value || currentMonth())} aria-label="Bulan dan tahun periode historis terakhir"/></label></div><div className="gg-x-heading"><b>VARIABEL X · PREDIKTOR EKOGENOUS</b><small>Pilih variabel yang tersedia di dataset.</small></div><div className="gg-x-options">{VARIABLES.map((variable) => <label className={variables.includes(variable.key) ? 'active' : ''} key={variable.key}><input type="checkbox" checked={variables.includes(variable.key)} onChange={() => toggleVariable(variable.key)}/><span className="gg-x-check">{variables.includes(variable.key) ? '✓' : '+'}</span><span><b>{variable.label}</b><small>{variable.unit}</small></span></label>)}</div><div className="gg-monthly-x-wrap"><table className="gg-monthly-x-table"><caption>Asumsi X untuk setiap bulan ramalan</caption><thead><tr><th>Bulan</th>{VARIABLES.filter((variable) => variables.includes(variable.key)).map((variable) => <th key={variable.key}>{variable.label}</th>)}</tr></thead><tbody>{Array.from({ length: horizon }, (_, index) => <tr key={index}><th scope="row">{monthLabel(effectiveLastMonth, index + 1, { month: 'short', year: '2-digit' })}</th>{VARIABLES.filter((variable) => variables.includes(variable.key)).map((variable) => <td key={variable.key}><label className="sr-only" htmlFor={`future-${index}-${variable.key}`}>{variable.label} {monthLabel(effectiveLastMonth, index + 1)}</label><input id={`future-${index}-${variable.key}`} type="number" value={futureXByMonth[index][variable.key]} step={variable.key === 'temperature' || variable.key === 'sanitation' ? '0.1' : '1'} min={variable.key === 'sanitation' ? '1' : undefined} max={variable.key === 'sanitation' ? '5' : undefined} onChange={(event) => updateFutureValue(index, variable.key, event.target.value)}/></td>)}</tr>)}</tbody></table><p className="gg-validation-note">Isi dengan asumsi atau prakiraan yang memiliki sumber jelas. Nilai ini digunakan untuk bulan yang bersangkutan.</p></div></section>
      <section className="gg-card gg-data-card"><div className="gg-prediction-card-head"><span className="gg-prediction-number">02</span><div><h2>Deret waktu historis</h2><p>{rows.length} baris · target bulanan dan indikator eksogen.</p></div><Database size={19}/></div><div className="gg-csv-label"><span>opsional YYYY-MM, lalu kasus, hujan_mm, kelembapan_pct, suhu_c, sanitasi_1-5, laporan_wabah</span><button onClick={loadDemo}><RotateCcw size={14}/> Muat data demo</button></div><textarea value={csv} onChange={(event) => handleCsv(event.target.value)} spellCheck="false" aria-label="Deret waktu historis CSV"/><div className="gg-data-metadata"><label>SUMBER DATA<input value={dataSource || (demo ? 'Data sintetis untuk demonstrasi' : '')} onChange={(event) => setDataSource(event.target.value)} placeholder="Contoh: Dinas Kesehatan Kabupaten ..." disabled={demo}/></label><label>DEFINISI KASUS<input value={caseDefinition} onChange={(event) => setCaseDefinition(event.target.value)} placeholder={`Definisi operasional untuk ${target}`}/></label></div><div className="gg-data-quality"><span><small>STATUS DATA</small><b>{demo ? 'Sintetis / demo' : 'Data pengguna'}</b></span><span><small>PERIODE</small><b>{dataQuality.firstMonth ? monthLabel(dataQuality.firstMonth, 0) : '—'} sampai {dataQuality.lastMonth ? monthLabel(dataQuality.lastMonth, 0) : '—'}</b></span><span><small>OBSERVASI</small><b>{rows.length} bulan</b></span><span><small>KRONOLOGI</small><b>{dataQuality.explicitDates ? (dataQuality.valid ? 'Tanggal berurutan' : 'Perlu diperiksa') : 'Diasumsikan bulanan'}</b></span></div>{dataQuality.warnings.map((warning) => <p className="gg-data-warnings" key={warning}><CircleAlert size={14}/> {warning}</p>)}<div className="gg-data-footer"><span>Tanggal YYYY-MM boleh disertakan pada setiap baris · minimal {variables.length + 4} baris</span><span>{rows.length} baris valid</span></div>{inputError && <p className="gg-input-error"><CircleAlert size={14}/>{inputError}</p>}</section>
      <section className="gg-results-grid"><div className="gg-card gg-result-card"><div className="gg-prediction-card-head"><span className="gg-prediction-number coral">03</span><div><h2>Hasil model</h2><p>{destination} · {target}</p></div><ChartNoAxesCombined size={20}/></div>{!model ? <div className="gg-model-error"><CircleAlert size={17}/> {inputError || dataQuality.warnings.length ? 'Perbaiki data sesuai peringatan di atas agar model dapat dihitung.' : variables.length === 0 ? 'Pilih setidaknya satu variabel X untuk menghitung model.' : `Tambahkan minimal ${variables.length + 4} baris numerik untuk menghitung model.`}</div> : <><div className="gg-forecast-summary"><span><small>RAMALAN {forecastRows.at(-1)?.month.toLocaleUpperCase('id-ID')}</small><b>{predictions.at(-1)} <i>kasus</i></b></span><span className={change >= 0 ? 'increase' : 'decrease'}>{change >= 0 ? '+' : ''}{change.toFixed(1)}%<small>perubahan dari data terakhir</small></span></div>{renderForecastChart({ rows, forecastRows, month: effectiveLastMonth, rangeDescription: hasEmpiricalRange ? 'berbasis persentil ke-90 galat absolut walk-forward' : 'berbasis RMSE in-sample' })}<div className="gg-forecast-table-wrap"><table className="gg-forecast-table"><caption>Rincian ramalan bulanan dan rentang ilustratif</caption><thead><tr><th scope="col">Bulan</th><th scope="col">Prediksi kasus</th><th scope="col">Rentang ilustratif</th><th scope="col">Perubahan bulanan</th></tr></thead><tbody>{forecastRows.map((row) => <tr key={row.month}><th scope="row">{row.month}</th><td>{row.value.toFixed(1)} kasus</td><td>{row.lower.toFixed(1)}–{row.upper.toFixed(1)}</td><td className={row.change >= 0 ? 'positive' : 'negative'}>{row.change >= 0 ? '+' : ''}{row.change.toFixed(1)}%</td></tr>)}</tbody></table><p>{hasEmpiricalRange ? `Rentang ilustratif memakai persentil ke-90 galat absolut dari ${validationRows.length} prediksi walk-forward dan melebar menurut horizon; bukan interval prediksi terkalibrasi.` : `Rentang ilustratif sementara memakai RMSE in-sample${validationRows.length ? ` karena hanya tersedia ${validationRows.length} periode uji` : ' karena data belum cukup untuk validasi walk-forward'}; bukan interval prediksi terkalibrasi.`}</p></div><div className="gg-model-stats"><span><small>MODEL</small><b>ARMAX(1,1,k={variables.length})</b></span><span><small>OBSERVASI LATIH</small><b>{model.observations} bulan</b></span><span><small>RMSE IN-SAMPLE</small><b>{model.rmse.toFixed(1)} kasus</b></span><span><small>KOEFISIEN AR (γ₁)</small><b>{model.coefficients[1].toFixed(3)}</b></span><span><small>KOEFISIEN MA (θ₁)</small><b>{model.coefficients[2].toFixed(3)}</b></span></div><div className="gg-prediction-caution"><Info size={15}/><span>RMSE dihitung pada data latih dan bukan ukuran akurasi di masa depan. Rentang ilustratif tidak mencakup ketidakpastian parameter. Lakukan validasi walk-forward dan gunakan data kasus lokal terverifikasi sebelum penggunaan operasional.</span></div><div className="gg-export-actions"><button onClick={() => window.print()} disabled={!model}><Printer size={15}/> Unduh PDF</button><button onClick={exportPng} disabled={!model}><FileImage size={15}/> Unduh PNG</button><button onClick={exportCsv} disabled={!model}><FileSpreadsheet size={15}/> Excel (.csv)</button></div></>}</div><aside className="gg-card gg-method-card"><span className="gg-method-icon"><Activity size={20}/></span><h3>Bagaimana model bekerja?</h3><p className="gg-method-equation">Yₜ = α + Σᵢ₌₁ᵖ γᵢ·Yₜ₋ᵢ + Σⱼ₌₁ᵍ θⱼ·eₜ₋ⱼ + Σₘ₌₁ᵏ βₘ·Xₘ,ₜ + εₜ</p><ul><li><b>Yₜ</b> · kasus sasaran yang diprediksi</li><li><b>α</b> · konstanta model</li><li><b>γᵢ dan p</b> · koefisien dan jumlah lag kasus sebelumnya (p = 1)</li><li><b>θⱼ, eₜ₋ⱼ, dan g</b> · koefisien, residual, dan jumlah lag residual (g = 1)</li><li><b>βₘ dan Xₘ,ₜ</b> · pengaruh variabel eksogen terpilih</li><li><b>εₜ</b> · inovasi atau galat pada periode berjalan</li></ul><div className="gg-method-disclaimer"><CircleAlert size={15}/> Bukan alat diagnosis atau sistem peringatan resmi. Perbarui data dan cek pola musiman sebelum menafsirkan hasil.</div><a href="https://cdc.gov/yellow-book/hcp/preparing-international-travelers/travelers-diarrhea.html" target="_blank" rel="noreferrer" className="gg-source-link">Panduan kesehatan perjalanan CDC <ArrowUpRight size={13}/></a></aside><section className="gg-card gg-validation-section"><div className="gg-prediction-card-head"><span className="gg-prediction-number coral">04</span><div><h2>Validasi historis & galat</h2><p>Evaluasi walk-forward: setiap ramalan uji hanya menggunakan data yang tersedia sebelumnya.</p></div><ChartNoAxesCombined size={20}/></div>{validationRows.length >= 3 ? <><div className="gg-validation-metrics"><span><small>PERIODE UJI</small><b>{validationRows.length} bulan</b></span><span><small>MAE WALK-FORWARD</small><b>{validationMae.toFixed(1)} kasus</b></span><span><small>RMSE WALK-FORWARD</small><b>{validationRmse.toFixed(1)} kasus</b></span></div>{renderValidationChart(validationRows)}<h3>Residual validasi (aktual - prediksi)</h3>{renderResidualChart(validationRows)}<p className="gg-validation-note">Metrik hanya merangkum periode uji di bagian akhir deret. Data sintetis menghasilkan evaluasi demonstrasi, bukan bukti performa pada populasi nyata. Jumlah periode uji terbatas dan tidak menjamin akurasi mendatang.</p></> : <p className="gg-validation-note">Belum cukup observasi untuk validasi walk-forward yang berarti. Gunakan deret bulanan yang lebih panjang dan terverifikasi; hasil ini belum dapat dinilai dari data uji.</p>}</section></section><div className="gg-prediction-footer"><Download size={15}/> Untuk penggunaan penelitian, ekspor dan dokumentasikan sumber data, definisi kasus, serta validasi model.</div></div></main>;
}
