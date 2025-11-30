//src/components/BeforeAfter.tsx
"use client";
import Image from "next/image";

interface Props {
  before: string;
  after: string;
  titleBefore: string;
  titleAfter: string;
}

export default function BeforeAfter({ before, after, titleBefore, titleAfter }: Props) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full my-12">
      
      {/* BEFORE */}
      <div className="relative w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg transition hover:scale-[1.02]">
        <Image
          src={before}
          alt={titleBefore}
          width={800}
          height={600}
          className="object-cover w-full h-full"
        />
      <div className="absolute bottom-0 w-full bg-[#30080A] text-white text-center py-2 text-lg font-semibold tracking-wide">
          {titleBefore}
        </div>
      </div>

      {/* AFTER */}
      <div className="relative w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg transition hover:scale-[1.02]">
        <Image
          src={after}
          alt={titleAfter}
          width={800}
          height={600}
          className="object-cover w-full h-full"
        />
       <div className="absolute bottom-0 w-full bg-[#30080A] text-white text-center py-2 text-lg font-semibold tracking-wide">
          {titleAfter}
        </div>
      </div>
    </div>
  );
}
