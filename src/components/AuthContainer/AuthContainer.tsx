import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { InsufficientPrivileges, Loading, NotLoggedIn } from '../common/widgets/widgets';
import { useMeta } from '../common/meta';

type Props = {
  children: React.ReactNode;
  level: 'logged-in' | 'admin' | 'super-admin';
};

export const AuthContainer = ({ children, level }: Props) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const meta = useMeta();

  if (isLoading || !meta) {
    return <Loading />;
  }

  if (!isAuthenticated || !meta.isAuthenticated) {
    return <NotLoggedIn />;
  }

  if (level === 'admin' && !meta.isAdmin) {
    return <InsufficientPrivileges />;
  }

  if (level === 'super-admin' && !meta.isSuperAdmin) {
    return <InsufficientPrivileges />;
  }

  return <>{children}</>;
};
