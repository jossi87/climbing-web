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
  role: string;
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
  writable: boolean;
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

type SearchResult = {
  url?: string;
  externalurl?: string;
  mediaid?: string;
  mediaurl?: string;
  crc32: string;
  title: string;
  description: string;
  lockedadmin: boolean;
  lockedsuperadmin: boolean;
};

type FilterResult = {
  areaLockedAdmin: boolean;
  areaLockedSuperadmin: boolean;
  areaName: string;
  sectorLockedAdmin: boolean;
  sectorLockedSuperadmin: boolean;
  sectorName: string;
  problemId: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  problemName: string;
  latitude: number;
  longitude: number;
  stars: number;
  grade: string;
  ticked: boolean;
  ticks: number;
  randomMediaId: number;
  randomMediaCrc32: number;
};

type ProblemArea_Problem = {
  id: int;
  url: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  nr: int;
  name: string;
  description: string;
  grade: string;
  fa: string;
  numTicks: int;
  stars: double;
  ticked: boolean;
  t: Type;
  numPitches: int;
};

type ProblemArea_Sector = {
  id: int;
  url: string;
  name: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  problems: ProblemArea_Problem[];
};

type ProblemArea = {
  id: number;
  url: string;
  name: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  sectors: ProblemArea_Sector[];
};
