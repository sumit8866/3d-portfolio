"use client";

import { useEffect, useState } from "react";

const zone = "Asia/Kolkata";

function now() {
  const d = new Date();
  const time = d.toLocaleTimeString("en-GB", { timeZone: zone, hour12: false });
  const hour = Number(d.toLocaleString("en-GB", { timeZone: zone, hour: "2-digit", hour12: false }));
  const greeting = hour < 12 ? "good morning" : hour < 17 ? "good afternoon" : "good evening";
  return { time, greeting };
}

// Live Surat time; renders a placeholder on the server so hydration matches.
export function useIstClock() {
  const [state, setState] = useState<{ time: string; greeting: string } | null>(null);
  useEffect(() => {
    setState(now());
    const id = setInterval(() => setState(now()), 1000);
    return () => clearInterval(id);
  }, []);
  return state;
}

export function Greeting() {
  const clock = useIstClock();
  return <>{clock?.greeting ?? "hello"}</>;
}

export function Clock() {
  const clock = useIstClock();
  return <span className="tabular-nums">{clock?.time ?? "--:--:--"} IST</span>;
}
