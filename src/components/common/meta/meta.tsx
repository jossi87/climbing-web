import { createContext, useContext, useMemo } from "react";
import { useData } from "../../../api";
import { Helmet } from "react-helmet";
import { components } from "../../../@types/buldreinfo/swagger";

type CompassDirection = {
  id: number;
  direction: string;
};

type Grade = {
  id: number;
  grade: string;
};

type Type = {
  id: number;
  type: string;
  subType: string;
};

type Site = {
  group: string;
  name: string;
  url: string;
  outline: components["schemas"]["Coordinates"][];
  active: boolean;
};

type Metadata = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authenticatedName: string;
  title: string;
  grades: Grade[];
  faYears: number[];
  defaultZoom: number;
  defaultCenter: { lat: number; lng: number };
  isBouldering: boolean;
  isClimbing: boolean;
  isIce: boolean;
  types: Type[];
  sites: Site[];
  compassDirections: CompassDirection[];
};

export const DEFAULT_META: Metadata = {
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  authenticatedName: "",
  title: "",
  grades: [
    { id: 0, grade: "n/a" },
    { id: 21, grade: "3-" },
    { id: 22, grade: "3" },
    { id: 23, grade: "3+" },
    { id: 24, grade: "4- (4a)" },
    { id: 25, grade: "4 (4b)" },
    { id: 26, grade: "4+ (4c)" },
    { id: 27, grade: "5- (5a)" },
    { id: 28, grade: "5 (5b)" },
    { id: 29, grade: "5+ (5c)" },
    { id: 30, grade: "5+/6- (5c)" },
    { id: 31, grade: "6- (6a)" },
    { id: 32, grade: "6-/6 (6a)" },
    { id: 33, grade: "6 (6a+)" },
    { id: 34, grade: "6/6+ (6a+)" },
    { id: 35, grade: "6+ (6b)" },
    { id: 36, grade: "6+/7- (6b)" },
    { id: 37, grade: "7- (6b+)" },
    { id: 38, grade: "7-/7 (6b+)" },
    { id: 39, grade: "7 (6c)" },
    { id: 40, grade: "7/7+ (6c+)" },
    { id: 41, grade: "7+ (7a)" },
    { id: 42, grade: "7+/8- (7a+)" },
    { id: 43, grade: "8- (7b)" },
    { id: 44, grade: "8-/8 (7b)" },
    { id: 45, grade: "8 (7b+)" },
    { id: 46, grade: "8/8+ (7c)" },
    { id: 47, grade: "8+ (7c+)" },
    { id: 48, grade: "8+/9- (7c+/8a)" },
    { id: 49, grade: "9- (8a)" },
    { id: 50, grade: "9-/9 (8a+)" },
    { id: 51, grade: "9 (8b)" },
    { id: 52, grade: "9/9+ (8b+)" },
    { id: 53, grade: "9+ (8c)" },
    { id: 54, grade: "10- (8c+)" },
    { id: 55, grade: "10-/10 (8c+/9a)" },
    { id: 56, grade: "10 (9a)" },
    { id: 57, grade: "9a/9a+" },
    { id: 58, grade: "9a+" },
    { id: 59, grade: "9a+/9b" },
    { id: 60, grade: "9b" },
    { id: 61, grade: "9b/9b+" },
    { id: 62, grade: "9b+" },
    { id: 63, grade: "9b+/9c" },
    { id: 64, grade: "9c" },
  ],
  faYears: [],
  defaultZoom: 9,
  defaultCenter: {
    lat: 60.893256420810616,
    lng: 8.842601762708886,
  },
  isBouldering: false,
  isClimbing: true,
  isIce: false,
  types: [],
  sites: [],
  compassDirections: [],
};

export const MetaContext = createContext<Metadata | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const useMeta = (): Metadata => {
  const metadata = useContext(MetaContext);
  if (!metadata) {
    throw new Error("useMeta() can only be used inside of <MetaProvider />");
  }
  return metadata;
};

export const useGrades = () => {
  const { grades } = useMeta();
  return useMemo(() => {
    const easyToHard = grades.map(({ grade }) => grade);
    const indexMapping = grades.reduce<Record<string, number>>(
      (acc, { grade }, i) => ({ ...acc, [grade]: i }),
      {},
    );
    const idToGrade = grades.reduce<Record<number, string>>(
      (acc, { grade, id }) => ({ ...acc, [id]: grade }),
      {},
    );
    return { easyToHard, mapping: indexMapping, idToGrade };
  }, [grades]);
};

export const useFaYears = () => {
  return useMeta().faYears;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta } = useData<Metadata>(`/meta`, {
    select: (data) => {
      data.faYears.sort((a, b) => a - b);
      return data;
    },
  });

  return (
    <MetaContext.Provider value={meta || DEFAULT_META}>
      <Helmet
        titleTemplate={`%s | ${meta?.title}`}
        defaultTitle={meta?.title ?? "Loading ..."}
      />
      {children}
    </MetaContext.Provider>
  );
};
