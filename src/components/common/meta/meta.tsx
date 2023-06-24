import { createContext, useContext } from "react";
import { useData } from "../../../api";

type Grade = {
  id: number;
  grade: string;
};

type Type = {
  id: number;
  type: string;
  subType: string;
};

type Metadata = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  title: string;
  grades: Grade[];
  defaultZoom: number;
  defaultCenter: { lat: number; lng: number };
  gradeSystem: "CLIMBING" | "BOULDER";
  isBouldering: boolean;
  types: Type[];
};

const DEFAULT_VALUE: Metadata = {
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  title: "",
  grades: [],
  defaultZoom: 9,
  defaultCenter: {
    lat: 60.893256420810616,
    lng: 8.842601762708886,
  },
  gradeSystem: "CLIMBING",
  isBouldering: false,
  types: [],
};

const MetaContext = createContext<Metadata | undefined>(undefined);

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

export const MetaProvider = ({ children }: Props) => {
  const { data: meta } = useData<{ metadata: Metadata }>(`/meta`, {
    transform: (resp) =>
      resp.json().then((json) => ({
        ...json,
        metadata: {
          ...json.metadata,
          isBouldering: json.metadata.gradeSystem === "BOULDER",
        },
      })),
  });

  return (
    <MetaContext.Provider value={meta?.metadata ?? DEFAULT_VALUE}>
      {children}
    </MetaContext.Provider>
  );
};
