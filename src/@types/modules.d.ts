// Third-party module declarations for packages without TypeScript definitions

declare module 'swagger-ui-react';

declare module 'json-url' {
  type JsonUrl = (codec: string) => {
    compress: (input: object) => Promise<string>;
    decompress: (input: string) => Promise<object>;
  };

  const jsonUrl: JsonUrl;

  export default jsonUrl;
}

declare module 'react-range-slider-input' {
  import type { FC } from 'react';

  export type Orientation = 'horizontal' | 'vertical';
  export type Step = number | 'any';

  export type InputEvent = [number, number];
  export type InputEventHandler = (event: InputEvent) => void;

  export type ReactRangeSliderInputProps = {
    /* @default null
     * Identifier string (id attribute value) to be passed to the range slider element.
     * */
    id?: string;
    /* @default [25, 75]
     * An array of two numeric values which will be set as the current positions of the two thumbs on the range slider.
     * */
    value?: InputEvent;
    /* @default [0, 100]
     * An array of two numeric values which defines the minimum and maximum values on the range slider.
     * */
    min?: number;
    max?: number;
    /* @default 1
     * A numeric value which defines the step interval at which the thumbs can be moved.
     * */
    step?: Step;
    /* @default false
     * A boolean which when set to true, will disable the range slider.
     * */
    disabled?: boolean;
    /* @default () => {}
     * A callback function which will be called when the thumb positions change, i.e., the value prop changes, after the user has stopped moving the thumb.
     * */
    onInput?: InputEventHandler;
    /* @default undefined
     * A callback function which will be called when the user has stopped moving a thumb, whether it results in a value change or not.
     * */
    onThumbDragEnd?: InputEventHandler;
    /* @default "horizontal"
     * Describes the orientation of the range slider. Acceptable values are "horizontal" and "vertical".
     * */
    orientation?: Orientation;
    /* @default false
     * A boolean which when set to true, will hide the minimum and maximum labels at the ends of the slider, as well as the value labels for each thumb.
     * */
    rangeSlideDisabled?: boolean;
    /* @default false
     * A boolean which when set to true, will disable the slider thumbs and allow only the range bar to be dragged.
     * */
    defaultValue?: InputEvent;
    /* @default undefined
     * An array of two numeric values which will be set as the default positions of the two thumbs on the range slider.
     * */
    onThumbDragStart?: InputEventHandler;
    /* @default undefined
     * A callback function which will be called when the user starts moving a thumb.
     * */
    className?: string;
    /* @default undefined
     * Class name to be passed to the range slider element.
     * */
    thumbsDisabled?: [boolean, boolean];
    /* @default [false, false]
     * An array of two boolean values which will be used to disable the left and right thumbs respectively.
     * */
    style?: object;
  };

  const RangeSlider: FC<ReactRangeSliderInputProps>;

  export default RangeSlider;
}
