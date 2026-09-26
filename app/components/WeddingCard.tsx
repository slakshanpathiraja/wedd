"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toPng } from "html-to-image";
import { GuestRsvp } from "@/lib/types";
import RsvpForm from "./RsvpForm";
import InvitationDownloadCard from "./InvitationDownloadCard";

interface WeddingCardProps {
  guest?: GuestRsvp;
  initialCode?: string;
  codeError?: string;
}

/**
 * Formats the invitee name from the guest record:
 * - "mr. kamal perera" -> "Mr. Kamal Perera"
 * - "mrs and mr perera" -> "Mr. & Mrs. Perera"
 * - "perera family" / "Family: Perera" -> "The Perera Family"
 * - Fallback -> "You"
 */
export function formatGuestInvitationName(guest?: GuestRsvp | null): string {
  if (!guest) return "You";

  const rawName = (guest.name || "").trim();
  const rawInitial = (guest.initial || "").trim();

  if (!rawName && !rawInitial) return "You";

  let combined = "";

  if (rawInitial && rawName) {
    const normName = rawName.toLowerCase();
    const normInit = rawInitial.toLowerCase().replace(/\./g, "").trim();
    if (normName.startsWith(normInit) || normName.startsWith(rawInitial.toLowerCase())) {
      combined = rawName;
    } else if (normInit === "family") {
      combined = normName.includes("family") ? rawName : `The ${rawName} Family`;
    } else {
      const cleanInit = /^(mr|mrs|ms|dr)$/i.test(normInit) ? `${rawInitial.replace(/\./g, "")}.` : rawInitial;
      combined = `${cleanInit} ${rawName}`;
    }
  } else {
    combined = rawName || rawInitial;
  }

  let formatted = combined.trim();

  // Normalize family formats
  if (/^family[:\s]+/i.test(formatted)) {
    const familyName = formatted.replace(/^family[:\s]+/i, "").trim();
    formatted = `The ${familyName} Family`;
  } else if (/^[a-zA-Z\s]+family$/i.test(formatted) && !/^the\s+/i.test(formatted)) {
    formatted = `The ${formatted}`;
  }

  // Normalize common honorifics
  formatted = formatted
    .replace(/^mrs?\s+and\s+mrs?\s+/i, "Mr. & Mrs. ")
    .replace(/^mr\s*&\s*mrs\s+/i, "Mr. & Mrs. ")
    .replace(/^mr\.?\s*&\s*mrs\.?\s+/i, "Mr. & Mrs. ")
    .replace(/^mr\.\s*/i, "Mr. ")
    .replace(/^mr\s+/i, "Mr. ")
    .replace(/^mrs\.\s*/i, "Mrs. ")
    .replace(/^mrs\s+/i, "Mrs. ")
    .replace(/^ms\.\s*/i, "Ms. ")
    .replace(/^ms\s+/i, "Ms. ")
    .replace(/^dr\.\s*/i, "Dr. ")
    .replace(/^dr\s+/i, "Dr. ");

  // Title case words
  const result = formatted
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      if (lower === "&" || lower === "and") return "&";
      if (/^mr\.?$/i.test(w)) return "Mr.";
      if (/^mrs\.?$/i.test(w)) return "Mrs.";
      if (/^ms\.?$/i.test(w)) return "Ms.";
      if (/^dr\.?$/i.test(w)) return "Dr.";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");

  return result || "You";
}

