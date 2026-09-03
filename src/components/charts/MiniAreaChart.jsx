import { useRef, useState } from 'react';

// Fixed viewBox; the <svg> scales to its container via CSS width, so the
// coordinate math below always works in these units regardless of the
// rendered size.
const WIDTH = 600;
const HEIGHT = 200;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;

function formatShortDate(dateStr, locale) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

// A compact single-series area/line chart for a daily time series, with a
// hover crosshair + tooltip. No charting library -- the admin bundle has
// none installed, and one series with ~30 points doesn't need one.
export default function MiniAreaChart({ data, color, formatValue = (v) => String(v), locale = 'en', emptyLabel }) {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return <p className="py-10 text-center text-sm text-espresso-400">{emptyLabel}</p>;
  }

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const innerW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: PAD_LEFT + stepX * i,
    y: PAD_TOP + innerH - (d.value / maxValue) * innerH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const floorY = PAD_TOP + innerH;
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${floorY} L${points[0].x.toFixed(1)},${floorY} Z`;
  const gridLines = [0, 0.5, 1].map((f) => PAD_TOP + innerH * f);
  const gradientId = `mac-grad-${color.replace('#', '')}`;

  const tickIndices = points.length > 1
    ? Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]))
    : [0];

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let idx = Math.round((relX - PAD_LEFT) / (stepX || 1));
    idx = Math.max(0, Math.min(points.length - 1, idx));
    setHoverIndex(idx);
  };

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        style={{ height: 180 }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((y) => (
          <line key={y} x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="#ECDAC9" strokeWidth="1" />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {tickIndices.map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={HEIGHT - 8}
            textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
            fontSize="11"
            fill="#8a6a66"
          >
            {formatShortDate(points[i].date, locale)}
          </text>
        ))}

        {hovered && (
          <>
            <line x1={hovered.x} x2={hovered.x} y1={PAD_TOP} y2={floorY} stroke={color} strokeOpacity="0.35" strokeWidth="1" />
            <circle cx={hovered.x} cy={hovered.y} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-linen-200 bg-white px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100 - 4}%` }}
        >
          <p className="font-semibold text-espresso-900">{formatValue(hovered.value)}</p>
          <p className="text-espresso-500">{formatShortDate(hovered.date, locale)}</p>
        </div>
      )}
    </div>
  );
}
