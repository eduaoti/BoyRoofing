//src/components/BeforeAfter.tsx
"use client";
import Image from "next/image";

interface Props {
  before: string;
  after: string;
  titleBefore: string;
  titleAfter: string;
}

function Slot({ src, title, label }: { src: string; title: string; label: string }) {
  if (!src) {
    return (
      <div className="relative w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg bg-white/5 border border-white/10 min-h-[200px] flex items-center justify-center">
        <span className="text-br-pearl text-sm">—</span>
        <div className="absolute bottom-0 w-full bg-[#30080A] text-white text-center py-2 text-lg font-semibold tracking-wide">
          {label}
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg transition hover:scale-[1.02]">
      <Image
        src={src}
        alt={title}
        width={800}
        height={600}
        className="object-cover w-full h-full"
      />
      <div className="absolute bottom-0 w-full bg-[#30080A] text-white text-center py-2 text-lg font-semibold tracking-wide">
        {label}
      </div>
    </div>
  );
}

export default function BeforeAfter({ before, after, titleBefore, titleAfter }: Props) {
  if (!before && !after) return null;
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full my-12">
      <Slot src={before} title={titleBefore} label={titleBefore} />
      <Slot src={after} title={titleAfter} label={titleAfter} />
    </div>
  );
}
