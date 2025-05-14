import { useCallback, useState } from "react";

function readLocalStorage<T = unknown>(
  system: typeof window.localStorage,
  key: string,
  initialValue: T,
): T {
  try {
    const item = system.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.log(error);
    return initialValue;
  }
}

export function itemLocalStorage<T = unknown>(
  key: string,
  initialValue: T,
): { get: () => T; set: (v: T) => void } {
  let value: T = readLocalStorage(window.localStorage, key, initialValue);
  return {
    get: () => {
      return value;
    },
    set: (newValue: T) => {
      value = newValue;
      if (newValue === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    },
  };
}

function useStorage<T = unknown>(
  system: typeof window.localStorage,
  key: string,
  initialValue: T,
) {
  const [storedValue, setStoredValue] = useState(() => {
    return readLocalStorage(system, key, initialValue);
  });

  const setValue = useCallback(
    (value: Parameters<typeof setStoredValue>[0]) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(value);
        system.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue, system],
  );

  const writeValue = useCallback(
    (value: Parameters<typeof setStoredValue>[0]) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        system.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue, system],
  );

  return [storedValue, setValue, writeValue] as const;
}

export function useLocalStorage<T = unknown>(key: string, initialValue: T) {
  return useStorage(window.localStorage, key, initialValue);
}

export function useSessionStorage<T = unknown>(key: string, initialValue: T) {
  return useStorage(window.sessionStorage, key, initialValue);
}
