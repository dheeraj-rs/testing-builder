import React from 'react';

const IsolatedContainer = ({ children }: { children: React.ReactNode }) => {
  return <section className="children__wrapper">{children}</section>;
};

export default IsolatedContainer;
