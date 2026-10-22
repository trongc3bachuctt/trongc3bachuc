import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Table as TableIcon,
  Layers,
  HelpCircle
} from 'lucide-react';

type CalcMode = 'CALC' | 'EQN' | 'TABLE' | 'COMPLEX' | 'VECTOR' | 'STAT';
type AngleUnit = 'DEG' | 'RAD';

interface CalculationHistoryItem {
  expression: string;
  result: string;
  exact?: string;
  mode: CalcMode;
  timestamp: string;
}

export const Casio880Calculator: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('CALC');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [isShift, setIsShift] = useState<boolean>(false);
  const [inputStr, setInputStr] = useState<string>('');
  const [resultStr, setResultStr] = useState<string>('0');
  const [exactResultStr, setExactResultStr] = useState<string>('');
  const [displayFormat, setDisplayFormat] = useState<'decimal' | 'fraction'>('decimal');
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [ans, setAns] = useState<string>('0');
  const [statusMessage, setStatusMessage] = useState<string>('fx-880 BTG READY');

  // Equation Mode State
  const [eqnType, setEqnType] = useState<'quad' | 'cubic' | 'sys2' | 'sys3'>('quad');
  const [eqnCoeffs, setEqnCoeffs] = useState<Record<string, string>>({
    a: '1', b: '-5', c: '6', d: '0',
    a1: '2', b1: '3', c1: '13',
    a2: '1', b2: '-1', c2: '4',
    a3: '1', b3: '1', c3: '1', d1: '6', d2: '3', d3: '14'
  });
  const [eqnResult, setEqnResult] = useState<string[]>([]);

  // Table Mode State
  const [tableFunc, setTableFunc] = useState<string>('x^3 - 3*x + 1');
  const [tableRange, setTableRange] = useState<{ start: number; end: number; step: number }>({
    start: -2,
    end: 3,
    step: 0.5
  });
  const [tableRows, setTableRows] = useState<{ x: number; fx: number }[]>([]);

  // Vector Mode State
  const [vecA, setVecA] = useState<[number, number, number]>([1, 2, -1]);
  const [vecB, setVecB] = useState<[number, number, number]>([3, 0, 2]);
  const [vecResult, setVecResult] = useState<{
    dot: number;
    cross: [number, number, number];
    lenA: number;
    lenB: number;
    angleDeg: number;
  } | null>(null);

  // Statistics Mode State
  const [statInput, setStatInput] = useState<string>('6.5, 7.0, 8.5, 9.0, 8.0, 7.5, 9.5, 8.0');
  const [statResult, setStatResult] = useState<{
    count: number;
    mean: number;
    variance: number;
    sd: number;
    median: number;
    min: number;
    max: number;
  } | null>(null);

  // Handle number & operator typing
  const handleKey = (char: string) => {
    setStatusMessage('');
    if (char === 'ANS') {
      setInputStr(prev => prev + ans);
      return;
    }
    if (char === 'AC') {
      setInputStr('');
      setResultStr('0');
      setExactResultStr('');
      return;
    }
    if (char === 'DEL') {
      setInputStr(prev => prev.slice(0, -1));
      return;
    }
    setInputStr(prev => prev + char);
  };

  // Safe Math Expression Evaluator
  const evaluateExpression = (expr: string): { num: number; exact?: string } => {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/(\d+),(\d+)/g, '$1.$2')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`)
      .replace(/\^/g, '**');

    // Handle Ans
    sanitized = sanitized.replace(/Ans/g, ans || '0');

    // Handle Factorials x!
    sanitized = sanitized.replace(/(\d+)!/g, (_, n) => {
      let num = parseInt(n, 10);
      if (num < 0 || num > 170) return 'Infinity';
      let r = 1;
      for (let i = 2; i <= num; i++) r *= i;
      return `${r}`;
    });

    // Handle Combinations nCr and Permutations nPr
    sanitized = sanitized.replace(/(\d+)C(\d+)/g, (_, nStr, rStr) => {
      const n = parseInt(nStr, 10);
      const r = parseInt(rStr, 10);
      if (r > n || r < 0) return '0';
      let num = 1;
      for (let i = 0; i < r; i++) num = (num * (n - i)) / (i + 1);
      return `${Math.round(num)}`;
    });

    sanitized = sanitized.replace(/(\d+)P(\d+)/g, (_, nStr, rStr) => {
      const n = parseInt(nStr, 10);
      const r = parseInt(rStr, 10);
      if (r > n || r < 0) return '0';
      let num = 1;
      for (let i = 0; i < r; i++) num *= (n - i);
      return `${Math.round(num)}`;
    });

    // Handle Square Root
    sanitized = sanitized.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
    sanitized = sanitized.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');

    // Handle Trig
    const degToRad = angleUnit === 'DEG' ? `* (${Math.PI} / 180)` : '';
    sanitized = sanitized.replace(/sin\(([^)]+)\)/g, `Math.sin(($1) ${degToRad})`);
    sanitized = sanitized.replace(/cos\(([^)]+)\)/g, `Math.cos(($1) ${degToRad})`);
    sanitized = sanitized.replace(/tan\(([^)]+)\)/g, `Math.tan(($1) ${degToRad})`);
    sanitized = sanitized.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
    sanitized = sanitized.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
    sanitized = sanitized.replace(/log_([0-9.]+)\(([^)]+)\)/g, '(Math.log($2)/Math.log($1))');

    // Simple numeric integration: int(f(x), a, b)
    sanitized = sanitized.replace(/int\(([^,]+),([^,]+),([^)]+)\)/g, (_, fStr, aStr, bStr) => {
      const aVal = parseFloat(aStr);
      const bVal = parseFloat(bStr);
      const steps = 100;
      const h = (bVal - aVal) / steps;
      let sum = 0;
      for (let i = 0; i <= steps; i++) {
        const xVal = aVal + i * h;
        const weight = (i === 0 || i === steps) ? 1 : (i % 2 === 0 ? 2 : 4);
        try {
          const evalF = Function('x', `return ${fStr.replace(/\^/g, '**')}`)(xVal);
          sum += weight * evalF;
        } catch {
          // ignore
        }
      }
      return `${(h / 3) * sum}`;
    });

    // Simple numerical derivative: diff(f(x), x0)
    sanitized = sanitized.replace(/diff\(([^,]+),([^)]+)\)/g, (_, fStr, x0Str) => {
      const x0 = parseFloat(x0Str);
      const eps = 1e-6;
      try {
        const f1 = Function('x', `return ${fStr.replace(/\^/g, '**')}`)(x0 + eps);
        const f0 = Function('x', `return ${fStr.replace(/\^/g, '**')}`)(x0 - eps);
        return `${(f1 - f0) / (2 * eps)}`;
      } catch {
        return '0';
      }
    });

    // Handle implicit multiplication
    sanitized = sanitized.replace(/(\d+)\s*Math\./g, '$1 * Math.')
                         .replace(/(\d+)\s*\(/g, '$1 * (')
                         .replace(/\)\s*\(/g, ') * (')
                         .replace(/\)\s*(\d+)/g, ') * $1');

    // Evaluate safely
    // eslint-disable-next-line no-new-func
    const val = Function(`'use strict'; return (${sanitized});`)();
    if (typeof val !== 'number' || isNaN(val)) {
      throw new Error('Cú pháp không hợp lệ');
    }

    // Try finding exact fraction for rational numbers
    let exact = undefined;
    for (let denom = 1; denom <= 100; denom++) {
      const num = Math.round(val * denom);
      if (Math.abs(val - num / denom) < 1e-9 && denom > 1) {
        exact = `${num}/${denom}`;
        break;
      }
    }

    return { num: val, exact };
  };

  // Handle Calculate (EXE key)
  const handleExecute = () => {
    if (!inputStr.trim()) return;
    try {
      const { num, exact } = evaluateExpression(inputStr);
      const resStr = Number.isInteger(num)
        ? num.toString()
        : Math.abs(num) < 1e-10
        ? '0'
        : parseFloat(num.toFixed(10)).toString();

      setResultStr(resStr);
      setExactResultStr(exact || '');
      setAns(resStr);
      setIsShift(false);

      setHistory(prev => [
        {
          expression: inputStr,
          result: resStr,
          exact,
          mode,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev.slice(0, 24)
      ]);
    } catch (err: any) {
      setResultStr('LỖI CÚ PHÁP');
      setExactResultStr('');
      setStatusMessage('Bấm AC để nhập lại');
    }
  };

  // Toggle S<=>D (Format)
  const handleToggleFormat = () => {
    if (!exactResultStr) {
      // Toggle scientific notation
      const num = parseFloat(resultStr);
      if (!isNaN(num)) {
        if (displayFormat === 'decimal') {
          setResultStr(num.toExponential(4));
          setDisplayFormat('fraction');
        } else {
          setResultStr(parseFloat(num.toFixed(10)).toString());
          setDisplayFormat('decimal');
        }
      }
      return;
    }
    if (displayFormat === 'decimal') {
      setDisplayFormat('fraction');
    } else {
      setDisplayFormat('decimal');
    }
  };

  // Solve Equation
  const handleSolveEquation = () => {
    if (eqnType === 'quad') {
      const a = parseFloat(eqnCoeffs.a);
      const b = parseFloat(eqnCoeffs.b);
      const c = parseFloat(eqnCoeffs.c);
      if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
        setEqnResult(['Hệ số a phải khác 0!']);
        return;
      }
      const delta = b * b - 4 * a * c;
      const xv = -b / (2 * a);
      const yv = a * xv * xv + b * xv + c;

      if (delta > 0) {
        const x1 = (-b + Math.sqrt(delta)) / (2 * a);
        const x2 = (-b - Math.sqrt(delta)) / (2 * a);
        setEqnResult([
          `x₁ = ${parseFloat(x1.toFixed(6))}`,
          `x₂ = ${parseFloat(x2.toFixed(6))}`,
          `Δ = ${parseFloat(delta.toFixed(6))}`,
          `Đỉnh Parabol: (${parseFloat(xv.toFixed(4))}; ${parseFloat(yv.toFixed(4))})`
        ]);
      } else if (delta === 0) {
        const x0 = -b / (2 * a);
        setEqnResult([
          `Nghiệm kép: x₁ = x₂ = ${parseFloat(x0.toFixed(6))}`,
          `Δ = 0`,
          `Đỉnh Parabol: (${parseFloat(xv.toFixed(4))}; ${parseFloat(yv.toFixed(4))})`
        ]);
      } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-delta) / (2 * a);
        setEqnResult([
          `x₁ = ${parseFloat(real.toFixed(6))} + ${parseFloat(imag.toFixed(6))}i`,
          `x₂ = ${parseFloat(real.toFixed(6))} - ${parseFloat(imag.toFixed(6))}i`,
          `Δ = ${parseFloat(delta.toFixed(6))} < 0 (2 nghiệm phức)`,
          `Đỉnh Parabol: (${parseFloat(xv.toFixed(4))}; ${parseFloat(yv.toFixed(4))})`
        ]);
      }
    } else if (eqnType === 'sys2') {
      const a1 = parseFloat(eqnCoeffs.a1), b1 = parseFloat(eqnCoeffs.b1), c1 = parseFloat(eqnCoeffs.c1);
      const a2 = parseFloat(eqnCoeffs.a2), b2 = parseFloat(eqnCoeffs.b2), c2 = parseFloat(eqnCoeffs.c2);
      const D = a1 * b2 - a2 * b1;
      const Dx = c1 * b2 - c2 * b1;
      const Dy = a1 * c2 - a2 * c1;
      if (Math.abs(D) < 1e-12) {
        if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12) {
          setEqnResult(['Hệ phương trình có vô số nghiệm']);
        } else {
          setEqnResult(['Hệ phương trình vô nghiệm']);
        }
      } else {
        const x = Dx / D;
        const y = Dy / D;
        setEqnResult([
          `x = ${parseFloat(x.toFixed(6))}`,
          `y = ${parseFloat(y.toFixed(6))}`
        ]);
      }
    } else if (eqnType === 'cubic') {
      // Numerical roots for cubic ax^3 + bx^2 + cx + d = 0
      const a = parseFloat(eqnCoeffs.a);
      const b = parseFloat(eqnCoeffs.b);
      const c = parseFloat(eqnCoeffs.c);
      const d = parseFloat(eqnCoeffs.d);
      if (isNaN(a) || a === 0) {
        setEqnResult(['Hệ số a phải khác 0']);
        return;
      }
      // Scan intervals
      const roots: number[] = [];
      for (let x = -100; x <= 100; x += 0.2) {
        const f1 = a * x ** 3 + b * x ** 2 + c * x + d;
        const xNext = x + 0.2;
        const f2 = a * xNext ** 3 + b * xNext ** 2 + c * xNext + d;
        if (f1 * f2 <= 0) {
          // Bisection refinement
          let l = x, r = xNext;
          for (let k = 0; k < 20; k++) {
            const mid = (l + r) / 2;
            const fMid = a * mid ** 3 + b * mid ** 2 + c * mid + d;
            if (fMid * (a * l ** 3 + b * l ** 2 + c * l + d) <= 0) r = mid;
            else l = mid;
          }
          const rootVal = parseFloat(((l + r) / 2).toFixed(5));
          if (!roots.some(val => Math.abs(val - rootVal) < 1e-3)) {
            roots.push(rootVal);
          }
        }
      }
      setEqnResult(
        roots.length > 0
          ? roots.map((r, idx) => `x${idx + 1} = ${r}`)
          : ['Không tìm thấy nghiệm thực trong khoảng [-100; 100]']
      );
    }
  };

  // Generate Table
  const handleGenerateTable = () => {
    try {
      const rows: { x: number; fx: number }[] = [];
      const { start, end, step } = tableRange;
      if (step <= 0 || start >= end) {
        alert('Bước nhảy phải lớn hơn 0 và Start < End');
        return;
      }
      const safeFunc = tableFunc
        .replace(/\^/g, '**')
        .replace(/sin\(/g, `Math.sin(`)
        .replace(/cos\(/g, `Math.cos(`)
        .replace(/tan\(/g, `Math.tan(`)
        .replace(/sqrt\(/g, `Math.sqrt(`)
        .replace(/log\(/g, `Math.log10(`)
        .replace(/ln\(/g, `Math.log(`);

      // eslint-disable-next-line no-new-func
      const fn = new Function('x', `return (${safeFunc});`);
      for (let x = start; x <= end + 1e-9; x += step) {
        const rx = parseFloat(x.toFixed(4));
        try {
          const val = fn(rx);
          rows.push({ x: rx, fx: parseFloat(val.toFixed(5)) });
        } catch {
          rows.push({ x: rx, fx: NaN });
        }
      }
      setTableRows(rows);
    } catch (e: any) {
      alert('Hàm số không hợp lệ: ' + e.message);
    }
  };

  // Compute Vector Operations
  const handleComputeVector = () => {
    const dot = vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2];
    const cross: [number, number, number] = [
      vecA[1] * vecB[2] - vecA[2] * vecB[1],
      vecA[2] * vecB[0] - vecA[0] * vecB[2],
      vecA[0] * vecB[1] - vecA[1] * vecB[0]
    ];
    const lenA = Math.sqrt(vecA[0] ** 2 + vecA[1] ** 2 + vecA[2] ** 2);
    const lenB = Math.sqrt(vecB[0] ** 2 + vecB[1] ** 2 + vecB[2] ** 2);
    const cosAngle = (lenA * lenB > 0) ? (dot / (lenA * lenB)) : 0;
    const clampedCos = Math.max(-1, Math.min(1, cosAngle));
    const angleDeg = (Math.acos(clampedCos) * 180) / Math.PI;

    setVecResult({
      dot: parseFloat(dot.toFixed(4)),
      cross: [parseFloat(cross[0].toFixed(4)), parseFloat(cross[1].toFixed(4)), parseFloat(cross[2].toFixed(4))],
      lenA: parseFloat(lenA.toFixed(4)),
      lenB: parseFloat(lenB.toFixed(4)),
      angleDeg: parseFloat(angleDeg.toFixed(2))
    });
  };

  // Compute Statistics
  const handleComputeStat = () => {
    const nums = statInput
      .split(/[,;\s]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (nums.length === 0) {
      alert('Vui lòng nhập ít nhất 1 số');
      return;
    }

    const n = nums.length;
    const mean = nums.reduce((a, b) => a + b, 0) / n;
    const variance = nums.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (n - 1 || 1);
    const sd = Math.sqrt(variance);

    const sorted = [...nums].sort((a, b) => a - b);
    const median = n % 2 === 1 ? sorted[Math.floor(n / 2)] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    setStatResult({
      count: n,
      mean: parseFloat(mean.toFixed(4)),
      variance: parseFloat(variance.toFixed(4)),
      sd: parseFloat(sd.toFixed(4)),
      median: parseFloat(median.toFixed(4)),
      min: sorted[0],
      max: sorted[n - 1]
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MÁY TÍNH KHOA HỌC CHUẨN BỘ GD&amp;ĐT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CalcIcon className="w-8 h-8 text-amber-400" />
            <span>Máy Tính Khoa Học Casio fx-880 BTG Plus</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Mô phỏng đầy đủ tính năng dòng máy tính Casio fx-880 BTG: Phép tính phân số, căn, đạo hàm, tích phân, giải phương trình đa thức &amp; hệ phương trình, bảng giá trị hàm số, vectơ Oxyz và thống kê.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          {(['CALC', 'EQN', 'TABLE', 'VECTOR', 'STAT'] as CalcMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setStatusMessage(`Chuyển sang ứng dụng ${m}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === m
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              {m === 'CALC' && '1. Phép tính'}
              {m === 'EQN' && '2. Phương trình'}
              {m === 'TABLE' && '3. Bảng giá trị'}
              {m === 'VECTOR' && '4. Vectơ Oxyz'}
              {m === 'STAT' && '5. Thống kê'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Casio 880 Physical Chassis */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-7 rounded-3xl shadow-2xl border-4 border-slate-800 relative">
          {/* Top Brand Casing */}
          <div className="flex justify-between items-center mb-3 text-slate-400 text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-widest text-white text-sm">CASIO</span>
              <span className="text-[11px] font-bold text-amber-400 border border-amber-400/40 px-1.5 py-0.5 rounded">
                fx-880 BTG
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-wider text-slate-400 font-mono">CLASSWIZ</span>
              {/* Solar cell aesthetic */}
              <div className="w-16 h-3 bg-gradient-to-r from-amber-950/60 to-amber-900/40 rounded border border-amber-900/50"></div>
            </div>
          </div>

          {/* Natural Textbook Display Screen */}
          <div className="bg-[#A4B8AB] text-[#112015] font-mono rounded-xl p-4 shadow-inner border-2 border-slate-700 mb-5 relative min-h-[135px] flex flex-col justify-between select-none">
            {/* Status Line */}
            <div className="flex justify-between items-center text-[11px] font-bold border-b border-black/15 pb-1 opacity-85">
              <div className="flex items-center gap-2">
                <span className={`px-1 rounded ${isShift ? 'bg-amber-800 text-white' : ''}`}>S</span>
                <span>{angleUnit}</span>
                <span className="bg-black/10 px-1 rounded">{mode}</span>
              </div>
              <div className="text-[10px] truncate max-w-[200px]">
                {statusMessage || (displayFormat === 'fraction' && exactResultStr ? `D= ${exactResultStr}` : 'NATURAL-V.P.A.M.')}
              </div>
            </div>

            {/* Input Expression Line */}
            <div className="text-right text-base sm:text-lg font-semibold tracking-wide py-2 min-h-[32px] overflow-x-auto whitespace-nowrap scrollbar-none">
              {inputStr || <span className="opacity-30">0</span>}
              <span className="animate-pulse inline-block w-2 h-4 bg-black/60 ml-0.5 align-middle"></span>
            </div>

            {/* Result Line */}
            <div className="text-right text-2xl sm:text-3xl font-black tracking-wider flex justify-between items-end pt-1 border-t border-black/10">
              <div className="text-xs font-sans text-slate-800 flex items-center gap-1">
                {exactResultStr && (
                  <button
                    onClick={handleToggleFormat}
                    className="underline text-[11px] font-bold cursor-pointer hover:text-black"
                    title="Chuyển đổi phân số <-> số thập phân (S<=>D)"
                  >
                    [S⇔D: {displayFormat === 'decimal' ? exactResultStr : resultStr}]
                  </button>
                )}
              </div>
              <div className="truncate">
                {displayFormat === 'fraction' && exactResultStr ? exactResultStr : resultStr}
              </div>
            </div>
          </div>

          {/* Quick Shift & Angle Toggles */}
          <div className="flex justify-between items-center gap-2 mb-4 px-1">
            <button
              onClick={() => setIsShift(!isShift)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                isShift
                  ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-600/30 text-amber-300 hover:bg-amber-500/40 border border-amber-500/50'
              }`}
            >
              SHIFT
            </button>

            <button
              onClick={() => {
                const nextUnit = angleUnit === 'DEG' ? 'RAD' : 'DEG';
                setAngleUnit(nextUnit);
                setStatusMessage(`Đơn vị góc: ${nextUnit}`);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              Đơn vị: {angleUnit} (Độ/Rad)
            </button>

            <button
              onClick={handleToggleFormat}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer"
              title="Chuyển đổi số thập phân sang phân số hoặc ngược lại"
            >
              FORMAT (S⇔D)
            </button>

            <button
              onClick={() => {
                setInputStr('');
                setResultStr('0');
                setExactResultStr('');
                setStatusMessage('Đã xóa bộ nhớ màn hình (AC)');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer"
            >
              AC (Xóa)
            </button>
          </div>

          {/* Casio 880 Specialized Keypad Grid */}
          <div className="space-y-2">
            {/* Row 1: High Scientific Functions */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              <button
                onClick={() => handleKey(isShift ? 'diff(' : 'x^2')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700"
              >
                {isShift ? 'd/dx' : 'x²'}
              </button>
              <button
                onClick={() => handleKey(isShift ? 'int(' : '^')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700"
              >
                {isShift ? '∫dx' : 'xⁿ'}
              </button>
              <button
                onClick={() => handleKey(isShift ? '√(' : '√(')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700"
              >
                √
              </button>
              <button
                onClick={() => handleKey(isShift ? 'log_2(' : 'log(')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700"
              >
                {isShift ? 'log₂' : 'log'}
              </button>
              <button
                onClick={() => handleKey(isShift ? 'e^(' : 'ln(')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700"
              >
                {isShift ? 'eˣ' : 'ln'}
              </button>
              <button
                onClick={() => handleKey('^(-1)')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700"
              >
                x⁻¹
              </button>
            </div>

            {/* Row 2: Trig & Brackets */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              <button
                onClick={() => handleKey(isShift ? 'sin(' : 'sin(')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700"
              >
                sin
              </button>
              <button
                onClick={() => handleKey(isShift ? 'cos(' : 'cos(')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700"
              >
                cos
              </button>
              <button
                onClick={() => handleKey(isShift ? 'tan(' : 'tan(')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg border border-slate-700"
              >
                tan
              </button>
              <button
                onClick={() => handleKey('(')}
                className="calc-btn text-sm font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
              >
                (
              </button>
              <button
                onClick={() => handleKey(')')}
                className="calc-btn text-sm font-bold p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
              >
                )
              </button>
              <button
                onClick={() => handleKey(isShift ? 'P' : 'C')}
                className="calc-btn text-xs font-bold p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700"
                title={isShift ? 'Chỉnh hợp nPr' : 'Tổ hợp nCr'}
              >
                {isShift ? 'nPr' : 'nCr'}
              </button>
            </div>

            {/* Main Numeric Pad & Primary Operators */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {/* Row 1 Numbers */}
              <button
                onClick={() => handleKey('7')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                7
              </button>
              <button
                onClick={() => handleKey('8')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                8
              </button>
              <button
                onClick={() => handleKey('9')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                9
              </button>
              <button
                onClick={() => handleKey('DEL')}
                className="p-3 text-sm font-black bg-rose-900/80 hover:bg-rose-800 text-white rounded-xl shadow-xs"
              >
                DEL
              </button>
              <button
                onClick={() => handleKey('÷')}
                className="p-3 text-lg font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40"
              >
                ÷
              </button>

              {/* Row 2 Numbers */}
              <button
                onClick={() => handleKey('4')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                4
              </button>
              <button
                onClick={() => handleKey('5')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                5
              </button>
              <button
                onClick={() => handleKey('6')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                6
              </button>
              <button
                onClick={() => handleKey('×')}
                className="p-3 text-lg font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40"
              >
                ×
              </button>
              <button
                onClick={() => handleKey('-')}
                className="p-3 text-lg font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40"
              >
                −
              </button>

              {/* Row 3 Numbers */}
              <button
                onClick={() => handleKey('1')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                1
              </button>
              <button
                onClick={() => handleKey('2')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                2
              </button>
              <button
                onClick={() => handleKey('3')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                3
              </button>
              <button
                onClick={() => handleKey('+')}
                className="p-3 text-lg font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40"
              >
                +
              </button>
              <button
                onClick={() => handleKey('π')}
                className="p-3 text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
              >
                π
              </button>

              {/* Row 4 Numbers & Execution */}
              <button
                onClick={() => handleKey('0')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                0
              </button>
              <button
                onClick={() => handleKey('.')}
                className="p-3 text-lg font-bold bg-slate-700/80 hover:bg-slate-600 text-white rounded-xl shadow-xs"
              >
                .
              </button>
              <button
                onClick={() => handleKey('ANS')}
                className="p-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
              >
                Ans
              </button>
              <button
                onClick={() => handleKey('!')}
                className="p-3 text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
              >
                n!
              </button>
              <button
                onClick={handleExecute}
                className="p-3 text-base font-black bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 rounded-xl shadow-md cursor-pointer"
              >
                EXE
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Mode Workspace / Advanced Tools */}
        <div className="lg:col-span-5 space-y-4">
          {/* EQUATION SOLVER PANEL */}
          {mode === 'EQN' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>📐 Giải Phương Trình &amp; Hệ Phương Trình</span>
                </h3>
                <select
                  value={eqnType}
                  onChange={(e) => {
                    setEqnType(e.target.value as any);
                    setEqnResult([]);
                  }}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-1.5"
                >
                  <option value="quad">Bậc hai: ax² + bx + c = 0</option>
                  <option value="cubic">Bậc ba: ax³ + bx² + cx + d = 0</option>
                  <option value="sys2">Hệ 2 ẩn bậc nhất</option>
                </select>
              </div>

              {eqnType === 'quad' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Hệ số a</label>
                      <input
                        type="number"
                        value={eqnCoeffs.a}
                        onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, a: e.target.value })}
                        className="w-full border rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Hệ số b</label>
                      <input
                        type="number"
                        value={eqnCoeffs.b}
                        onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, b: e.target.value })}
                        className="w-full border rounded-lg p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Hệ số c</label>
                      <input
                        type="number"
                        value={eqnCoeffs.c}
                        onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, c: e.target.value })}
                        className="w-full border rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSolveEquation}
                    className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Bấm Giải (EXE)
                  </button>
                </div>
              )}

              {eqnType === 'sys2' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="a1"
                      value={eqnCoeffs.a1}
                      onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, a1: e.target.value })}
                      className="border rounded p-2"
                    />
                    <input
                      type="number"
                      placeholder="b1"
                      value={eqnCoeffs.b1}
                      onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, b1: e.target.value })}
                      className="border rounded p-2"
                    />
                    <input
                      type="number"
                      placeholder="c1"
                      value={eqnCoeffs.c1}
                      onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, c1: e.target.value })}
                      className="border rounded p-2"
                    />
                    <input
                      type="number"
                      placeholder="a2"
                      value={eqnCoeffs.a2}
                      onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, a2: e.target.value })}
                      className="border rounded p-2"
                    />
                    <input
                      type="number"
                      placeholder="b2"
                      value={eqnCoeffs.b2}
                      onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, b2: e.target.value })}
                      className="border rounded p-2"
                    />
                    <input
                      type="number"
                      placeholder="c2"
                      value={eqnCoeffs.c2}
                      onChange={(e) => setEqnCoeffs({ ...eqnCoeffs, c2: e.target.value })}
                      className="border rounded p-2"
                    />
                  </div>
                  <button
                    onClick={handleSolveEquation}
                    className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Bấm Giải Hệ 2 Ẩn (EXE)
                  </button>
                </div>
              )}

              {eqnResult.length > 0 && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1 text-sm font-mono font-bold text-teal-900">
                  {eqnResult.map((res, i) => (
                    <div key={i}>{res}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TABLE MODE PANEL */}
          {mode === 'TABLE' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">📊 Bảng Giá Trị Hàm Số f(x)</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hàm số f(x):</label>
                  <input
                    type="text"
                    value={tableFunc}
                    onChange={(e) => setTableFunc(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono font-bold"
                    placeholder="ví dụ: x^3 - 3*x + 1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Start</label>
                    <input
                      type="number"
                      value={tableRange.start}
                      onChange={(e) => setTableRange({ ...tableRange, start: parseFloat(e.target.value) || 0 })}
                      className="w-full border rounded-lg p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">End</label>
                    <input
                      type="number"
                      value={tableRange.end}
                      onChange={(e) => setTableRange({ ...tableRange, end: parseFloat(e.target.value) || 0 })}
                      className="w-full border rounded-lg p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Step</label>
                    <input
                      type="number"
                      value={tableRange.step}
                      onChange={(e) => setTableRange({ ...tableRange, step: parseFloat(e.target.value) || 0.5 })}
                      className="w-full border rounded-lg p-1.5 font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateTable}
                  className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Tạo Bảng Giá Trị (EXE)
                </button>
              </div>

              {tableRows.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead className="bg-slate-100 sticky top-0 font-bold text-slate-700">
                      <tr>
                        <th className="p-2 border-b">STT</th>
                        <th className="p-2 border-b">x</th>
                        <th className="p-2 border-b">f(x)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {tableRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-1.5 text-slate-400">{idx + 1}</td>
                          <td className="p-1.5 font-bold text-slate-800">{row.x}</td>
                          <td className="p-1.5 font-bold text-teal-800">{row.fx}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VECTOR MODE PANEL */}
          {mode === 'VECTOR' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-base pb-2 border-b">
                🧭 Toạ độ Vectơ Trong Không Gian Oxyz
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vectơ u (x, y, z):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={vecA[0]}
                      onChange={(e) => setVecA([parseFloat(e.target.value) || 0, vecA[1], vecA[2]])}
                      className="border rounded p-1.5 font-mono text-center"
                    />
                    <input
                      type="number"
                      value={vecA[1]}
                      onChange={(e) => setVecA([vecA[0], parseFloat(e.target.value) || 0, vecA[2]])}
                      className="border rounded p-1.5 font-mono text-center"
                    />
                    <input
                      type="number"
                      value={vecA[2]}
                      onChange={(e) => setVecA([vecA[0], vecA[1], parseFloat(e.target.value) || 0])}
                      className="border rounded p-1.5 font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vectơ v (x, y, z):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={vecB[0]}
                      onChange={(e) => setVecB([parseFloat(e.target.value) || 0, vecB[1], vecB[2]])}
                      className="border rounded p-1.5 font-mono text-center"
                    />
                    <input
                      type="number"
                      value={vecB[1]}
                      onChange={(e) => setVecB([vecB[0], parseFloat(e.target.value) || 0, vecB[2]])}
                      className="border rounded p-1.5 font-mono text-center"
                    />
                    <input
                      type="number"
                      value={vecB[2]}
                      onChange={(e) => setVecB([vecB[0], vecB[1], parseFloat(e.target.value) || 0])}
                      className="border rounded p-1.5 font-mono text-center"
                    />
                  </div>
                </div>

                <button
                  onClick={handleComputeVector}
                  className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Tính Tích Vô Hướng &amp; Có Hướng (EXE)
                </button>
              </div>

              {vecResult && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 font-mono font-bold text-teal-900">
                  <div>Tích vô hướng u · v = {vecResult.dot}</div>
                  <div>Tích có hướng [u, v] = ({vecResult.cross.join('; ')})</div>
                  <div>Độ dài |u| = {vecResult.lenA}</div>
                  <div>Độ dài |v| = {vecResult.lenB}</div>
                  <div>Góc (u, v) = {vecResult.angleDeg}°</div>
                </div>
              )}
            </div>
          )}

          {/* STATISTICS MODE PANEL */}
          {mode === 'STAT' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-base pb-2 border-b">
                📈 Thống Kê &amp; Độ Phân Tán Mẫu Số Liệu
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nhập dãy số liệu (cách nhau bởi dấu phẩy):
                  </label>
                  <textarea
                    rows={3}
                    value={statInput}
                    onChange={(e) => setStatInput(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono"
                  ></textarea>
                </div>
                <button
                  onClick={handleComputeStat}
                  className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg cursor-pointer"
                >
                  Tính Đặc Trưng Thống Kê (EXE)
                </button>
              </div>

              {statResult && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 font-mono font-bold text-teal-900">
                  <div>Số quan sát n = {statResult.count}</div>
                  <div>Số trung bình x̄ = {statResult.mean}</div>
                  <div>Phương sai s² = {statResult.variance}</div>
                  <div>Độ lệch chuẩn s = {statResult.sd}</div>
                  <div>Trung vị Me = {statResult.median}</div>
                  <div>Min = {statResult.min} | Max = {statResult.max}</div>
                </div>
              )}
            </div>
          )}

          {/* CALCULATION HISTORY TAPE */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-teal-700" />
                <span>Nhật Ký Tính Toán (Lịch sử)</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Xóa lịch sử
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Chưa có phép tính nào. Các phép tính sẽ tự động lưu lại tại đây.
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setInputStr(item.expression);
                      setResultStr(item.result);
                      setExactResultStr(item.exact || '');
                    }}
                    className="pt-2 text-xs font-mono cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                    title="Bấm để đưa lại biểu thức lên màn hình tính toán"
                  >
                    <div className="text-slate-500 truncate flex justify-between">
                      <span>{item.expression} =</span>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <div className="text-teal-800 font-bold text-sm text-right">
                      {item.exact ? `${item.result} (${item.exact})` : item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
