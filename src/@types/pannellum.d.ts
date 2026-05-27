interface PannellumConfig {
  type?: 'equirectangular' | 'cubemap' | 'multires';
  panorama?: string;
  autoLoad?: boolean;
  autoRotate?: number;
  autoRotateInactivityDelay?: number;
  compass?: boolean;
  northOffset?: number;
  showZoomCtrl?: boolean;
  keyboardZoom?: boolean;
  mouseZoom?: boolean;
  draggable?: boolean;
  disableKeyboardCtrl?: boolean;
  showFullscreenCtrl?: boolean;
  showControls?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  hotSpots?: Array<{
    pitch?: number;
    yaw?: number;
    type?: string;
    text?: string;
    URL?: string;
    cssClass?: string;
    createTooltipImg?: string;
    clickHandlerFunc?: (e: MouseEvent | TouchEvent) => void;
    clickHandlerArgs?: unknown;
  }>;
  [key: string]: unknown;
}

interface PannellumViewerInstance {
  destroy: () => void;
  getPitch: () => number;
  getYaw: () => number;
  getHfov: () => number;
  setPitch: (pitch: number, animated?: boolean) => void;
  setYaw: (yaw: number, animated?: boolean) => void;
  setHfov: (hfov: number, animated?: boolean) => void;
  getScene: () => string;
  loadScene: (sceneId: string, pitch?: number, yaw?: number, hfov?: number) => void;
  isLoaded: () => boolean;
  getConfig: () => PannellumConfig;
  on: (event: string, handler: () => void) => void;
  toggleFullscreen: () => void;
  stopMovement: () => void;
  resumeMovement: () => void;
}

interface PannellumNamespace {
  viewer: (container: HTMLElement | string, config: PannellumConfig) => PannellumViewerInstance;
}

interface Window {
  pannellum: PannellumNamespace;
}
