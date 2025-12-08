declare module 'leaflet.fullscreen' {
  import { Control } from 'leaflet';

  export interface FullScreenOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    title?: string;
    titleCancel?: string;
    content?: string;
    forceSeparateButton?: boolean;
    forcePseudoFullscreen?: boolean;
    fullscreenElement?: HTMLElement | false;
  }

  export class FullScreen extends Control {
    constructor(options?: FullScreenOptions);
    toggleFullScreen(): void;
  }

  export default FullScreen;
}

declare module 'leaflet.fullscreen/dist/Control.FullScreen.css';
