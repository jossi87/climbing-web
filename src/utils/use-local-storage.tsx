import { useCallback, useState } from "react";

function readLocalStorage<T = any>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.log(error);
    return initialValue;
  }
}

export function itemLocalStorage<T = any>(
  key: string,
  initialValue: T,
): { get: () => T; set: (v: T) => void } {
  let value: T = readLocalStorage(key, initialValue);
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

export function useLocalStorage<T = any>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState(() => {
    return readLocalStorage(key, initialValue);
  });

  const setValue = useCallback(
    (value: Parameters<typeof setStoredValue>[0]) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue],
  );

  const writeValue = useCallback(
    (value: Parameters<typeof setStoredValue>[0]) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue, writeValue] as const;
}
