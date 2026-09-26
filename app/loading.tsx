import HlMonogram from "./components/HlMonogram";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glowing gold ring */}
        <div className="w-24 h-24 rounded-full border-2 border-[#B4914F]/20 border-t-[#B4914F] animate-spin" />
        {/* Inner reverse counter-rotating ring */}
        <div className="absolute w-18 h-18 rounded-full border border-[#B4914F]/30 border-b-[#B4914F] animate-spin [animation-direction:reverse] [animation-duration:3s]" />
        {/* Center golden connected monogram */}
        <div className="absolute flex items-center justify-center">
          <HlMonogram size={52} idPrefix="loading-page" showRings={false} />
        </div>
      </div>

      <p
        style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
        className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#8A8064] font-semibold mb-2"
      >
        Hansani &amp; Lakshan
      </p>

      <h3
        style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
        className="text-2xl sm:text-3xl text-[#3A362C] font-semibold tracking-wide"
      >
        Loading Invitation
      </h3>

      <div className="flex items-center gap-2 my-3">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#B4914F]/60" />
        <span className="w-1.5 h-1.5 rotate-45 bg-[#B4914F]/60" />
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#B4914F]/60" />
      </div>

      <p
        style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
        className="text-[#6B6656] text-sm sm:text-base italic max-w-xs"
      >
        We look forward to celebrating our special day with you...
      </p>
    </div>
  );
}

