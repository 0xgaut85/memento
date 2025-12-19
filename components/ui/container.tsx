import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => {
  return (
    <section
      ref={ref}
      className={cn("py-16 md:py-24 lg:py-32", className)}
      {...props}
    >
      {children}
    </section>
  );
});

Section.displayName = "Section";
