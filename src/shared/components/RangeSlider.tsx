import React from 'react';
import _RangeSlider from 'react-range-slider-input';

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number | 'any';
  value?: [number, number];
  onInput?: (value: [number, number]) => void;
  disabled?: boolean;
  className?: string;
};

const RangeSlider = ((_RangeSlider as unknown as { default: React.FC<RangeSliderProps> }).default ||
  _RangeSlider) as React.FC<RangeSliderProps>;

export default RangeSlider;
