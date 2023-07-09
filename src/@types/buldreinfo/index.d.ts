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

type Grade = {
  id: number;
  grade: string;
};

type Type = {
  id: number;
  type: string;
  subType: string;
};

type Region = {
  id: number;
  name: string;
  enabled: boolean;
  readOnly: boolean;
};

type Profile = {
  id: number;
  picture: string;
  firstname: string;
  lastname: string;
  userRegions: Region[];
};

type Tick = {
  idProblem: number;
  date: string;
  dateHr: string;
  areaName: string;
  areaLockedAdmin: boolean;
  areaLockedSuperadmin: boolean;
  sectorName: string;
  sectorLockedAdmin: boolean;
  sectorLockedSuperadmin: boolean;
  name: string;
  grade: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  stars: number;
  idTick: number;
  fa: boolean;
  idTickRepeat: number;
  subType: string;
  numPitches: number;
  comment: string;
  lat: number;
  lng: number;
  gradeNumber: number;
  num: number;
  repeats?: TickRepeat[];
  picture?: string;
  suggestedGrade: string;
  idUser: number;
};

type TickRepeat = {
  date?: string;
  comment: string;
};

type ProfileStatistics = {
  numImageTags: number;
  numImagesCreated: number;
  numVideoTags: number;
  numVideosCreated: number;
  orderByGrade: boolean;
  ticks: Tick[];
};

type Trash = {
  idMedia: number;
  name: string;
  when: string;
  by: string;
} & (
  | { idArea: number; idSector: 0; idProblem: 0 }
  | { idArea: 0; idSector: number; idProblem: 0 }
  | { idArea: 0; idSector: 0; idProblem: number }
);
