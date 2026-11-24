import React, { useState } from 'react';

export interface SeriesPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export const AreaTrendChart: React.FC<{
  data: SeriesPoint[];
  primaryLabel: string;
  color?: string;
  height?: number;
}> = ({ data, primaryLabel, color = '#EA580C', height = 190 }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (!data.length) return null;

  const width = 560;
  const padX = 28;
  const padY = 18;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2 - 18;
  const maxVal = Math.max(...data.map((d) => d.value), 1) * 1.15;

  const coords = data.map((d, i) => {
    const x = padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = padY + innerH - (d.value / maxVal) * innerH;
    return { x, y, ...d };
  });

  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padY + innerH} L ${coords[0].x} ${padY + innerH} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="areaFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padY + innerH * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={idx}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#E3EAE5" strokeDasharray="3 3" />
              <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-[#64748B] text-[10px] font-mono-num">
                {val}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#areaFillGrad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, idx) => (
          <g
            key={c.label + idx}
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(null)}
            className="cursor-pointer"
          >
            <circle
              cx={c.x}
              cy={c.y}
              r={hoverIdx === idx ? 5 : 3.2}
              fill="#FFFFFF"
              stroke={color}
              strokeWidth="2.2"
            />
            <text
              x={c.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-[#64748B] text-[10px]"
            >
              {c.label}
            </text>
          </g>
        ))}

        {hoverIdx !== null && coords[hoverIdx] && (
          <g transform={`translate(${Math.min(Math.max(coords[hoverIdx].x - 45, 10), width - 105)}, ${Math.max(coords[hoverIdx].y - 38, 2)})`}>
            <rect width="92" height="28" rx="6" fill="#1E293B" />
            <text x="46" y="18" textAnchor="middle" className="fill-white text-[11px] font-semibold font-mono-num">
              {coords[hoverIdx].label}: {coords[hoverIdx].value}
            </text>
          </g>
        )}
      </svg>
      <div className="mt-1 flex items-center justify-end gap-2 text-xs font-medium text-[#1F2937]">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span>{primaryLabel}</span>
      </div>
    </div>
  );
};

