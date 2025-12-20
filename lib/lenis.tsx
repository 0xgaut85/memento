"use client";

import { ReactLenis as Lenis } from "lenis/react";

export function ReactLenis({ children, root }: { children: React.ReactNode; root?: boolean }) {
  return (
    <Lenis root={root} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </Lenis>
  );
}









