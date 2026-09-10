import React from 'react';
import ContractEditorPage from './EditorClient';

export function generateStaticParams() {
  return [
    { templateId: 'mutual-nda' },
    { templateId: 'cloud-service-agreement' },
    { templateId: 'software-license-agreement' },
    { templateId: 'consulting-agreement' },
    { templateId: 'terms-of-service' },
    { templateId: 'privacy-policy' },
  ];
}

export default function Page() {
  return <ContractEditorPage />;
}
