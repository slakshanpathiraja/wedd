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

export async function getAllWishes(currentIc?: string): Promise<Array<{ name: string; initial?: string; wish: string }>> {
  const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL?.trim();
  let sheetWishes: Array<{ name: string; initial?: string; wish: string }> = [];

  if (scriptUrl && !scriptUrl.includes("docs.google.com/spreadsheets")) {
    try {
      const targetUrl = new URL(scriptUrl);
      targetUrl.searchParams.set("action", "wishes");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      console.log(`[Wishes API] Requesting wishes from Google Sheet: ${targetUrl.toString()}`);

      const response = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log(`[Wishes API] Google Sheet response (status ${response.status}):`, JSON.stringify(result, null, 2));

        if (result.success && Array.isArray(result.data)) {
          sheetWishes = result.data.filter(
            (w: { wish?: string }) => typeof w.wish === "string" && w.wish.trim().length > 0
          );
          console.log(`[Wishes API] Loaded ${sheetWishes.length} valid non-empty wishes from Google Sheet.`);
        } else {
          console.warn(`[Wishes API] Google Sheet returned error or non-array data:`, result);
        }
      } else {
        console.error(`[Wishes API] Google Sheet request failed with HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.warn("Could not fetch all wishes from Google Sheet script:", err);
    }
  }

  // Also read locally cached wishes (e.g. newly submitted ones)
  const { getLocalWishes, saveLocalWish } = await import("./wishes-store");

  // If a current guest invite code is provided, check if that guest has a wish
  if (currentIc && currentIc.trim()) {
    try {
      const guestRes = await getGuestByCode(currentIc.trim());
      if (guestRes.success && guestRes.guest?.wish && guestRes.guest.wish.trim()) {
        saveLocalWish({
          name: guestRes.guest.name || "Guest",
          initial: guestRes.guest.initial || "",
          wish: guestRes.guest.wish.trim(),
        });
      }
    } catch (err) {
      console.error("Error checking current guest wish:", err);
    }
  }

  // Refresh local wishes after any check
  const updatedLocal = getLocalWishes();

  // Combine and deduplicate
  const combined = [...sheetWishes];
  for (const local of updatedLocal) {
    const isDuplicate = combined.some(
      (s) =>
        s.name.trim().toLowerCase() === local.name.trim().toLowerCase() &&
        s.wish.trim().toLowerCase() === local.wish.trim().toLowerCase()
    );
    if (!isDuplicate && local.wish && local.wish.trim().length > 0) {
      combined.push({
        name: local.name,
        initial: local.initial,
        wish: local.wish,
      });
    }
  }

  // Strictly filter: empty wishes must not be shown
  const finalWishes = combined.filter((w) => typeof w.wish === "string" && w.wish.trim().length > 0);
  console.log(`[Wishes API] Final public wishes count: ${finalWishes.length}`);
  return finalWishes;
}

