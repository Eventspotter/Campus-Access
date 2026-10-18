import React, { useState } from 'react';

/**
 * Interactive SVG Donut / Circular Graph with Hover Effects and Click Filtering
 */
export function DonutCircleGraph({
  data = [],
  size = 180,
  strokeWidth = 22,
  centerValue,
  centerLabel = 'Total',
  onSelect
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center select-none">
      <div className="relative flex items-center justify-center cursor-pointer" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />

          {/* Slices */}
          {total > 0 &&
            data.map((item, index) => {
              const fraction = item.value / total;
              const strokeDasharray = `${circumference * fraction} ${circumference * (1 - fraction)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += fraction;

              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelect && onSelect(item.label.toLowerCase())}
                  className="transition-all duration-300 ease-out cursor-pointer hover:filter hover:brightness-110"
                  style={{ transformOrigin: 'center' }}
                />
              );
            })}
        </svg>

        {/* Center label with dynamic hover inspection */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-200">
          <span className="text-3xl font-extrabold tracking-tight text-foreground transition-transform">
            {activeItem ? activeItem.value : centerValue !== undefined ? centerValue : total}
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {activeItem ? activeItem.label : centerLabel}
          </span>
          {activeItem && total > 0 && (
            <span className="text-[10px] text-muted-foreground animate-fadeIn">
              {Math.round((activeItem.value / total) * 100)}% of total
            </span>
          )}
        </div>
      </div>

      {/* Legend with Interactive Hover & Click */}
      <div className="flex flex-col gap-2 min-w-[140px]">
        {data.map((item, index) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect && onSelect(item.label.toLowerCase())}
              className={`flex items-center justify-between gap-3 text-xs p-1.5 px-2.5 rounded-lg cursor-pointer transition-all ${
                isHovered ? 'bg-muted shadow-xs font-semibold' : 'hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full shrink-0 shadow-xs transition-transform"
                  style={{
                    backgroundColor: item.color,
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)'
                  }}
                />
                <span className={isHovered ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              </div>
              <span className="font-bold text-foreground">
                {item.value} <span className="font-normal text-muted-foreground text-[10px]">({percent}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Interactive Radial Progress / Gauge Circle
 */
export function RadialProgressCircle({
  value = 0,
  max = 100,
  size = 140,
  strokeWidth = 14,
  label = 'Active',
  color = '#10b981',
  onClick
}) {
  const [hovered, setHovered] = useState(false);
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer transition-transform ${hovered ? 'scale-105' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/40"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={hovered ? strokeWidth + 3 : strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-bold tracking-tight text-foreground transition-all">
            {percent}%
          </span>
          <span className="text-[11px] font-medium text-muted-foreground capitalize">{label}</span>
          {hovered && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fadeIn">
              {value} / {max}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
