import { profile } from "@/lib/resume";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "about" },
  { href: "#work", label: "work" },
  { href: "#experience", label: "experience" },
  { href: "#contact", label: "contact" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="font-mono text-sm font-medium tracking-wide">
          {profile.name}
          <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent" />
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="font-mono text-xs tracking-wider text-mute transition-colors hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </header>
  );
}
