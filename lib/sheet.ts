import { GuestRsvp } from "./types";

export async function getGuestByCode(ic: string): Promise<{ success: boolean; guest?: GuestRsvp; error?: string }> {
  const trimmed = (ic || "").trim();
  if (!trimmed) {
    return { success: false, error: "Invite code is required." };
  }

  const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL?.trim();

  if (scriptUrl && !scriptUrl.includes("docs.google.com/spreadsheets")) {
    try {
      const targetUrl = new URL(scriptUrl);
      targetUrl.searchParams.set("action", "get");
      targetUrl.searchParams.set("ic", trimmed);

      const response = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store",
        redirect: "follow",
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Google Sheets returned status ${response.status}.`,
        };
      }

      const result = await response.json();
      console.log(`[GoogleSheet Response for code: "${trimmed}"]:`, JSON.stringify(result, null, 2));

      if (result.success && result.data) {
        return { success: true, guest: result.data };
      }

      return {
        success: false,
        error: result.error || `No invitation found for code '${trimmed}'.`,
      };
    } catch (err: unknown) {
      console.error("Error fetching guest during SSR:", err);
      return {
        success: false,
        error: "Could not connect to Google Sheets backend. Please verify your internet connection.",
      };
    }
  }

  // Fallback demo data if script URL is not set
  if (trimmed.toLowerCase() === "4545gf") {
    return {
      success: true,
      guest: {
        phoneNumber: "768684275",
        initial: "Mr",
        name: "Lakshan Pathiraja",
        rsvp: "",
        countInvite: 1,
        countConform: 0,
        comment: "",
        wish: "",
        inviteCode: "4545gf",
      },
    };
  }

  return {
    success: false,
    error: `No invitation found for code '${trimmed}'.`,
  };
}

