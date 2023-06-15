interface Window {
  // Allow us to put arbitrary objects in window
  [key: string]: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    center: any;
  }
}

interface Media {
  width: number;
  height: number;
  id: number;
  svgProblemId: number;
  svgs: any;
  idType: number;
  t: number;
  autoPlayVideo: boolean;
  description: string;
}
