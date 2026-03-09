"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSiteImageMap, type SiteImageMap } from "@/lib/siteImages";

const defaultMap: SiteImageMap = {};

const SiteImagesContext = createContext<{
  map: SiteImageMap;
  getImage: (key: string, fallback: string) => string;
}>({
  map: defaultMap,
  getImage: (_, fallback) => fallback,
});

export function SiteImagesProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<SiteImageMap>(defaultMap);

  useEffect(() => {
    getSiteImageMap()
      .then(setMap)
      .catch(() => setMap({}));
  }, []);

  const getImage = (key: string, fallback: string) => map[key] || fallback;

  return (
    <SiteImagesContext.Provider value={{ map, getImage }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImages() {
  return useContext(SiteImagesContext);
}
