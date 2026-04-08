import { createContext, useContext } from 'react';

export const ProblemListCompactContext = createContext<boolean>(false);

export const useProblemListCompact = () => useContext(ProblemListCompactContext);
