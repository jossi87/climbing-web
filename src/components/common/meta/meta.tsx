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

const DEFAULT_VALUE: Metadata = {
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  title: "",
  grades: [],
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
    return { easyToHard, mapping: indexMapping };
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
    <MetaContext.Provider value={meta || DEFAULT_VALUE}>
      <Helmet
        titleTemplate={`%s | ${meta?.title}`}
        defaultTitle={meta?.title ?? "Loading ..."}
      />
      {children}
    </MetaContext.Provider>
  );
};
