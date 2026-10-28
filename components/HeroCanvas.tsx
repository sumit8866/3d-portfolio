"use client";

import dynamic from "next/dynamic";

// three.js needs the browser, so the scene is loaded on the client only.
const CityScene = dynamic(() => import("./CityScene"), { ssr: false });

export default function HeroCanvas() {
  return <CityScene />;
}
