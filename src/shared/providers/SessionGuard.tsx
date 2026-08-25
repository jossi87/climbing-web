import { useEffect, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Detects a "dead session" and resets it.
 *
 * Auth0 can report the user as authenticated (a user is cached in
 * localStorage) while no access token can be obtained anymore — the classic
 * case is a refresh token revoked by Auth0's rotation reuse detection. Left
 * alone, every API query calls `getAccessTokenSilently()`, fails, `/meta`
 * never loads and `MetaProvider` renders nothing → black screen.
 *
 * On detection this forces a local logout (`openUrl: false` — no redirect), so
 * the app falls back to the normal logged-out UI with a login button. The
 * logout clears the stale Auth0 cache, so signing in again starts a fresh
 * session.
 */
export const SessionGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }
    let cancelled = false;
    getAccessTokenSilently().catch((error: unknown) => {
      if (cancelled) {
        return;
      }
      // Only reset the session on a rejected token (revoked/expired refresh
      // token). Transient network errors must not log the user out.
      const code = (error as { error?: string } | null)?.error;
      if (code === 'invalid_grant' || code === 'invalid_token' || code === 'missing_refresh_token') {
        void logout({ openUrl: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently, logout]);

  return children;
};
