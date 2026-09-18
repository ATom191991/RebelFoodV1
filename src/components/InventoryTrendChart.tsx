import { useState, useRef } from "react";
import { formatInr } from "../lib/format";

interface Series {
  key: string;
  label: string;
  color: string;
  values: number[];
}

export default function InventoryTrendChart({ labels, series }: { labels: string[]; series: Series[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const n = labels.length;
  const maxValue = Math.max(...series.flatMap((s) => s.values)) * 1.15;
  const topPad = 4;
  const bottomPad = 36;

  const xAt = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const yAt = (v: number) => bottomPad - (v / maxValue) * (bottomPad - topPad);

  function pathFor(values: number[]) {
    return values.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`).join(" ");
  }

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
    setHoverIndex(idx);
  }

  return (
    <div>
      {/* Legend */}
      <div className="mb-3 flex items-center gap-5">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-[12px] text-charcoal-600">
            <span className="inline-block h-[3px] w-4 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <div
        ref={wrapRef}
        className="relative h-56 w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Y-axis min/max labels */}
        <div className="pointer-events-none absolute left-0 top-0 text-[10.5px] text-charcoal-500">
          {formatInr(maxValue)}
        </div>
        <div className="pointer-events-none absolute bottom-6 left-0 text-[10.5px] text-charcoal-500">₹0</div>

        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          {/* Gridlines */}
          {[topPad, (topPad + bottomPad) / 2, bottomPad].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="#e4e4e7"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Hover guide */}
          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={topPad}
              y2={bottomPad}
              stroke="#c4c4c9"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {series.map((s) => (
            <path
              key={s.key}
              d={pathFor(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Hover point markers (HTML so circles stay round under the distorted viewBox) */}
        {hoverIndex !== null &&
          series.map((s) => (
            <div
              key={s.key}
              className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{
                left: `${xAt(hoverIndex)}%`,
                top: `${(yAt(s.values[hoverIndex]) / 40) * 100}%`,
                backgroundColor: s.color,
              }}
            />
          ))}

        {/* Tooltip */}
        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-surface-border bg-white px-3 py-2 text-[11.5px] shadow-pop"
            style={{ left: `${xAt(hoverIndex)}%`, top: 0 }}
          >
            <p className="mb-1 font-semibold text-charcoal-900">{labels[hoverIndex]}</p>
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-charcoal-500">{s.label}:</span>
                <span className="font-medium tabular text-charcoal-900">{formatInr(s.values[hoverIndex])}</span>
              </div>
            ))}
          </div>
        )}

        {/* X-axis labels */}
        <div className="absolute -bottom-1 left-0 flex w-full justify-between text-[10.5px] text-charcoal-500">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
