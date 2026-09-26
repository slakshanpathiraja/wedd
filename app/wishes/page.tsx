import React from "react";
import Link from "next/link";
import { getAllWishes } from "@/lib/sheet";

export const dynamic = "force-dynamic";

interface WishesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WishesPage({ searchParams }: WishesPageProps) {
  const resolved = await searchParams;
  const ic =
    typeof resolved.ic === "string"
      ? resolved.ic.trim()
      : Array.isArray(resolved.ic)
      ? resolved.ic[0]?.trim()
      : undefined;

  const backUrl = ic ? `/?ic=${encodeURIComponent(ic)}` : "/";

  // Fetch all wishes from Google Sheet & local store
  const allWishes = await getAllWishes(ic);

  // Strict user rule: empty wish list eke penna epa eka string ekakhari thiyena wish tika ethanata danna
  const validWishes = allWishes.filter(
    (w) => typeof w.wish === "string" && w.wish.trim().length > 0
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center select-none px-4 py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">

        {/* Top Back Navigation Link */}
        <div className="w-full flex items-center justify-between mb-5 sm:mb-7">
          <Link
            href={backUrl}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#B4914F]/40 bg-white/70 hover:bg-[#B4914F] text-[#3A362C] hover:text-white transition-all duration-300 shadow-xs backdrop-blur-xs text-xs font-medium"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Invitation</span>
          </Link>

          <span
            style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8A8064] font-semibold"
          >
            {validWishes.length} {validWishes.length === 1 ? "Wish" : "Wishes"}
          </span>
        </div>

        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <p
            style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#8A8064] font-semibold mb-2"
          >
            Hansani &amp; Lakshan
          </p>

          <h1
            style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#3A362C] leading-tight"
          >
            Wedding Wishes &amp; Blessings
          </h1>

          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[#B4914F]/70" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B4914F]" />
            <div className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[#B4914F]/70" />
          </div>
        </div>

        {/* Wishes Cards List */}
        {validWishes.length > 0 ? (
          <div className="w-full space-y-1">
            {validWishes.map((item, idx) => {
              return (
                <div
                  key={`${item.wish.slice(0, 20)}-${idx}`}
                  className="relative py-3.5 px-4 sm:py-4 sm:px-5 rounded-xl sm:rounded-2xl border border-[#B4914F]/30 bg-white/80 backdrop-blur-sm shadow-[0_2px_12px_-3px_rgba(180,145,79,0.1)] hover:shadow-[0_4px_18px_-3px_rgba(180,145,79,0.18)] transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-full border border-[#B4914F]/40 bg-[#FAF7F2] flex items-center justify-center text-[#B4914F] mt-0.5">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Wish Quote Content */}
                      <p
                        style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
                        className="text-sm sm:text-base md:text-lg text-[#2E2C26] italic leading-snug sm:leading-normal whitespace-pre-wrap font-normal"
                      >
                        &ldquo;{item.wish.trim()}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State (when no wishes exist yet) */
          <div className="w-full text-center py-12 px-6 rounded-3xl border border-[#B4914F]/25 bg-white/60 backdrop-blur-sm max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-[#B4914F]/40 bg-[#FAF7F2] flex items-center justify-center text-[#B4914F]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3
              style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
              className="text-2xl font-semibold text-[#3A362C] mb-2"
            >
              No Wishes Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6656] leading-relaxed">
              Be the first to share your warm love and blessings when submitting your RSVP!
            </p>
          </div>
        )}

        {/* Bottom Back Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#B4914F]/60 bg-[#FAF7F2] hover:bg-[#B4914F] text-[#3A362C] hover:text-white transition-all duration-300 shadow-sm text-xs sm:text-sm font-semibold tracking-wider uppercase"
          >
            <span>&larr; Back to Invitation</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

