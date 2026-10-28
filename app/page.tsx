import { Fragment } from "react";
import Nav from "@/components/Nav";
import HeroCanvas from "@/components/HeroCanvas";
import { Clock, Greeting } from "@/components/Clock";
import { MonoButton, SectionHead, Tag } from "@/components/ui";
import { experience, facts, marquee, profile, projects, stats, toolkit } from "@/lib/resume";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <About />
        <Marquee />
        <Work />
        <ExperienceAndToolkit />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="grid-paper border-b border-line pt-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-end gap-12 px-4 py-14 sm:px-6 lg:min-h-[calc(100svh-12rem)] lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline font-mono text-xs tracking-wider text-mute">
            <span className="whitespace-nowrap">
              <Greeting />, i&apos;m
            </span>
            <span className="px-1.5 text-line">/</span>
            <span className="whitespace-nowrap">surat, in</span>
            <span className="px-1.5 text-line">/</span>
            <span className="whitespace-nowrap text-accent">
              <Clock />
            </span>
          </p>
          <h1 className="mt-5 text-[clamp(3.75rem,12vw,7.75rem)] leading-[0.86] font-extrabold tracking-[-0.055em]">
            {profile.short}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-7 max-w-md text-xl leading-snug text-mute">
            Frontend developer. I build fast, responsive websites with React and Next.js.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <MonoButton href="#work" solid>
              see work ↓
            </MonoButton>
            <MonoButton href={`mailto:${profile.email}`}>{profile.email} →</MonoButton>
          </div>
        </div>

        {/* The canvas is absolutely positioned so its pixel size can never widen the layout on phones. */}
        <div className="relative aspect-[5/4] w-full min-w-0 overflow-hidden">
          <HeroCanvas />
        </div>
      </div>

      <dl className="mx-auto grid max-w-6xl grid-cols-2 border-t border-line">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse border-line px-4 py-6 not-last:border-r sm:px-6">
            <dt className="mt-1 font-mono text-[11px] tracking-wider text-mute">{s.label}</dt>
            <dd className="text-4xl font-bold tracking-tight">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:py-32">
        <div>
          <SectionHead n="01" label="about" />
          <p className="mt-10 text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.25] font-medium tracking-tight">
            I joined <span className="text-accent">Happy Pet Tech</span> as a frontend intern in July 2025 and went
            full-time three months later. Now I build websites people use every day, in React,
            Next.js and Tailwind CSS.
          </p>
          <p className="mt-6 max-w-lg text-mute">
            In my own time I build 3D things for the browser — like the little city up there.
          </p>
        </div>
        <dl className="self-end border border-line font-mono text-xs">
          {facts.map((f) => (
            <div key={f.key} className="flex justify-between gap-4 border-b border-line px-4 py-3.5 last:border-b-0">
              <dt className="text-mute">{f.key}</dt>
              <dd className={`text-right ${f.live ? "text-accent" : ""}`}>
                {f.live && <span className="mr-2 inline-block size-1.5 rounded-full bg-accent align-middle" />}
                {f.value}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 px-4 py-3.5">
            <dt className="text-mute">local time</dt>
            <dd>
              <Clock />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Marquee() {
  const big = [...marquee.big, ...marquee.big];
  const small = [...marquee.small, ...marquee.small, ...marquee.small];
  return (
    <div aria-label="Skills" className="overflow-hidden border-y border-line">
      <div className="marquee flex w-max">
        {big.map((s, i) => (
          <span key={i} aria-hidden={i >= marquee.big.length} className="border-r border-line px-8 py-5 text-2xl font-medium">
            {s}
          </span>
        ))}
      </div>
      <div className="marquee-reverse flex w-max border-t border-line">
        {small.map((s, i) => (
          <span
            key={i}
            aria-hidden={i >= marquee.small.length}
            className="border-r border-line px-6 py-2.5 font-mono text-[11px] tracking-[0.14em] text-mute uppercase"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function Work() {
  return (
    <section id="work" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <SectionHead n="02" label="selected work" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const inner = (
              <>
                <div className="flex items-center justify-between font-mono text-xs tracking-wider">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-mute">{p.period}</span>
                </div>
                <h3 className="mt-8 text-3xl font-bold tracking-tight">{p.name}</h3>
                <p className="mt-4 max-w-md flex-1 leading-relaxed text-mute">{p.blurb}</p>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                  {p.url ? (
                    <span className="text-xl text-accent transition-transform group-hover:translate-x-1">→</span>
                  ) : (
                    <span className="font-mono text-[11px] text-mute">private</span>
                  )}
                </div>
              </>
            );
            const cls = "ticks group flex flex-col border border-line bg-paper-2/60 p-6 transition-colors sm:p-7";
            return p.url ? (
              <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className={`${cls} hover:bg-paper-2`}>
                {inner}
              </a>
            ) : (
              <div key={p.name} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ExperienceAndToolkit() {
  return (
    <section id="experience" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
        <div>
          <SectionHead n="03" label="experience" />
          <ul className="mt-8">
            {experience.map((e) => (
              <li key={e.role} className="grid grid-cols-1 items-baseline gap-y-1 border-b border-line py-5 sm:grid-cols-[8.5rem_1fr_auto] sm:gap-x-4">
                <span className="font-mono text-xs whitespace-nowrap text-accent">{e.period}</span>
                <span className="text-lg font-medium">{e.role}</span>
                <span className="font-mono text-[11px] text-mute">{e.place}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead n="04" label="toolkit" />
          <ul className="mt-8">
            {toolkit.map((t) => (
              <li key={t.key} className="flex items-baseline justify-between gap-6 border-b border-line py-5">
                <span className="font-mono text-xs whitespace-nowrap text-mute">{t.key}</span>
                <span className="text-right text-lg font-medium">
                  {t.value.split(" · ").map((item, i) => (
                    <Fragment key={item}>
                      {i > 0 && " · "}
                      <span className="whitespace-nowrap">{item}</span>
                    </Fragment>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const cells = [
    { label: "email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "linkedin", value: "pavasiya-sumit", href: profile.linkedin, external: true },
    { label: "phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { label: "resume", value: "download pdf", href: profile.resume, download: true },
  ];
  return (
    <section id="contact" className="grid-paper scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <SectionHead n="05" label="contact" />
        <h2 className="mt-12 text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.05em]">
          Say hello<span className="text-accent">.</span>
        </h2>
        <p className="mt-6 max-w-md text-lg text-mute">Open to Frontend Developer roles. Email is the quickest way to reach me.</p>
        <ul className="mt-14 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
          {cells.map((c) => (
            <li key={c.label} className="border-r border-b border-line bg-paper">
              <a
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noreferrer" : undefined}
                download={c.download || undefined}
                className="group flex h-full flex-col gap-2 px-5 py-5 transition-colors hover:bg-paper-2"
              >
                <span className="font-mono text-[11px] tracking-wider text-mute">{c.label}</span>
                <span className="flex items-center justify-between gap-3 font-medium">
                  <span className="truncate">{c.value}</span>
                  <span className="text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 font-mono text-[11px] tracking-wider text-mute sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name.toLowerCase()} · surat, india
        </p>
        <p>
          built with next.js + react three fiber · 3d models by{" "}
          <a href="https://kenney.nl" target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-ink hover:underline">
            kenney
          </a>
        </p>
      </div>
    </footer>
  );
}
