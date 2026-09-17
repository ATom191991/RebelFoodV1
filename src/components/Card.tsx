import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-xl2 border border-surface-border bg-white shadow-card ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
