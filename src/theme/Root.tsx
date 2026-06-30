import React from 'react';
import { AuthProvider } from '@site/plugins/docusaurus-auth/theme/AuthContext';

export default function Root({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
