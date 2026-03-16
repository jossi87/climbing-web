import React from 'react';
import _RangeSlider from 'react-range-slider-input';

/**
 * BRIDGE COMPONENT: react-range-slider-input
 * * WHY THIS EXISTS:
 * This library uses a CommonJS export format that conflicts with the strict ESM
 * requirements of React 19 + Vite 8. Without this wrapper, React receives a
 * module object instead of a component function, causing a runtime crash:
 * "Element type is invalid: expected a string... but got: object".
 * * By extracting the .default property here, we fix the crash globally and
 * preserve TypeScript types for 'onInput' [l, h] destructuring.
 */

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number | 'any';
  value?: [number, number];
  onInput?: (value: [number, number]) => void;
  disabled?: boolean;
  className?: string;
  key?: string;
};

const RangeSlider = ((_RangeSlider as any).default || _RangeSlider) as React.FC<RangeSliderProps>;

export default RangeSlider;
