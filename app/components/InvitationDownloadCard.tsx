import React from "react";
import Image from "next/image";
import { GuestRsvp } from "@/lib/types";
import { formatGuestInvitationName } from "./WeddingCard";

interface InvitationDownloadCardProps {
  guest?: GuestRsvp | null;
  id?: string;
}

export default function InvitationDownloadCard({
  guest,
  id = "invitation-download-canvas",
}: InvitationDownloadCardProps) {
  const inviteeName = formatGuestInvitationName(guest);

  return (
    <div
      id={id}
      style={{ width: "390px", height: "680px" }}
      className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#FAF6F0] to-[#F3EDE2] text-stone-800 select-none"
      aria-hidden="true"
    >
      {/* 1. Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <Image
          src="/bg.webp"
          alt=""
          fill
          unoptimized
          sizes="390px"
          className="object-cover object-center"
        />
      </div>

      {/* 2. Top Floral Arch */}
      <div className="absolute top-0 left-0 right-0 w-full z-0 pointer-events-none leading-none overflow-hidden">
        <Image
          src="/bg4.webp"
          alt=""
          width={1003}
          height={366}
          unoptimized
          priority
          className="w-full h-auto object-cover object-top"
        />
      </div>

      {/* 3. Center Rotating Mandala Graphic */}
      <div
        style={{
          maskImage: "linear-gradient(210deg, black 46%, transparent 54%)",
          WebkitMaskImage: "linear-gradient(210deg, black 46%, transparent 54%)",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
      >
        <div className="w-[340px] h-[340px] opacity-[0.05] flex items-center justify-center">
          <Image
            src="/bg2.webp"
            alt=""
            width={1200}
            height={1200}
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 4. Bottom Floral Arrangement */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none leading-none overflow-hidden">
        <Image
          src="/bg1.webp"
          alt=""
          width={1322}
          height={753}
          unoptimized
          priority
          className="w-full h-auto object-cover object-bottom"
        />
      </div>

      {/* 5. Main Card Content (Harmoniously Centered & Compact, Matching On-Screen Design Exactly) */}
      <div className="relative z-10 w-full h-full px-6 py-6 flex flex-col items-center justify-center text-center">

        {/* Header - Save The Date with ornamental line-diamond-line */}
        <div className="mb-2.5 flex flex-col items-center">
          <p
            style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
            className="text-[10px] uppercase tracking-[0.5em] text-[#8A8064] font-semibold"
          >
            Save the Date
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#B4914F]/70 origin-right" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B4914F]/70" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#B4914F]/70 origin-left" />
          </div>
        </div>

        {/* Couple Names - Flowing Wedding Calligraphy Script */}
        <div className="my-2 inline-flex flex-col text-left select-none mx-auto w-full max-w-[320px]">
          {/* Hansani */}
          <div className="-translate-x-4">
            <span
              style={{
                fontFamily: "var(--font-great-vibes), 'Great Vibes', 'Alex Brush', cursive",
                fontSize: "70px",
              }}
              className="font-normal leading-none tracking-normal block text-[#2E2C26]"
            >
              Hansani
            </span>
          </div>

          {/* and */}
          <div className="pl-14 -mt-5 -mb-2">
            <span
              style={{
                fontFamily: "var(--font-alex-brush), 'Alex Brush', 'Great Vibes', cursive",
                fontSize: "34px",
              }}
              className="italic text-[#8A8064]"
            >
              and
            </span>
          </div>

          {/* Lakshan */}
          <div className="pl-20 -mt-4">
            <span
              style={{
                fontFamily: "var(--font-great-vibes), 'Great Vibes', 'Alex Brush', cursive",
                fontSize: "70px",
              }}
              className="font-normal leading-none tracking-normal block text-[#2E2C26]"
            >
              Lakshan
            </span>
          </div>
        </div>

        {/* Delicate Gold Separator Line beneath names */}
        <div className="flex items-center gap-2 my-2 origin-center">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#B4914F]" />
          <span className="w-1 h-1 rounded-full bg-[#B4914F]" />
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#B4914F]" />
        </div>

        {/* Invitation / Guest Name Section (3-line layout) */}
        <div
          style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', 'Times New Roman', Georgia, serif" }}
          className="my-1.5 space-y-0.5 text-center select-none max-w-[90%] mx-auto"
        >
          {/* 1st Line: Invite */}
          <p className="text-[11px] tracking-[0.28em] uppercase font-medium text-[#6B6656] leading-tight">
            Invite
          </p>

          {/* 2nd Line: Name and Initial */}
          <p
            className={`text-base font-semibold leading-tight tracking-[0.14em] uppercase ${
              inviteeName !== "You" ? "text-[#B4914F]" : "text-[#33312C]"
            }`}
          >
            {inviteeName}
          </p>

          {/* 3rd Line: To Join in Celebration */}
          <p className="text-[11px] tracking-[0.24em] uppercase font-medium text-[#6B6656] leading-tight">
            To Join in Celebration
          </p>
        </div>

        {/* Date Arrangement Section */}
        <div className="my-2.5 flex items-center justify-center gap-2.5 select-none w-full max-w-[340px]">
          {/* Left: THURSDAY */}
          <div className="flex flex-col items-center justify-center min-w-[92px]">
            <div className="w-full h-px bg-[#B4914F]/50" />
            <span
              style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
              className="py-2 text-[11px] tracking-[0.22em] font-medium text-[#3A362C] uppercase whitespace-nowrap"
            >
              Thursday
            </span>
            <div className="w-full h-px bg-[#B4914F]/50" />
          </div>

          {/* Left Vertical Divider Line */}
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-[#B4914F]/60 to-transparent" />

          {/* Center: MARCH / 11 / 2027 */}
          <div className="flex flex-col items-center justify-center px-2.5">
            <span
              style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
              className="text-[11px] tracking-[0.32em] font-medium text-[#3A362C] uppercase leading-tight"
            >
              March
            </span>
            <span
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontVariantNumeric: "lining-nums",
              }}
              className="text-4xl font-semibold text-[#B4914F] leading-none my-1 tracking-wide"
            >
              11
            </span>
            <span
              style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
              className="text-[11px] tracking-[0.32em] font-medium text-[#3A362C] uppercase leading-tight"
            >
              2027
            </span>
          </div>

          {/* Right Vertical Divider Line */}
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-[#B4914F]/60 to-transparent" />

          {/* Right: AT 09:33 AM */}
          <div className="flex flex-col items-center justify-center min-w-[92px]">
            <div className="w-full h-px bg-[#B4914F]/50" />
            <span
              style={{ fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}
              className="py-2 text-[11px] tracking-[0.22em] font-medium text-[#3A362C] uppercase whitespace-nowrap"
            >
              At 09:33 AM
            </span>
            <div className="w-full h-px bg-[#B4914F]/50" />
          </div>
        </div>

        {/* Venue Details */}
        <div
          style={{ fontFamily: "var(--font-garamond), 'Cormorant Garamond', 'Times New Roman', Georgia, serif" }}
          className="mt-2 space-y-0.5 text-[#6B6656]"
        >
          <p className="text-[11px] tracking-[0.35em] uppercase font-semibold text-[#33312C]">
            At
          </p>
          <p className="text-xl tracking-[0.35em] uppercase font-semibold text-[#3A362C] leading-tight">
            Silver Ray
          </p>
          <p className="text-sm tracking-[0.26em] uppercase font-medium text-[#6B6656] leading-snug">
            Pink Sapphire Banquet Hall
          </p>
          <p className="text-xs tracking-[0.3em] uppercase font-normal text-[#8A8064] leading-normal">
            Rathnapura
          </p>
        </div>

        {/* Bottom ornamental divider */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#B4914F]/60" />
          <span className="w-1 h-1 rounded-full bg-[#B4914F]/60" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#B4914F]/60" />
        </div>

      </div>
    </div>
  );
}
