import type { ReactNode } from "react";

// "01 ──────── ABOUT" rule that opens every section.
export function SectionHead({ n, label, children }: { n: string; label: string; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 font-mono text-xs tracking-[0.14em] uppercase">
      <span className="text-accent">[{n}]</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="text-mute">{label}</span>
      {children}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="border border-line px-2 py-1 font-mono text-[11px] text-mute">{children}</span>;
}

export function MonoButton({
  href,
  children,
  solid = false,
  download = false,
}: {
  href: string;
  children: ReactNode;
  solid?: boolean;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      download={download || undefined}
      className={`inline-flex items-center gap-2 px-5 py-3.5 font-mono text-xs tracking-wider transition-colors ${
        solid ? "bg-accent text-accent-ink hover:bg-ink hover:text-paper" : "border border-line hover:border-ink"
      }`}
    >
      {children}
    </a>
  );
}