export default function WeddingCard({
  guest: initialGuest,
  initialCode = "",
  codeError = "",
}: WeddingCardProps) {
  const [clientGuest, setClientGuest] = useState<GuestRsvp | null>(null);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [inputError, setInputError] = useState(codeError);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  const activeGuest = clientGuest ?? initialGuest;
  const inviteeName = formatGuestInvitationName(activeGuest);
  const isConfirmed = Boolean(
    activeGuest && activeGuest.rsvp && activeGuest.rsvp.trim() !== ""
  );

  // Function to look up an invitation code
  const handleLookup = useCallback(
    async (codeToLookup: string, openModalOnSuccess = true) => {
      const trimmed = codeToLookup.trim();
      if (!trimmed) return;

      setIsLoadingCode(true);
      setInputError("");

      try {
        const res = await fetch(`/api/rsvp?ic=${encodeURIComponent(trimmed)}`);
        const result = await res.json();
        console.log(`[RSVP Modal Lookup for "${trimmed}"] Data from API:`, result);

        if (res.ok && result.success && result.data) {
          setClientGuest(result.data);
          setInputError("");
          const newUrl = `/?ic=${encodeURIComponent(trimmed)}`;
          window.history.replaceState({ path: newUrl }, "", newUrl);
          if (openModalOnSuccess) {
            setIsRsvpModalOpen(true);
          }
        } else {
          setInputError(
            result.error ||
              `Invitation code '${trimmed}' was not found. Please try again.`
          );
        }
      } catch (err: unknown) {
        console.error("Lookup error:", err);
        setInputError(
          "Failed to check code. Please check your internet connection."
        );
      } finally {
        setIsLoadingCode(false);
      }
    },
    []
  );

  // Auto-open modal after 30 seconds if not confirmed, and re-trigger after 30s if closed
  useEffect(() => {
    if (isConfirmed || isRsvpModalOpen) return;

    const timer = setTimeout(() => {
      setIsRsvpModalOpen(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [isConfirmed, isRsvpModalOpen]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    const captureEl = document.getElementById("invitation-download-canvas");
    if (!captureEl) return;

    setIsDownloading(true);
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const dataUrl = await toPng(captureEl, {
        width: 390,
        height: 680,
        canvasWidth: 780,
        canvasHeight: 1360,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      const cleanGuest = inviteeName.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
      link.download = `Hansani_Lakshan_Wedding_Invitation_${cleanGuest || "Card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate invitation image:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const calendarUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Hansani+%26+Lakshan+Wedding&dates=20270311T040300Z/20270311T113000Z&details=Wedding+Celebration+of+Hansani+%26+Lakshan+at+Silver+Ray%2C+Pink+Sapphire+Banquet+Hall%2C+Rathnapura&location=Silver+Ray%2C+Pink+Sapphire+Banquet+Hall%2C+Rathnapura";

  const googleMapsUrl =
    "https://www.google.com/maps/place/Silver+Ray+Grand+(pvt)+Ltd/@6.6570941,80.4855965,17z/data=!3m1!4b1!4m9!3m8!1s0x3ae3ebe080825955:0xc745fc45f7e38a87!5m2!4m1!1i2!8m2!3d6.6570941!4d80.4881714!16s%2Fg%2F11f64cg5xs?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D";

  const handleCalendarClick = () => {
    if (typeof window === "undefined") return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent);
    const isIpadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    const isApple = isIOS || isMac || isIpadOS;

    if (isApple) {
      // In iOS / macOS, opening the .ics triggers native Apple Calendar sheet
      const link = document.createElement("a");
      link.href = "/wedding.ics";
      link.setAttribute("download", "Hansani-Lakshan-Wedding.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(calendarUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center select-none p-3 sm:p-6 md:p-4 print:w-full print:h-screen print:overflow-visible print:p-0 print:m-0 print:bg-[#FAF7F2]">
      <div className="relative w-full h-full max-w-[640px] my-auto print:max-w-none print:w-full print:h-full print:flex print:items-center print:justify-center">
        <div className="relative w-full h-full px-6 py-9 sm:px-14 sm:py-10 md:px-16 md:py-5 print:py-12 print:px-8">
          <div className="flex flex-col items-center justify-center text-center h-full">

            {/* Header - Save The Date with ornamental line-diamond-line */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
              className="mb-4 sm:mb-5 md:mb-3 flex flex-col items-center"
            >
              <p
                style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
                className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.5em] text-[#8A8064] font-semibold"
              >
                Save the Date
              </p>
              <div className="flex items-center gap-2 mt-3 md:mt-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
                  className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#B4914F]/70 origin-right"
                />
                <motion.span
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 45 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 1.05 }}
                  className="w-1.5 h-1.5 bg-[#B4914F]/70"
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
                  className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#B4914F]/70 origin-left"
                />
              </div>
            </motion.div>

            {/* Couple Names - Flowing Wedding Calligraphy Script (Animates First!) */}
            <div className="my-2 sm:my-3 inline-flex flex-col text-left select-none text-wedding-green mx-auto">

              {/* 1. Hansani (Shifted further left) */}
              <motion.div
                initial={{ opacity: 0, x: -32, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="-translate-x-4 sm:-translate-x-8 md:-translate-x-12"
              >
                <span
                  style={{
                    fontFamily: "var(--font-great-vibes), 'Great Vibes', 'Alex Brush', cursive",
                    fontSize: "min(11vh, 17vw, 150px)",
                  }}
                  className="font-normal leading-none tracking-normal"
                >
                  Hansani
                </span>
              </motion.div>

              {/* 2. and (tucked under Hansani, cascading right) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.38 }}
                className="pl-10 sm:pl-16 md:pl-20 -mt-6 sm:-mt-9 md:-mt-11 -mb-2 sm:-mb-3 md:-mb-4"
              >
                <span
                  style={{
                    fontFamily: "var(--font-alex-brush), 'Alex Brush', 'Great Vibes', cursive",
                    fontSize: "min(6vh, 9vw, 80px)",
                  }}
                  className="italic text-[#8A8064]"
                >
                  and
                </span>
              </motion.div>

              {/* 3. Lakshan (Shifted further right, overlapping "and") */}
              <motion.div
                initial={{ opacity: 0, x: 32, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.52 }}
                className="pl-20 sm:pl-32 md:pl-44 -mt-5 sm:-mt-7 md:-mt-9"
              >
                <span
                  style={{
                    fontFamily: "var(--font-great-vibes), 'Great Vibes', 'Alex Brush', cursive",
                    fontSize: "min(11vh, 17vw, 150px)",
                  }}
                  className="font-normal leading-none tracking-normal"
                >
                  Lakshan
                </span>
              </motion.div>

            </div>

            {/* Delicate Gold Separator Line beneath names */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.85, ease: "easeOut", delay: 0.78 }}
              className="flex items-center gap-2 my-2.5 sm:my-3.5 md:my-2 origin-center"
            >
              <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#B4914F]" />
              <span className="w-1 h-1 rounded-full bg-[#B4914F]" />
              <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#B4914F]" />
            </motion.div>

            {/* Invitation / Guest Name Section (3-line layout) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1.15 }}
              style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', 'Times New Roman', Georgia, serif" }}
              className="my-2 sm:my-2.5 md:my-1.5 space-y-0.5 sm:space-y-1 text-center select-none max-w-[92%] sm:max-w-md mx-auto"
            >
              {/* 1st Line: Invite */}
              <p className="text-[11px] sm:text-xs md:text-sm tracking-[0.28em] sm:tracking-[0.32em] uppercase font-medium text-[#6B6656] leading-tight">
                Invite
              </p>

              {/* 2nd Line: Name and Initial */}
              <p
                className={`text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-tight tracking-[0.12em] sm:tracking-[0.16em] uppercase ${
                  inviteeName !== "You" ? "text-[#B4914F]" : "text-[#33312C]"
                }`}
              >
                {inviteeName}
              </p>

              {/* 3rd Line: To Join in Celebration */}
              <p className="text-[11px] sm:text-xs md:text-sm lg:text-base tracking-[0.24em] sm:tracking-[0.28em] uppercase font-medium text-[#6B6656] leading-tight">
                To Join in Celebration
              </p>
            </motion.div>

            {/* Date Arrangement Section */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.35 }}
              className="my-3 sm:my-4 md:my-2 flex items-center justify-center gap-3 sm:gap-5 md:gap-7 select-none"
            >
              {/* Left: THURSDAY framed with ultra-delicate horizontal gold lines */}
              <div className="flex flex-col items-center justify-center min-w-[92px] sm:min-w-[125px] md:min-w-[155px] lg:min-w-[180px]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
                  className="w-full h-px bg-[#B4914F]/50 origin-right"
                />
                <span
                  style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
                  className="py-2.5 sm:py-3.5 md:py-4 text-[11px] sm:text-sm md:text-base lg:text-lg tracking-[0.22em] font-medium text-[#3A362C] uppercase whitespace-nowrap"
                >
                  Thursday
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
                  className="w-full h-px bg-[#B4914F]/50 origin-right"
                />
              </div>

              {/* Left Vertical Divider Line */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 1.45 }}
                className="w-px h-16 sm:h-20 md:h-26 lg:h-30 bg-gradient-to-b from-transparent via-[#B4914F]/60 to-transparent origin-center"
              />

              {/* Center: MARCH / 11 / 2027 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.4 }}
                className="flex flex-col items-center justify-center px-2 sm:px-5"
              >
                <span
                  style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
                  className="text-[11px] sm:text-sm md:text-base lg:text-lg tracking-[0.32em] font-medium text-[#3A362C] uppercase leading-tight"
                >
                  March
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                    fontVariantNumeric: "lining-nums",
                    fontFeatureSettings: "'lnum'",
                  }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-[#B4914F] leading-none my-1.5 tracking-wide"
                >
                  11
                </span>
                <span
                  style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
                  className="text-[11px] sm:text-sm md:text-base lg:text-lg tracking-[0.32em] font-medium text-[#3A362C] uppercase leading-tight"
                >
                  2027
                </span>
              </motion.div>

              {/* Right Vertical Divider Line */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 1.45 }}
                className="w-px h-16 sm:h-20 md:h-26 lg:h-30 bg-gradient-to-b from-transparent via-[#B4914F]/60 to-transparent origin-center"
              />

              {/* Right: AT 09:33 AM framed with ultra-delicate horizontal gold lines */}
              <div className="flex flex-col items-center justify-center min-w-[92px] sm:min-w-[125px] md:min-w-[155px] lg:min-w-[180px]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
                  className="w-full h-px bg-[#B4914F]/50 origin-left"
                />
                <span
                  style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
                  className="py-2.5 sm:py-3.5 md:py-4 text-[11px] sm:text-sm md:text-base lg:text-lg tracking-[0.22em] font-medium text-[#3A362C] uppercase whitespace-nowrap"
                >
                  At 09:33 AM
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
                  className="w-full h-px bg-[#B4914F]/50 origin-left"
                />
              </div>
            </motion.div>

            {/* Venue Details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.65 }}
              style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', 'Times New Roman', Georgia, serif" }}
              className="mt-2 sm:mt-2.5 md:mt-1.5 space-y-1 sm:space-y-1.5 text-[#6B6656]"
            >
              <p className="text-xs sm:text-sm md:text-base tracking-[0.35em] uppercase font-semibold text-[#33312C]">
                At
              </p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-[26px] tracking-[0.35em] uppercase font-semibold text-[#3A362C] leading-tight">
                Silver Ray
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.26em] uppercase font-medium text-[#6B6656] leading-snug">
                Pink Sapphire Banquet Hall
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg tracking-[0.3em] uppercase font-normal text-[#8A8064] leading-normal">
                Rathnapura
              </p>
            </motion.div>

            {/* Bottom ornamental divider before actions */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 1.9 }}
              className="flex items-center gap-2 mt-5 sm:mt-7 md:mt-3 print:hidden origin-center"
            >
              <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#B4914F]/60" />
              <span className="w-1 h-1 rounded-full bg-[#B4914F]/60" />
              <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#B4914F]/60" />
            </motion.div>

            {/* Action Insignia Row: Location | Calendar | RSVP | Download */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 1.85,
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="flex items-center justify-center gap-3.5 sm:gap-7 md:gap-8 mt-4 sm:mt-5 md:mt-3 print:hidden select-none"
            >
              {/* 1. Location */}
              <motion.a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}
                whileTap={{ y: 0, scale: 0.98 }}
                className="group flex flex-col items-center gap-2 cursor-pointer"
                title="Open in Google Maps"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#B4914F]/70 bg-[#FAF7F2] group-hover:bg-[#B4914F] group-hover:border-[#B4914F] flex items-center justify-center transition-all duration-300 shadow-[0_6px_16px_-6px_rgba(180,145,79,0.45)] group-hover:shadow-[0_8px_20px_-4px_rgba(180,145,79,0.6)]">
                  <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#3A362C] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                    textShadow:
                      "0 0 4px #FAF7F2, 0 0 8px #FAF7F2, 0 0 12px #FAF7F2, 0 1px 16px rgba(255, 255, 255, 0.95), 0 2px 22px rgba(250, 247, 242, 0.95), 0 0 30px rgba(255, 255, 255, 0.9), 0 0 40px rgba(250, 247, 242, 0.85)",
                  }}
                  className="text-[7.5px] sm:text-[9px] tracking-[0.26em] uppercase font-semibold text-[#3A362C] group-hover:text-[#1A1813]"
                >
                  Location
                </span>
              </motion.a>

              {/* 2. Calendar */}
              <motion.button
                type="button"
                onClick={handleCalendarClick}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}
                whileTap={{ y: 0, scale: 0.98 }}
                className="group flex flex-col items-center gap-2 cursor-pointer"
                title="Add to Calendar"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#B4914F]/70 bg-[#FAF7F2] group-hover:bg-[#B4914F] group-hover:border-[#B4914F] flex items-center justify-center transition-all duration-300 shadow-[0_6px_16px_-6px_rgba(180,145,79,0.45)] group-hover:shadow-[0_8px_20px_-4px_rgba(180,145,79,0.6)]">
                  <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#3A362C] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                    textShadow:
                      "0 0 4px #FAF7F2, 0 0 8px #FAF7F2, 0 0 12px #FAF7F2, 0 1px 16px rgba(255, 255, 255, 0.95), 0 2px 22px rgba(250, 247, 242, 0.95), 0 0 30px rgba(255, 255, 255, 0.9), 0 0 40px rgba(250, 247, 242, 0.85)",
                  }}
                  className="text-[7.5px] sm:text-[9px] tracking-[0.26em] uppercase font-semibold text-[#3A362C] group-hover:text-[#1A1813]"
                >
                  Calendar
                </span>
              </motion.button>

              {/* 3. RSVP */}
              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}
                whileTap={{ y: 0, scale: 0.98 }}
                type="button"
                onClick={() => setIsRsvpModalOpen(true)}
                className="group flex flex-col items-center gap-2 cursor-pointer"
                title="Confirm RSVP"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#B4914F]/70 bg-[#FAF7F2] group-hover:bg-[#B4914F] group-hover:border-[#B4914F] flex items-center justify-center transition-all duration-300 shadow-[0_6px_16px_-6px_rgba(180,145,79,0.45)] group-hover:shadow-[0_8px_20px_-4px_rgba(180,145,79,0.6)]">
                  <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#3A362C] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                    textShadow:
                      "0 0 4px #FAF7F2, 0 0 8px #FAF7F2, 0 0 12px #FAF7F2, 0 1px 16px rgba(255, 255, 255, 0.95), 0 2px 22px rgba(250, 247, 242, 0.95), 0 0 30px rgba(255, 255, 255, 0.9), 0 0 40px rgba(250, 247, 242, 0.85)",
                  }}
                  className="text-[7.5px] sm:text-[9px] tracking-[0.26em] uppercase font-semibold text-[#3A362C] group-hover:text-[#1A1813]"
                >
                  RSVP
                </span>
              </motion.button>

              {/* 4. Wishes */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}
                whileTap={{ y: 0, scale: 0.98 }}
              >
                <Link
                  href={inviteCode ? `/wishes?ic=${encodeURIComponent(inviteCode)}` : "/wishes"}
                  className="group flex flex-col items-center gap-2 cursor-pointer"
                  title="View Wedding Wishes & Blessings"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#B4914F]/70 bg-[#FAF7F2] group-hover:bg-[#B4914F] group-hover:border-[#B4914F] flex items-center justify-center transition-all duration-300 shadow-[0_6px_16px_-6px_rgba(180,145,79,0.45)] group-hover:shadow-[0_8px_20px_-4px_rgba(180,145,79,0.6)]">
                    <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#3A362C] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                      textShadow:
                        "0 0 4px #FAF7F2, 0 0 8px #FAF7F2, 0 0 12px #FAF7F2, 0 1px 16px rgba(255, 255, 255, 0.95), 0 2px 22px rgba(250, 247, 242, 0.95), 0 0 30px rgba(255, 255, 255, 0.9), 0 0 40px rgba(250, 247, 242, 0.85)",
                    }}
                    className="text-[7.5px] sm:text-[9px] tracking-[0.26em] uppercase font-semibold text-[#3A362C] group-hover:text-[#1A1813]"
                  >
                    Wishes
                  </span>
                </Link>
              </motion.div>

              {/* 5. Download */}
              <motion.button
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}
                whileTap={{ y: 0, scale: 0.98 }}
                type="button"
                disabled={isDownloading}
                onClick={handleDownload}
                className="group flex flex-col items-center gap-2 cursor-pointer disabled:opacity-60"
                title="Download Invitation Image"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-[#B4914F]/70 bg-[#FAF7F2] group-hover:bg-[#B4914F] group-hover:border-[#B4914F] flex items-center justify-center transition-all duration-300 shadow-[0_6px_16px_-6px_rgba(180,145,79,0.45)] group-hover:shadow-[0_8px_20px_-4px_rgba(180,145,79,0.6)]">
                  {isDownloading ? (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#B4914F] border-t-transparent group-hover:border-white group-hover:border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#3A362C] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                    textShadow:
                      "0 0 4px #FAF7F2, 0 0 8px #FAF7F2, 0 0 12px #FAF7F2, 0 1px 16px rgba(255, 255, 255, 0.95), 0 2px 22px rgba(250, 247, 242, 0.95), 0 0 30px rgba(255, 255, 255, 0.9), 0 0 40px rgba(250, 247, 242, 0.85)",
                  }}
                  className="text-[7.5px] sm:text-[9px] tracking-[0.26em] uppercase font-semibold text-[#3A362C] group-hover:text-[#1A1813]"
                >
                  {isDownloading ? "Saving..." : "Download"}
                </span>
              </motion.button>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Hidden Dedicated 390x850 Invitation Canvas for High-Res Image Download */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none z-[-100] opacity-100"
        aria-hidden="true"
      >
        <InvitationDownloadCard
          guest={activeGuest}
          id="invitation-download-canvas"
        />
      </div>

      {/* RSVP Modal Dialog */}
      {isRsvpModalOpen && (
        <div
          className="fixed inset-0 bg-[#2A271F]/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRsvpModalOpen(false);
          }}
        >
          <div
            className={`bg-[#FAF7F2] rounded-[1.75rem] ${
              activeGuest ? "max-w-2xl h-[90vh] max-h-[90vh]" : "max-w-sm"
            } w-full border border-[#B4914F]/40 shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
          >
            {activeGuest ? (
              <RsvpForm
                guest={activeGuest}
                isModal={true}
                onClose={() => setIsRsvpModalOpen(false)}
                onSuccess={(updatedGuest) => {
                  setClientGuest(updatedGuest);
                }}
              />
            ) : (
              <div className="flex flex-col">
                <div className="p-5 sm:p-7 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-[#B4914F]/60 bg-[#B4914F]/10 flex items-center justify-center text-[#3A362C]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>

                  <h3
                    style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', serif" }}
                    className="text-xl sm:text-2xl font-medium tracking-[0.2em] text-[#33312C] uppercase"
                  >
                    Confirm RSVP
                  </h3>
                  <p className="text-xs text-[#6B6656] tracking-wider mt-1.5 mb-5">
                    Enter your invitation code to access your response
                  </p>

                  <form
                    id="rsvp-code-lookup-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLookup(inviteCode);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => {
                          setInviteCode(e.target.value);
                          if (inputError) setInputError("");
                        }}
                        placeholder="e.g. 4545gf"
                        required
                        autoFocus
                        disabled={isLoadingCode}
                        className="w-full px-4 py-3 rounded-xl border border-[#B4914F]/40 bg-white focus:border-[#B4914F] focus:ring-2 focus:ring-[#B4914F]/25 outline-none text-center font-mono tracking-widest text-[#33312C] placeholder-[#6B6656]/40 uppercase text-sm shadow-xs transition-all disabled:opacity-60"
                      />
                      {inputError && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200 text-left">
                          {inputError}
                        </p>
                      )}
                    </div>
                  </form>
                </div>

                {/* Fixed Modal Footer for Code Lookup - Outside body */}
                <div className="shrink-0 p-4 sm:px-7 sm:py-4 border-t border-[#B4914F]/20 bg-[#FAF7F2] flex items-stretch gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setIsRsvpModalOpen(false)}
                    className="flex-1 h-12 px-3 rounded-xl border border-[#B4914F]/40 hover:border-[#B4914F] hover:bg-[#B4914F]/10 text-[#6B6656] hover:text-[#33312C] text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center text-center active:scale-98 shadow-2xs whitespace-nowrap"
                  >
                    Later
                  </button>

                  <button
                    type="submit"
                    form="rsvp-code-lookup-form"
                    disabled={isLoadingCode || !inviteCode.trim()}
                    className="flex-1 h-12 px-3 rounded-xl bg-[#3A362C] hover:bg-[#242119] disabled:bg-stone-300 text-white text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-98 text-center whitespace-nowrap"
                  >
                    {isLoadingCode ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <span>Confirm</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
