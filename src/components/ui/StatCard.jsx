// Small helper: one "period" of the wave as a filled path, offset horizontally
// so multiple copies tile seamlessly. Two copies (offset 0 and offset W) fill
// a 2*W-wide <svg>; animating that svg by exactly one period (-50% of its own
// width, since it's rendered at 200% of the card) loops it with no seam.
function wavePath(offset, { width = 200, baseline = 100, midline = 55, amplitude = 12 } = {}) {
  const w = width;
  const m = midline;
  const a = amplitude;
  return (
    `M${offset},${m} ` +
    `C${offset + w * 0.25},${m - a} ${offset + w * 0.25},${m + a} ${offset + w * 0.5},${m} ` +
    `C${offset + w * 0.75},${m - a} ${offset + w * 0.75},${m + a} ${offset + w},${m} ` +
    `L${offset + w},${baseline} L${offset},${baseline} Z`
  );
}

function WaveLayer({ className, fill, midline, amplitude }) {
  const d1 = wavePath(0, { midline, amplitude });
  const d2 = wavePath(200, { midline, amplitude });
  return (
    <svg
      className={`wave-layer absolute bottom-0 left-0 h-full w-[200%] ${className}`}
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d1} fill={fill} />
      <path d={d2} fill={fill} />
    </svg>
  );
}

// A dashboard stat tile with a soft, continuously-scrolling wave along the
// bottom (two layers at slightly different speed/depth for a liquid feel).
export default function StatCard({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-linen-200 bg-white p-5">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 overflow-hidden sm:h-16">
        <WaveLayer className="wave-layer--back" fill="#FDEBF0" midline={58} amplitude={10} />
        <WaveLayer className="wave-layer--front" fill="#FCD9E3" midline={68} amplitude={14} />
      </div>
      <div className="relative">
        <p className="text-sm text-espresso-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-espresso-900">{value}</p>
      </div>
    </div>
  );
}
