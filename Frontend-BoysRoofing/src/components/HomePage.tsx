"use client";

import Hero from "./Hero";
import ServicesPage from "./ServicesPage";
import AboutPage from "./AboutPage";
import MissionVisionValuesSection from "./MissionVisionValuesSection";
import ContactPage from "./ContactPage";

export default function HomePage() {
  return (
    <div className="bg-br-carbon text-br-white">
      <Hero />
      <ServicesPage />
      <AboutPage />
      <MissionVisionValuesSection />
      <ContactPage />
    </div>
  );
}
