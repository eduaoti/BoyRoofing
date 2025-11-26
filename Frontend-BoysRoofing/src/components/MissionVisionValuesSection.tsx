"use client";

import useTranslation from "@/hooks/useTranslation";

export default function MissionVisionValuesSection() {
  const { t } = useTranslation();
  const values = t("missionVisionValues.valuesList") as unknown as string[];

  return (
    <section className="bg-br-smoke py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-br-red-light">
              {t("missionVisionValues.missionTitle")}
            </h3>
            <p className="mt-3 text-sm text-br-stone">
              {t("missionVisionValues.missionText")}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-br-red-light">
              {t("missionVisionValues.visionTitle")}
            </h3>
            <p className="mt-3 text-sm text-br-stone">
              {t("missionVisionValues.visionText")}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-br-red-light">
              {t("missionVisionValues.valuesTitle")}
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-br-stone">
              {Array.isArray(values) &&
                values.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
