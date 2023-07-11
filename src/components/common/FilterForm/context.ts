import { Dispatch, createContext, useContext } from "react";
import { State, Update } from "../../Problems/reducer";

export const FilterContext = createContext<
  (State & { dispatch: Dispatch<Update> }) | undefined
>(undefined);

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("Must be rendered in a FilterContext.Provider!");
  }
  return ctx;
};
