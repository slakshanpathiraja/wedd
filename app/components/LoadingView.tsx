"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import HlMonogram from "./HlMonogram";

export default function LoadingView() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    router.push(`/?ic=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-14 select-none">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#FAF7F2]/90 backdrop-blur-md rounded-[2rem] p-8 sm:p-12 shadow-[0_20px_50px_-15px_rgba(180,145,79,0.3)] border border-[#B4914F]/40 text-center relative overflow-hidden"
      >
        {/* Top Delicate Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B4914F] to-transparent" />

        {/* Golden Monogram Crest */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-b from-white to-[#FAF6F0] flex items-center justify-center shadow-[0_8px_25px_-6px_rgba(180,145,79,0.35)]"
        >
          <HlMonogram size={88} idPrefix="loading-crest" showRings={true} />
        </motion.div>

        {/* Eyebrow */}
        <p
          style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
          className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#8A8064] font-semibold mb-2"
        >
          Hansani &amp; Lakshan &bull; Wedding
        </p>

        {/* Title */}
        <h1
          style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
          className="text-3xl sm:text-4xl text-[#3A362C] font-semibold tracking-wide mb-3"
        >
          Unlock Your Invitation
        </h1>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-2 my-4">
          <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#B4914F]/70" />
          <span className="w-1.5 h-1.5 rotate-45 bg-[#B4914F]/70" />
          <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#B4914F]/70" />
        </div>

        {/* Smart Poetic Body Text */}
        <p
          style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', Georgia, serif" }}
          className="text-[#6B6656] text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto italic font-normal"
        >
          We are overjoyed to celebrate our special day with you. Please enter your exclusive invitation code to unveil your personalized invitation and RSVP.
        </p>

        {/* Code Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <div className="relative">
            <label htmlFor="welcome-code-input" className="sr-only">
              Invitation Code
            </label>
            <input
              id="welcome-code-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 4545GF"
              required
              autoComplete="off"
              spellCheck="false"
              className="w-full px-5 py-4 rounded-2xl border border-[#B4914F]/40 focus:border-[#B4914F] focus:ring-4 focus:ring-[#B4914F]/15 outline-none bg-white/80 text-[#3A362C] placeholder:text-[#8A8064]/50 font-mono text-center tracking-[0.35em] text-lg sm:text-xl font-bold uppercase transition-all shadow-inner"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || !code.trim()}
            style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
            className="w-full py-4 px-6 rounded-2xl bg-[#3A362C] hover:bg-[#242119] disabled:bg-stone-300 text-white font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_8px_20px_-6px_rgba(58,54,44,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Unveiling Invitation...</span>
              </>
            ) : (
              <>
                <span>Open Invitation</span>
                <svg className="w-4 h-4 text-[#B4914F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </motion.button>
        </form>

        {/* Smart Helpful Footer Note */}
        <div className="mt-8 pt-6 border-t border-[#B4914F]/20 text-xs text-[#8A8064] flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#B4914F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Tip: Opening the personalized link sent with your message unlocks your card instantly.</span>
        </div>
      </motion.div>
    </div>
  );
}

