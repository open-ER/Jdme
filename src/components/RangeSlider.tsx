import { useRef, useState, useEffect } from "react";

interface RangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
  label: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (v) => v.toString(),
  label,
  onStart,
  onComplete,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [minValue, maxValue] = value;

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);

  const handleMinChange = (newValue: number) => {
    const clampedValue = Math.min(newValue, maxValue - step);
    onChange([clampedValue, maxValue]);
  };

  const handleMaxChange = (newValue: number) => {
    const clampedValue = Math.max(newValue, minValue + step);
    onChange([minValue, clampedValue]);
  };

  return (
    <div className="mb-6" onClick={(e) => e.stopPropagation()}> {/* 슬라이더 컨테이너 클릭 전파 방지 */}
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative pt-6 pb-4">
        {/* Track Background */}
        <div
          ref={trackRef}
          className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded"
        />
        
        {/* Active Track */}
        <div
          className="absolute top-8 h-1 bg-blue-500 rounded"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) => {
            e.stopPropagation();
            handleMinChange(parseFloat(e.target.value));
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStart?.();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onStart?.();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
          style={{ zIndex: minValue > max - (max - min) / 2 ? 5 : 3 }}
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) => {
            e.stopPropagation();
            handleMaxChange(parseFloat(e.target.value));
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStart?.();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            onStart?.();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 w-full h-8 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Value Labels */}
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>{formatLabel(minValue)}</span>
        <span>{formatLabel(maxValue)}</span>
      </div>
    </div>
  );
}