export const BarComparisonChart: React.FC<{
  data: SeriesPoint[];
  primaryLabel: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
}> = ({
  data,
  primaryLabel,
  secondaryLabel,
  primaryColor = '#EA580C',
  secondaryColor = '#0284C7',
  height = 195,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (!data.length) return null;

  const width = 560;
  const padX = 30;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2 - 20;
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.value, d.secondaryValue ?? 0)),
    1
  ) * 1.15;

  const groupW = innerW / data.length;
  const hasSecondary = data.some((d) => typeof d.secondaryValue === 'number');
  const barW = hasSecondary ? Math.min(18, groupW * 0.28) : Math.min(26, groupW * 0.45);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padY + innerH * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#E3EAE5" strokeDasharray="3 3" />
              <text x={padX - 6} y={y + 3} textAnchor="end" className="fill-[#64748B] text-[10px] font-mono-num">
                {val}
              </text>
            </g>
          );
        })}

        {data.map((d, idx) => {
          const cx = padX + idx * groupW + groupW / 2;
          const h1 = (d.value / maxVal) * innerH;
          const y1 = padY + innerH - h1;
          const h2 = ((d.secondaryValue ?? 0) / maxVal) * innerH;
          const y2 = padY + innerH - h2;

          return (
            <g
              key={d.label + idx}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={hasSecondary ? cx - barW - 2 : cx - barW / 2}
                y={y1}
                width={barW}
                height={Math.max(h1, 2)}
                rx="4"
                fill={primaryColor}
                opacity={hoverIdx === null || hoverIdx === idx ? 1 : 0.6}
              />
              {hasSecondary && (
                <rect
                  x={cx + 2}
                  y={y2}
                  width={barW}
                  height={Math.max(h2, 2)}
                  rx="4"
                  fill={secondaryColor}
                  opacity={hoverIdx === null || hoverIdx === idx ? 1 : 0.6}
                />
              )}
              <text x={cx} y={height - 4} textAnchor="middle" className="fill-[#1F2937] font-medium text-[10px]">
                {d.label}
              </text>
              {hoverIdx === idx && (
                <g transform={`translate(${Math.min(Math.max(cx - 52, 6), width - 110)}, ${Math.max(Math.min(y1, y2) - 30, 2)})`}>
                  <rect width="104" height="24" rx="5" fill="#1E293B" />
                  <text x="52" y="16" textAnchor="middle" className="fill-white text-[10px] font-mono-num">
                    {hasSecondary ? `${d.value} / ${d.secondaryValue}` : d.value}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex items-center justify-end gap-4 text-xs font-medium text-[#1F2937]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: primaryColor }} />
          {primaryLabel}
        </span>
        {secondaryLabel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: secondaryColor }} />
            {secondaryLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

export const DonutDistributionChart: React.FC<{
  slices: DonutSlice[];
  centerValue: string | number;
  centerLabel: string;
  size?: 'md' | 'lg';
}> = ({ slices, centerValue, centerLabel, size = 'md' }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const rawTotal = slices.reduce((sum, s) => sum + s.value, 0);
  const total = Math.max(rawTotal, 1);
  const radius = size === 'lg' ? 70 : 52;
  const strokeWidth = size === 'lg' ? 24 : 16;
  const viewBoxSize = size === 'lg' ? 190 : 140;
  const center = viewBoxSize / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className={`relative shrink-0 ${
          size === 'lg' ? 'h-56 w-56 sm:h-60 sm:w-60' : 'h-36 w-36'
        }`}
      >
        <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="h-full w-full -rotate-90 drop-shadow-xs">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E3EAE5"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice, idx) => {
            if (slice.value <= 0) return null;
            const pct = slice.value / total;
            const dash = pct * circumference;
            const offset = -accumulated * circumference;
            accumulated += pct;
            const isHovered = hoverIdx === idx;
            return (
              <circle
                key={slice.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                strokeDasharray={`${Math.max(dash - 1.5, 0)} ${circumference}`}
                strokeDashoffset={offset}
                opacity={hoverIdx === null || isHovered ? 1 : 0.4}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer transition-all duration-200"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-7">
          <span
            className={`font-extrabold text-[#1F2937] tabular-nums leading-none ${
              size === 'lg' ? 'text-2xl sm:text-[30px]' : 'text-lg'
            }`}
          >
            {hoverIdx !== null && slices[hoverIdx] ? slices[hoverIdx].value : centerValue}
          </span>
          <span className="text-[10.5px] font-bold text-[#64748B] line-clamp-2 mt-1 max-w-[92%] leading-tight">
            {hoverIdx !== null && slices[hoverIdx] ? slices[hoverIdx].label : centerLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {slices.map((slice, idx) => {
          const pct = rawTotal > 0 ? Math.round((slice.value / rawTotal) * 100) : 0;
          const isHovered = hoverIdx === idx;
          return (
            <div
              key={slice.label}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs transition-all cursor-pointer ${
                isHovered
                  ? 'bg-[#FFF7ED] border-[#EA580C]/45 shadow-xs'
                  : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-3.5 w-3.5 rounded-md shrink-0 shadow-xs"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="min-w-0">
                  <span className="text-[#1F2937] font-bold text-[13px] truncate block">
                    {slice.label}
                  </span>
                  {slice.sublabel && (
                    <span className="text-[11px] font-semibold text-[#64748B] block mt-0.5">
                      {slice.sublabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 tabular-nums">
                <span className="font-extrabold text-[#1F2937] text-[14px]">{slice.value}</span>
                <span
                  className="rounded-lg px-2 py-0.5 text-[11px] font-bold min-w-[44px] text-center border"
                  style={{
                    backgroundColor: `${slice.color}16`,
                    color: slice.color,
                    borderColor: `${slice.color}38`,
                  }}
                >
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface ColoredBarItem {
  label: string;
  value: number;
  color: string;
  helper?: string;
}

export const HorizontalBarChart: React.FC<{
  items: ColoredBarItem[];
  unit?: string;
}> = ({ items, unit = '' }) => {
  const maxVal = Math.max(...items.map((i) => i.value), 1);
  if (!items.length) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const pct = Math.round((item.value / maxVal) * 100);
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-3.5 w-3.5 rounded-md shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-extrabold text-[13px] text-[#1F2937] truncate">{item.label}</span>
                {item.helper && <span className="text-[#64748B] font-medium truncate">{item.helper}</span>}
              </div>
              <span
                className="tabular-nums font-extrabold text-xs px-2.5 py-0.5 rounded-lg text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: item.color }}
              >
                {item.value}
                {unit ? ` ${unit}` : ''}
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-[#F5F7F5] border border-[#E3EAE5] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.value > 0 ? Math.max(pct, 8) : 0}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export interface DualAxisPoint {
  label: string;
  spend: number;
  cpl: number;
  leads: number;
}

export const DualAxisSpendCplChart: React.FC<{
  data: DualAxisPoint[];
  spendLabel: string;
  cplLabel: string;
  currencyUnit?: string;
  height?: number;
}> = ({ data, spendLabel, cplLabel, currencyUnit = 'MAD', height = 250 }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (!data.length) return null;

  const width = 620;
  const padLeft = 56;
  const padRight = 52;
  const padTop = 22;
  const padBottom = 32;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const maxSpend = Math.max(...data.map((d) => d.spend), 1) * 1.18;
  const maxCpl = Math.max(...data.map((d) => d.cpl), 1) * 1.25;
  const groupW = innerW / data.length;
  const barW = Math.min(34, groupW * 0.42);

  const lineCoords = data.map((d, idx) => {
    const cx = padLeft + idx * groupW + groupW / 2;
    const cy = padTop + innerH - (d.cpl / maxCpl) * innerH;
    return { cx, cy, ...d };
  });

  const linePath = lineCoords
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.cx} ${pt.cy}`)
    .join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padTop + innerH * ratio;
          const spendTick = Math.round(maxSpend * (1 - ratio));
          const cplTick = Math.round(maxCpl * (1 - ratio));
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E3EAE5"
                strokeDasharray="3 3"
              />
              <text
                x={padLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-600 text-[10px] font-semibold font-mono-num"
              >
                {spendTick >= 1000 ? `${(spendTick / 1000).toFixed(1)}k` : spendTick}
              </text>
              <text
                x={width - padRight + 8}
                y={y + 3}
                textAnchor="start"
                className="fill-[#C2410C] text-[10px] font-semibold font-mono-num"
              >
                {cplTick}
              </text>
            </g>
          );
        })}

        {lineCoords.map((pt, idx) => {
          const barH = (pt.spend / maxSpend) * innerH;
          const barY = padTop + innerH - barH;
          const isHovered = hoverIdx === idx;
          return (
            <g
              key={pt.label + idx}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={pt.cx - barW / 2}
                y={barY}
                width={barW}
                height={Math.max(barH, 3)}
                rx="6"
                fill="#0284C7"
                opacity={hoverIdx === null || isHovered ? 0.92 : 0.45}
              />
              <text
                x={pt.cx}
                y={barY - 5}
                textAnchor="middle"
                className="fill-slate-700 text-[10px] font-bold font-mono-num"
              >
                {pt.spend >= 1000 ? `${(pt.spend / 1000).toFixed(1)}k` : pt.spend}
              </text>
              <text
                x={pt.cx}
                y={height - 10}
                textAnchor="middle"
                className="fill-zinc-700 font-semibold text-[10px]"
              >
                {pt.label}
              </text>
            </g>
          );
        })}

        <path
          d={linePath}
          fill="none"
          stroke="#EA580C"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {lineCoords.map((pt, idx) => {
          const isHovered = hoverIdx === idx;
          return (
            <g
              key={`dot_${idx}`}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r={isHovered ? 6 : 4.5}
                fill="#FFFFFF"
                stroke="#EA580C"
                strokeWidth="2.6"
              />
              <text
                x={pt.cx}
                y={Math.max(pt.cy - 10, 12)}
                textAnchor="middle"
                className="fill-[#C2410C] text-[10px] font-bold font-mono-num"
              >
                {pt.cpl}
              </text>
            </g>
          );
        })}

        {hoverIdx !== null && lineCoords[hoverIdx] && (
          <g
            transform={`translate(${Math.min(
              Math.max(lineCoords[hoverIdx].cx - 75, padLeft),
              width - padRight - 155
            )}, 4)`}
          >
            <rect width="154" height="38" rx="7" fill="#1E293B" />
            <text x="77" y="16" textAnchor="middle" className="fill-white text-[10px] font-bold font-mono-num">
              {spendLabel}: {lineCoords[hoverIdx].spend.toLocaleString()} {currencyUnit}
            </text>
            <text x="77" y="30" textAnchor="middle" className="fill-amber-300 text-[10px] font-bold font-mono-num">
              {cplLabel}: {lineCoords[hoverIdx].cpl} {currencyUnit}
            </text>
          </g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-end gap-5 text-xs font-semibold text-[#1F2937]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#0284C7]" />
          {spendLabel} ({currencyUnit})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EA580C] ring-2 ring-orange-200" />
          {cplLabel} ({currencyUnit})
        </span>
      </div>
    </div>
  );
};

export interface FinancialMonthPoint {
  label: string;
  revenue: number;
  dealsCount: number;
}

export const MonthlyFinancialChart: React.FC<{
  data: FinancialMonthPoint[];
  revenueLabel: string;
  dealsLabel: string;
  currencyUnit?: string;
  height?: number;
}> = ({ data, revenueLabel, dealsLabel, currencyUnit = 'MAD', height = 270 }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (!data.length) return null;

  const width = 640;
  const padLeft = 64;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 34;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const maxRev = Math.max(...data.map((d) => d.revenue), 1) * 1.2;
  const groupW = innerW / data.length;
  const barW = Math.min(46, groupW * 0.48);

  const formatAxisMoney = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
    return String(Math.round(val));
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="finBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padTop + innerH * ratio;
          const val = maxRev * (1 - ratio);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E3EAE5"
                strokeDasharray={ratio === 1 ? undefined : '3 3'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-600 text-[11px] font-semibold font-mono-num"
              >
                {formatAxisMoney(val)}
              </text>
            </g>
          );
        })}

        {data.map((pt, idx) => {
          const cx = padLeft + idx * groupW + groupW / 2;
          const barH = pt.revenue > 0 ? Math.max((pt.revenue / maxRev) * innerH, 6) : 2;
          const barY = padTop + innerH - barH;
          const isHovered = hoverIdx === idx;
          return (
            <g
              key={pt.label + idx}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={cx - barW / 2}
                y={barY}
                width={barW}
                height={barH}
                rx="8"
                fill="url(#finBarGrad)"
                opacity={hoverIdx === null || isHovered ? 1 : 0.6}
              />
              <text
                x={cx}
                y={Math.max(barY - 8, 14)}
                textAnchor="middle"
                className="fill-slate-900 text-[11px] font-bold font-mono-num"
              >
                {formatAxisMoney(pt.revenue)} {currencyUnit}
              </text>
              <text
                x={cx}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-700 font-bold text-[11px]"
              >
                {pt.label}
              </text>
              {isHovered && (
                <g
                  transform={`translate(${Math.min(
                    Math.max(cx - 72, padLeft),
                    width - padRight - 146
                  )}, 2)`}
                >
                  <rect width="144" height="36" rx="7" fill="#1E293B" />
                  <text x="72" y="15" textAnchor="middle" className="fill-white text-[10px] font-bold font-mono-num">
                    {pt.revenue.toLocaleString()} {currencyUnit}
                  </text>
                  <text x="72" y="29" textAnchor="middle" className="fill-amber-300 text-[10px] font-semibold">
                    {dealsLabel}: {pt.dealsCount}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-end gap-5 text-xs font-semibold text-[#1F2937]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[#EA580C]" />
          {revenueLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#64748B]">
          • {dealsLabel}:{' '}
          <strong className="text-[#1F2937] tabular-nums">
            {data.reduce((s, d) => s + d.dealsCount, 0)}
          </strong>
        </span>
      </div>
    </div>
  );
};

export const ConversionFunnelChart: React.FC<{
  stages: { label: string; count: number; color: string }[];
}> = ({ stages }) => {
  const topCount = Math.max(stages[0]?.count ?? 1, 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => {
        const pct = Math.round((stage.count / topCount) * 100);
        return (
          <div key={stage.label + idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1F2937]">{stage.label}</span>
              <span className="tabular-nums text-[#1F2937] font-bold">
                {stage.count}{' '}
                <span className="text-[#64748B] font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#F5F7F5] border border-[#E3EAE5] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${stage.count > 0 ? Math.max(pct, 6) : 0}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
