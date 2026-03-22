"use client";

import { ReactNode } from "react";
import Navigation from "./Navigation";
import InstallPrompt from "./InstallPrompt";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="page-container">
      {children}
      <InstallPrompt />
      {showNav && <Navigation />}
    </div>
  );
}