import type { ReactNode } from 'react';
import type { components } from '../@types/buldreinfo/swagger';
import { Redirecting } from '../shared/components/Redirecting';

const isRedirect = (v: unknown): v is components['schemas']['Redirect'] => {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.redirectUrl !== 'string' || !o.redirectUrl) return false;
  /** Problem (and other entities) also declare `redirectUrl` in OpenAPI — do not treat full payloads as redirect-only. */
  const keys = Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== null);
  const redirectKeys = new Set(['destination', 'redirectUrl', 'idArea', 'idSector']);
  return keys.every((k) => redirectKeys.has(k));
};

export const useRedirect = (data: unknown): ReactNode | null => {
  if (isRedirect(data) && data.redirectUrl && data.redirectUrl !== window.location.href) {
    window.location.replace(data.redirectUrl);
    return <Redirecting />;
  }

  return null;
};
