import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="felt-bg min-h-screen">
      {children}
    </div>
  );
}
