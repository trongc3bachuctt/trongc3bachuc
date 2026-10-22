import React from 'react';

interface VariationTableProps {
  title?: string;
  funcText?: string;
  data?: {
    x: string[];
    yPrime: string[];
    y: { val: string; arrow?: 'up' | 'down' | 'flat' }[];
  };
  className?: string;
}

export const VariationTable: React.FC<VariationTableProps> = ({
  title = 'Bảng biến thiên',
  funcText = 'y = x³ - 3x : y\' = 3x² - 3',
  data,
  className = '',
}) => {
  // Default data for y = x^3 - 3x
  const tableData = data || {
    x: ['-∞', '-1', '1', '+∞'],
    yPrime: ['+', '0', '-', '0', '+'],
    y: [
      { val: '-∞' },
      { val: '2', arrow: 'up' },
      { val: '-2', arrow: 'down' },
      { val: '+∞', arrow: 'up' },
    ],
  };

  return (
    <div className={`overflow-x-auto my-3 ${className}`}>
      {funcText && (
        <div className="text-xs font-mono text-slate-700 mb-2 font-semibold">
          Ví dụ: <span className="text-teal-800">{funcText}</span>
        </div>
      )}

      <div className="inline-block min-w-[360px] border-2 border-slate-700 bg-white rounded-lg shadow-sm text-sm select-none">
        {/* Row 1: x */}
        <div className="flex border-b border-slate-700">
          <div className="w-14 px-3 py-2 font-serif italic font-bold border-r border-slate-700 flex items-center justify-center bg-slate-50">
            x
          </div>
          <div className="flex-1 flex justify-between px-6 py-2 font-mono font-medium text-slate-800">
            {tableData.x.map((xVal, idx) => (
              <span key={idx} className="min-w-6 text-center">{xVal}</span>
            ))}
          </div>
        </div>

        {/* Row 2: y' */}
        <div className="flex border-b border-slate-700">
          <div className="w-14 px-3 py-2 font-serif italic font-bold border-r border-slate-700 flex items-center justify-center bg-slate-50">
            y'
          </div>
          <div className="flex-1 flex justify-around px-2 py-2 font-mono font-semibold text-slate-700">
            {tableData.yPrime.map((ypVal, idx) => (
              <span
                key={idx}
                className={`min-w-6 text-center ${
                  ypVal === '+' ? 'text-teal-700' : ypVal === '-' ? 'text-rose-600' : 'text-slate-900 font-bold'
                }`}
              >
                {ypVal}
              </span>
            ))}
          </div>
        </div>

        {/* Row 3: y (Arrows & Extrema) */}
        <div className="flex">
          <div className="w-14 px-3 py-6 font-serif italic font-bold border-r border-slate-700 flex items-center justify-center bg-slate-50">
            y
          </div>
          <div className="flex-1 p-2 relative h-24 flex items-center">
            {/* SVG Arrows representation */}
            <svg className="w-full h-full" viewBox="0 0 300 70">
              {/* Point 1: -inf bottom left */}
              <text x="15" y="60" fontSize="12" fill="#475569" fontFamily="monospace">-∞</text>
              
              {/* Arrow 1: up to 2 (top) */}
              <line x1="35" y1="55" x2="105" y2="20" stroke="#0f766e" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <text x="108" y="18" fontSize="13" fontWeight="bold" fill="#0f766e" fontFamily="monospace">2</text>
              
              {/* Arrow 2: down to -2 (bottom) */}
              <line x1="120" y1="22" x2="190" y2="55" stroke="#0f766e" strokeWidth="2" />
              <text x="194" y="62" fontSize="13" fontWeight="bold" fill="#e11d48" fontFamily="monospace">-2</text>
              
              {/* Arrow 3: up to +inf (top right) */}
              <line x1="210" y1="55" x2="270" y2="20" stroke="#0f766e" strokeWidth="2" />
              <polygon points="274,18 266,17 269,25" fill="#0f766e" />
              <text x="276" y="24" fontSize="12" fill="#475569" fontFamily="monospace">+∞</text>

              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#0f766e" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
