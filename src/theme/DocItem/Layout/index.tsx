import React from 'react';
import OriginalDocItemLayout from '@theme-original/DocItem/Layout';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import ProtectedContent from '@site/plugins/docusaurus-auth/theme/ProtectedContent';

export default function DocItemLayoutWrapper(props) {
  const { frontMatter } = useDoc();

  if (frontMatter.private) {
    return (
      <ProtectedContent>
        <OriginalDocItemLayout {...props} />
      </ProtectedContent>
    );
  }

  return <OriginalDocItemLayout {...props} />;
}
