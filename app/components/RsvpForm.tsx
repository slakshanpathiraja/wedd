"use client";

import React, { useState } from "react";
import { GuestRsvp } from "@/lib/types";

interface RsvpFormProps {
  guest: GuestRsvp;
  onSuccess?: (updatedGuest: GuestRsvp) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export default function RsvpForm({ guest: initialGuest, onSuccess, isModal = false, onClose }: RsvpFormProps) {
  const [guest, setGuest] = useState<GuestRsvp>(initialGuest);

  // Check if RSVP is already filled in the sheet
  const alreadySubmitted = Boolean(initialGuest.rsvp && initialGuest.rsvp.trim() !== "");

  // Form input states
  const [rsvpStatus, setRsvpStatus] = useState<"Attending" | "Declined" | "">(
    initialGuest.rsvp && (initialGuest.rsvp.toLowerCase().includes("attend") || initialGuest.rsvp.toLowerCase() === "yes")
      ? "Attending"
      : initialGuest.rsvp && (initialGuest.rsvp.toLowerCase().includes("decline") || initialGuest.rsvp.toLowerCase() === "no")
      ? "Declined"
      : "Attending"
  );

  const [countConform, setCountConform] = useState<number>(
    initialGuest.countConform > 0
      ? initialGuest.countConform
      : Math.max(1, initialGuest.countInvite)
  );

  const [phoneNumber, setPhoneNumber] = useState<string>(initialGuest.phoneNumber || "");
  const [comment, setComment] = useState<string>(initialGuest.comment || "");
  const [wish, setWish] = useState<string>(initialGuest.wish || "");

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Lock status: true if already submitted previously OR just submitted right now
  const isLocked = alreadySubmitted || justSubmitted;

  const handleAttendanceChange = (status: "Attending" | "Declined") => {
    if (isLocked) return;
    setRsvpStatus(status);
    if (status === "Declined") {
      setCountConform(0);
    } else {
      if (countConform === 0) {
        setCountConform(guest.countInvite > 0 ? guest.countInvite : 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        inviteCode: guest.inviteCode,
        rsvp: rsvpStatus,
        countConform: rsvpStatus === "Declined" ? 0 : countConform,
        comment: comment.trim(),
        wish: wish.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setJustSubmitted(true);
        const updated = result.data || { ...guest, ...payload };
        setGuest(updated);
        onSuccess?.(updated);
      } else {
        setSubmitError(result.error || "Failed to update RSVP. Please try again.");
      }
    } catch (err: unknown) {
      console.error(err);
      setSubmitError("Failed to submit RSVP. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const greetingNode = (
    <div className={`text-center ${isModal ? "pb-4 mb-5 border-b border-[#B4914F]/20" : "pb-6 mb-6 border-b border-stone-100"}`}>
      <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">
        Invitation For
      </span>
      <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1 font-medium">
        {guest.initial ? `${guest.initial} ` : ""}{guest.name}
      </h2>

      {isLocked && (
        <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>RSVP Confirmed</span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full max-w-2xl mx-auto ${isModal ? "h-full flex flex-col min-h-0 overflow-hidden" : "px-4 py-8 sm:py-12"}`}>
      {/* Decorative Wedding Header (Only when not in modal) */}
      {!isModal && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-full bg-amber-50 border border-amber-200/60 shadow-xs">
            <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-1">
            Wedding Invitation & RSVP
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 font-medium tracking-tight">
            Celebrate With Us
          </h1>
          <div className="w-16 h-px bg-amber-400/80 mx-auto my-3" />
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            {isLocked
              ? "Your RSVP has been received and confirmed. Thank you for celebrating with us!"
              : "We are honored to invite you to celebrate our wedding. Please let us know if you can make it below."}
          </p>
        </div>
      )}

      {/* Guest Invitation Content */}
      <div className={isModal ? "w-full flex-1 flex flex-col min-h-0 overflow-hidden" : "bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200/90 relative overflow-hidden"}>
        {!isModal && (
          /* Top Gold Accent Bar */
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />
        )}

        {/* COMPLETED READ-ONLY SUMMARY (No edit buttons or inputs) */}
        {isLocked ? (
          <div className={isModal ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "py-4 space-y-6"}>
            <div className={isModal ? "flex-1 overflow-y-auto p-5 sm:p-7 space-y-6" : "space-y-6"}>
              {greetingNode}

              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif text-stone-900 font-medium">
                  {justSubmitted ? "Thank You!" : "Response Recorded"}
                </h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto mt-1">
                  Your RSVP is safely saved to our guest list.
                </p>
              </div>

              {/* Read-Only Summary Table */}
              <div className="p-5 bg-stone-50 rounded-2xl max-w-md mx-auto border border-stone-200/80 text-xs space-y-3 text-stone-700">
                <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                  <span className="text-stone-500 font-medium">Attendance:</span>
                  <span className={`font-semibold px-2.5 py-0.5 rounded-full ${
                    (guest.rsvp || rsvpStatus).toLowerCase().includes("attend")
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-800"
                  }`}>
                    {(guest.rsvp || rsvpStatus).toLowerCase().includes("attend") ? "Joyfully Accepting" : "Regretfully Declining"}
                  </span>
                </div>

                {(guest.rsvp || rsvpStatus).toLowerCase().includes("attend") && (
                  <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">Confirmed Attendees:</span>
                    <span className="font-semibold text-stone-900">
                      {guest.countConform ?? countConform} {Number(guest.countConform ?? countConform) === 1 ? "Guest" : "Guests"}
                    </span>
                  </div>
                )}

                {guest.phoneNumber && (
                  <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">Contact Phone:</span>
                    <span className="font-mono text-stone-900">{guest.phoneNumber}</span>
                  </div>
                )}

                {guest.comment && (
                  <div className="py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium block mb-0.5">Dietary & Notes:</span>
                    <p className="text-stone-900 bg-white p-2 rounded-lg border border-stone-200">
                      {guest.comment}
                    </p>
                  </div>
                )}

                {guest.wish && (
                  <div className="pt-1">
                    <span className="text-stone-500 font-medium block mb-0.5">Your Wishes:</span>
                    <p className="italic text-stone-800 font-serif bg-white p-2 rounded-lg border border-stone-200">
                      “{guest.wish}”
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isModal && onClose && (
              <div className="shrink-0 p-4 sm:px-7 sm:py-4 border-t border-[#B4914F]/20 bg-[#FAF7F2] flex select-none">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12 px-4 rounded-xl border border-[#B4914F]/40 hover:border-[#B4914F] hover:bg-[#B4914F]/10 text-[#6B6656] hover:text-[#33312C] text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center text-center active:scale-98 shadow-2xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : (
          /* FIRST-TIME RSVP FORM (Only displayed if RSVP has not yet been filled) */
          <form onSubmit={handleSubmit} className={isModal ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "space-y-6"}>
            {/* Scrollable Form Body */}
            <div className={isModal ? "flex-1 overflow-y-auto p-5 sm:p-7 space-y-6" : "space-y-6"}>
              {greetingNode}

              {/* Question 1: Attendance */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
                  Will You Be Attending? <span className="text-amber-700">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAttendanceChange("Attending")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      rsvpStatus === "Attending"
                        ? "border-amber-600 bg-amber-50/60 text-amber-900 ring-2 ring-amber-300/40 shadow-xs"
                        : "border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        rsvpStatus === "Attending"
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-stone-400 bg-white"
                      }`}
                    >
                      {rsvpStatus === "Attending" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Joyfully Accept</p>
                      <p className="text-xs text-stone-500">I will attend with joy</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAttendanceChange("Declined")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      rsvpStatus === "Declined"
                        ? "border-stone-600 bg-stone-100 text-stone-900 ring-2 ring-stone-300 shadow-xs"
                        : "border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/40"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        rsvpStatus === "Declined"
                          ? "border-stone-800 bg-stone-800 text-white"
                          : "border-stone-400 bg-white"
                      }`}
                    >
                      {rsvpStatus === "Declined" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Regretfully Decline</p>
                      <p className="text-xs text-stone-500">Will celebrate from afar</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Question 2: Confirmed Count (if attending) */}
              {rsvpStatus === "Attending" && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <label htmlFor="count-conform-select" className="text-xs font-semibold uppercase tracking-wider text-amber-900 block">
                        Number of Attending Guests
                      </label>
                      <p className="text-xs text-stone-600">
                        Up to {guest.countInvite} reserved {guest.countInvite === 1 ? "seat" : "seats"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-stone-300 rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setCountConform((prev) => Math.max(1, prev - 1))}
                        disabled={countConform <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-base transition-colors"
                      >
                        -
                      </button>
                      <span className="font-semibold text-stone-900 w-6 text-center text-sm">
                        {countConform}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCountConform((prev) => Math.min(guest.countInvite, prev + 1))}
                        disabled={countConform >= guest.countInvite}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-base transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Question 3: Phone Number */}
              <div>
                <label htmlFor="phone-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Contact Phone Number
                </label>
                <input
                  id="phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 768684275"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-stone-900 text-sm placeholder:text-stone-400"
                />
              </div>

              {/* Question 4: Dietary or General Comments */}
              <div>
                <label htmlFor="comment-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Dietary Requirements & Notes
                </label>
                <input
                  id="comment-input"
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Vegetarian, allergies, wheelchair access..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-stone-900 text-sm placeholder:text-stone-400"
                />
              </div>

              {/* Question 5: Wishes for the Couple */}
              <div>
                <label htmlFor="wish-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Wishes for the Couple
                </label>
                <textarea
                  id="wish-input"
                  rows={3}
                  value={wish}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="Share your warm blessings and wishes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none text-stone-900 text-sm placeholder:text-stone-400 resize-none"
                />
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {submitError}
                </div>
              )}
            </div>

            {/* Modal Fixed Footer - Sibling outside of scroll area! */}
            {isModal && onClose ? (
              <div className="shrink-0 p-4 sm:px-7 sm:py-4 border-t border-[#B4914F]/20 bg-[#FAF7F2] flex items-stretch gap-3 select-none">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 px-3 rounded-xl border border-[#B4914F]/40 hover:border-[#B4914F] hover:bg-[#B4914F]/10 text-[#6B6656] hover:text-[#33312C] text-[11px] sm:text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center text-center active:scale-98 shadow-2xs whitespace-nowrap"
                >
                  Later
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rsvpStatus}
                  className="flex-1 h-12 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-semibold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-center whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Confirm Attendance</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-6 pt-0">
                <button
                  type="submit"
                  disabled={isSubmitting || !rsvpStatus}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-medium text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting RSVP...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Lock RSVP</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
