'use client';

import { ReactNode } from 'react';
import { AuthGuardClient } from '@/components/auth/AuthGuard/AuthGuardClient';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  return <AuthGuardClient>{children}</AuthGuardClient>;
};

export default AuthGuard;
