import React, { useState } from 'react';

interface InteractiveGraphProps {
  initialType?: 'cubic' | 'quadratic' | 'rational';
  className?: string;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  initialType = 'cubic',
  className = '',
}) => {
  const [funcType, setFuncType] = useState<'cubic' | 'quadratic' | 'rational'>(initialType);
  const [paramA, setParamA] = useState<number>(1);
  const [paramB, setParamB] = useState<number>(-3);
  const [paramC, setParamC] = useState<number>(1);

  // SVG coordinate mapping: center is (180, 130), scale is 30px per unit
  const width = 380;
  const height = 260;
  const originX = 190;
  const originY = 130;
  const scale = 28;

  const toSvgX = (x: number) => originX + x * scale;
  const toSvgY = (y: number) => originY - y * scale;

  // Evaluate function
  const evaluate = (x: number): number | null => {
    if (funcType === 'cubic') {
      // y = a*x^3 + b*x + c
      return paramA * Math.pow(x, 3) + paramB * x + paramC;
    } else if (funcType === 'quadratic') {
      // y = a*x^2 + b*x + c
      return paramA * Math.pow(x, 2) + paramB * x + paramC;
    } else {
      // rational: y = (a*x + b) / (x - 1)
      const denom = x - 1;
      if (Math.abs(denom) < 0.05) return null;
      return (paramA * x + paramB) / denom;
    }
  };

  // Generate SVG path points
  const points: { x: number; y: number }[] = [];
  const segments: string[] = [];
  let currentSegment = '';

  for (let sx = -6; sx <= 6; sx += 0.08) {
    const yVal = evaluate(sx);
    if (yVal === null || isNaN(yVal) || Math.abs(yVal) > 6.5) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
      continue;
    }

    const px = toSvgX(sx);
    const py = toSvgY(yVal);
    points.push({ x: px, y: py });

    if (!currentSegment) {
      currentSegment = `M ${px.toFixed(1)} ${py.toFixed(1)}`;
    } else {
      currentSegment += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
  }
  if (currentSegment) {
    segments.push(currentSegment);
  }

  // Critical points for cubic y = x^3 - 3x + 1: x = -1 -> y = 3, x = 1 -> y = -1
  const extremaPoints = funcType === 'cubic' && paramA === 1 && paramB === -3 ? [
    { x: -1, y: evaluate(-1) ?? 3, label: 'Cực đại (-1, 3)' },
    { x: 1, y: evaluate(1) ?? -1, label: 'Cực tiểu (1, -1)' },
  ] : [];

  return (
    <div className={`bg-slate-900 text-white rounded-xl p-4 border border-slate-700/60 shadow-lg ${className}`}>
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-teal-400 font-semibold">
            Đồ thị khảo sát hàm số
          </span>
          <span className="text-xs text-amber-300 font-mono">
            {funcType === 'cubic' && `y = ${paramA === 1 ? '' : paramA}x³ ${paramB < 0 ? '-' : '+'} ${Math.abs(paramB)}x ${paramC < 0 ? '-' : '+'} ${Math.abs(paramC)}`}
            {funcType === 'quadratic' && `y = ${paramA}x² ${paramB < 0 ? '-' : '+'} ${Math.abs(paramB)}x + ${paramC}`}
            {funcType === 'rational' && `y = (${paramA}x ${paramB < 0 ? '-' : '+'} ${Math.abs(paramB)}) / (x - 1)`}
          </span>
        </div>

        {/* Function selector */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => { setFuncType('cubic'); setParamA(1); setParamB(-3); setParamC(1); }}
            className={`px-2.5 py-1 rounded transition-colors ${funcType === 'cubic' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Bậc 3
          </button>
          <button
            onClick={() => { setFuncType('quadratic'); setParamA(1); setParamB(-2); setParamC(-1); }}
            className={`px-2.5 py-1 rounded transition-colors ${funcType === 'quadratic' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Bậc 2
          </button>
          <button
            onClick={() => { setFuncType('rational'); setParamA(2); setParamB(1); setParamC(1); }}
            className={`px-2.5 py-1 rounded transition-colors ${funcType === 'rational' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Phân thức
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex justify-center bg-slate-950/70 rounded-lg p-2 overflow-hidden border border-slate-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[420px] h-auto select-none">
          <defs>
            <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
              <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Coordinate axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />

          {/* Arrows */}
          <polygon points={`${width - 2},${originY} ${width - 8},${originY - 3} ${width - 8},${originY + 3}`} fill="#94a3b8" />
          <polygon points={`${originX},2 ${originX - 3},8 ${originX + 3},8`} fill="#94a3b8" />

          {/* Axis Labels */}
          <text x={width - 14} y={originY + 14} fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">x</text>
          <text x={originX + 8} y={14} fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">y</text>
          <text x={originX - 12} y={originY + 14} fill="#64748b" fontSize="10" fontFamily="sans-serif">O</text>

          {/* Grid ticks */}
          {[-4, -3, -2, -1, 1, 2, 3, 4].map((t) => (
            <React.Fragment key={t}>
              <line x1={toSvgX(t)} y1={originY - 3} x2={toSvgX(t)} y2={originY + 3} stroke="#64748b" strokeWidth="1" />
              <text x={toSvgX(t)} y={originY + 12} textAnchor="middle" fill="#64748b" fontSize="9">{t}</text>
            </React.Fragment>
          ))}

          {/* Function Curves */}
          {segments.map((dStr, idx) => (
            <path
              key={idx}
              d={dStr}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}

          {/* Extrema points */}
          {extremaPoints.map((pt, idx) => {
            const px = toSvgX(pt.x);
            const py = toSvgY(pt.y);
            return (
              <g key={idx}>
                <line x1={px} y1={originY} x2={px} y2={py} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={originX} y1={py} x2={px} y2={py} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx={px} cy={py} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                <text x={px + 6} y={py - 6} fill="#fecdd3" fontSize="10" fontWeight="bold">
                  {pt.x === -1 ? 'Cực đại' : 'Cực tiểu'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Parameter Sliders */}
      <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Hệ số a</span>
            <span className="font-mono text-amber-400">{paramA}</span>
          </div>
          <input
            type="range"
            min="-3"
            max="3"
            step="1"
            value={paramA}
            onChange={(e) => {
              const val = Number(e.target.value);
              setParamA(val === 0 ? 1 : val);
            }}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Hệ số b</span>
            <span className="font-mono text-amber-400">{paramB}</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="1"
            value={paramB}
            onChange={(e) => setParamB(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Hệ số c (hoặc d)</span>
            <span className="font-mono text-amber-400">{paramC}</span>
          </div>
          <input
            type="range"
            min="-4"
            max="4"
            step="1"
            value={paramC}
            onChange={(e) => setParamC(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
