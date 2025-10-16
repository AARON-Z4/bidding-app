// src/components/Layout.jsx
import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="bg-[url('src/assets/bg.svg')] bg-cover min-h-screen text-white">
      {children}
    </div>
  );
}
