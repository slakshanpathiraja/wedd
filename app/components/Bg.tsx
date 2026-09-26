import React from "react";
import Image from "next/image";

interface BgProps {
  children: React.ReactNode;
  className?: string;
}

export default function Bg({ children, className = "" }: BgProps) {
  return (
    <div
      className={`relative min-h-screen w-full flex flex-col flex-1 bg-gradient-to-b from-[#FAF8F5] via-[#FAF6F0] to-[#F3EDE2] text-stone-800 overflow-hidden print:bg-[#FAF7F2] print:bg-none ${className}`}
    >
      {/* Subtle Full-Body Background Pattern (bg.png) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.03] overflow-hidden print:hidden"
      >
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Decorative Floral Arch Graphic (Header Full Width) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none select-none leading-none overflow-hidden print:hidden"
      >
        <Image
          src="/bg4.png"
          alt=""
          width={1003}
          height={366}
          priority
          className="w-full h-auto object-cover object-top"
        />
      </div>

      {/* Centered Slowly Rotating Mandala (bg2.png) - Masked along 10-to-4 clock line */}
      <div
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(210deg, black 46%, transparent 54%)",
          WebkitMaskImage: "linear-gradient(210deg, black 46%, transparent 54%)",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none print:hidden"
      >
        <div className="w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] md:w-[520px] md:h-[520px] lg:w-[580px] lg:h-[580px] opacity-[0.05] animate-mandala-spin flex items-center justify-center origin-center">
          <Image
            src="/bg2.png"
            alt=""
            width={1200}
            height={1200}
            priority
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Decorative Floral Graphic (Footer Full Width) */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none select-none leading-none overflow-hidden print:hidden"
      >
        <Image
          src="/bg1.png"
          alt=""
          width={1322}
          height={753}
          priority
          className="w-full h-auto object-cover object-bottom"
        />
      </div>

      {/* Content Layer (renders above the background image) */}
      <div className="relative z-10 flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}

// HOC pattern support
export function withBg<P extends object>(Component: React.ComponentType<P>) {
  return function WithBgComponent(props: P) {
    return (
      <Bg>
        <Component {...props} />
      </Bg>
    );
  };
}
