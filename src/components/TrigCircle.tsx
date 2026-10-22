import React, { useState } from 'react';

const COMMON_ANGLES = [
  { deg: 0, rad: '0', sin: '0', cos: '1', tan: '0', cot: '||' },
  { deg: 30, rad: 'π/6', sin: '1/2', cos: '√3/2', tan: '√3/3', cot: '√3' },
  { deg: 45, rad: 'π/4', sin: '√2/2', cos: '√2/2', tan: '1', cot: '1' },
  { deg: 60, rad: 'π/3', sin: '√3/2', cos: '1/2', tan: '√3', cot: '√3/3' },
  { deg: 90, rad: 'π/2', sin: '1', cos: '0', tan: '||', cot: '0' },
  { deg: 120, rad: '2π/3', sin: '√3/2', cos: '-1/2', tan: '-√3', cot: '-√3/3' },
  { deg: 135, rad: '3π/4', sin: '√2/2', cos: '-√2/2', tan: '-1', cot: '-1' },
  { deg: 150, rad: '5π/6', sin: '1/2', cos: '-√3/2', tan: '-√3/3', cot: '-√3' },
  { deg: 180, rad: 'π', sin: '0', cos: '-1', tan: '0', cot: '||' },
  { deg: 270, rad: '3π/2', sin: '-1', cos: '0', tan: '||', cot: '0' },
];

export const TrigCircle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [angleDeg, setAngleDeg] = useState<number>(60);

  const currentPreset = COMMON_ANGLES.find((a) => a.deg === angleDeg) || {
    deg: angleDeg,
    rad: `${angleDeg}°`,
    sin: Math.sin((angleDeg * Math.PI) / 180).toFixed(2),
    cos: Math.cos((angleDeg * Math.PI) / 180).toFixed(2),
    tan: Math.abs(Math.cos((angleDeg * Math.PI) / 180)) < 0.001 ? '||' : Math.tan((angleDeg * Math.PI) / 180).toFixed(2),
    cot: Math.abs(Math.sin((angleDeg * Math.PI) / 180)) < 0.001 ? '||' : (1 / Math.tan((angleDeg * Math.PI) / 180)).toFixed(2),
  };

  const cx = 140;
  const cy = 140;
  const radius = 95;

  const rad = (angleDeg * Math.PI) / 180;
  const mx = cx + radius * Math.cos(rad);
  const my = cy - radius * Math.sin(rad);

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
          Đường tròn lượng giác trực quan
        </h4>
        <span className="text-xs font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200 font-semibold">
          α = {angleDeg}° ({currentPreset.rad} rad)
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
        {/* SVG Circle */}
        <div className="relative">
          <svg width="280" height="280" className="select-none">
            {/* Grid behind circle */}
            <defs>
              <pattern id="trig-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="280" height="280" fill="url(#trig-grid)" />

            {/* Axes */}
            <line x1="20" y1={cy} x2="260" y2={cy} stroke="#64748b" strokeWidth="1.5" />
            <line x1={cx} y1="20" x2={cx} y2="260" stroke="#64748b" strokeWidth="1.5" />

            {/* Arrows */}
            <polygon points={`260,${cy} 252,${cy - 3} 252,${cy + 3}`} fill="#64748b" />
            <polygon points={`${cx},20 ${cx - 3},28 ${cx + 3},28`} fill="#64748b" />

            {/* Labels */}
            <text x="262" y={cy + 14} fill="#475569" fontSize="11" fontWeight="bold">x</text>
            <text x={cx + 8} y="22" fill="#475569" fontSize="11" fontWeight="bold">y</text>
            <text x={cx - 12} y={cy + 14} fill="#94a3b8" fontSize="10">O</text>
            <text x={cx - 10} y="15" fill="#0f766e" fontSize="11" fontWeight="bold">Đường tròn lượng giác</text>

            {/* Unit Circle */}
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#0f766e" strokeWidth="2.5" />

            {/* Angle Arc */}
            <path
              d={`M ${cx + 25} ${cy} A 25 25 0 ${angleDeg > 180 ? 1 : 0} 0 ${cx + 25 * Math.cos(rad)} ${cy - 25 * Math.sin(rad)}`}
              fill="rgba(15, 118, 110, 0.12)"
              stroke="#0d9488"
              strokeWidth="1.5"
            />

            {/* Projection dashed lines */}
            <line x1={mx} y1={cy} x2={mx} y2={my} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={cx} y1={my} x2={mx} y2={my} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Radius line OM */}
            <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#0f172a" strokeWidth="2" />

            {/* Origin & Points */}
            <circle cx={cx} cy={cy} r="3" fill="#0f172a" />
            
            {/* Point A (1, 0) */}
            <circle cx={cx + radius} cy={cy} r="4.5" fill="#f43f5e" />
            <text x={cx + radius + 6} y={cy + 14} fill="#f43f5e" fontSize="11" fontWeight="bold">A</text>

            {/* Point M */}
            <circle cx={mx} cy={my} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
            <text x={mx + 6} y={my - 6} fill="#0284c7" fontSize="12" fontWeight="bold">M</text>
          </svg>
        </div>

        {/* Values Table & Angle Selector */}
        <div className="flex-1 w-full max-w-sm">
          <div className="text-xs text-slate-500 mb-2 font-medium">Chọn góc α nhanh:</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {COMMON_ANGLES.map((a) => (
              <button
                key={a.deg}
                onClick={() => setAngleDeg(a.deg)}
                className={`px-2.5 py-1 text-xs rounded transition-all ${
                  angleDeg === a.deg
                    ? 'bg-teal-700 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {a.deg}°
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Thước kéo góc:</span>
              <span className="font-mono font-bold text-teal-800">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-lg">
              <span className="text-rose-600 font-sans block text-[11px] font-medium">sin α (trục Oy)</span>
              <span className="text-sm font-bold text-rose-900">{currentPreset.sin}</span>
            </div>
            <div className="p-2.5 bg-sky-50 border border-sky-200/80 rounded-lg">
              <span className="text-sky-600 font-sans block text-[11px] font-medium">cos α (trục Ox)</span>
              <span className="text-sm font-bold text-sky-900">{currentPreset.cos}</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-lg">
              <span className="text-amber-700 font-sans block text-[11px] font-medium">tan α (sin/cos)</span>
              <span className="text-sm font-bold text-amber-900">{currentPreset.tan}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-lg">
              <span className="text-emerald-700 font-sans block text-[11px] font-medium">cot α (cos/sin)</span>
              <span className="text-sm font-bold text-emerald-900">{currentPreset.cot}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
