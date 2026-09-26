import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, GuestRsvp, UpdateRsvpPayload } from "@/lib/types";
import { getGuestByCode } from "@/lib/sheet";

// In-memory store for fallback/demo mode when sheet URL is not yet configured
const demoGuests: Record<string, GuestRsvp> = {
  "4545gf": {
    phoneNumber: "768684275",
    initial: "Mr",
    name: "Lakshan Pathiraja",
    rsvp: "",
    countInvite: 1,
    countConform: 0,
    comment: "",
    wish: "",
    inviteCode: "4545gf"
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ic = searchParams.get("ic")?.trim();

  if (!ic) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Invite code is required." },
      { status: 400 }
    );
  }

  const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL?.trim();

  if (scriptUrl) {
    try {
      const targetUrl = new URL(scriptUrl);
      targetUrl.searchParams.set("action", "get");
      targetUrl.searchParams.set("ic", ic);

      const response = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store",
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`Google Sheets responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`[GET /api/rsvp ic="${ic}"] Google Sheet data:`, JSON.stringify(data, null, 2));
      return NextResponse.json(data);
    } catch (err: unknown) {
      console.error("Error contacting Google Sheets:", err);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Could not fetch invitation data from Google Sheet. Please check your App Script deployment and permissions."
        },
        { status: 502 }
      );
    }
  }

  // Fallback / Demo Mode if GOOGLE_SHEET_APP_SCRIPT_URL is not configured
  const lowerCode = ic.toLowerCase();
  const guest = demoGuests[lowerCode];

  if (guest) {
    return NextResponse.json<ApiResponse<GuestRsvp>>({
      success: true,
      data: guest,
      message: "Loaded from demo mode (Google Sheet URL not configured in .env.local)"
    });
  }

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: `Invitation code '${ic}' was not found. (Demo mode: Try code '4545gf' or add GOOGLE_SHEET_APP_SCRIPT_URL to .env.local)`
    },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateRsvpPayload = await request.json();
    const { inviteCode, rsvp, countConform, comment, wish, phoneNumber } = body;

    if (!inviteCode) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invite code is required for updating RSVP." },
        { status: 400 }
      );
    }

    // Lock check: Once RSVP is recorded, disallow any modifications from any device/browser
    const existing = await getGuestByCode(inviteCode);
    if (existing.success && existing.guest?.rsvp && existing.guest.rsvp.trim() !== "") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "RSVP has already been submitted and locked for this invitation."
        },
        { status: 403 }
      );
    }

    const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL?.trim();

    if (scriptUrl) {
      try {
        const updateUrl = new URL(scriptUrl);
        updateUrl.searchParams.set("action", "update");
        updateUrl.searchParams.set("ic", inviteCode);
        updateUrl.searchParams.set("rsvp", rsvp);
        updateUrl.searchParams.set("countConform", String(countConform));
        updateUrl.searchParams.set("comment", comment || "");
        updateUrl.searchParams.set("wish", wish || "");
        if (phoneNumber) updateUrl.searchParams.set("phone", phoneNumber);

        const response = await fetch(updateUrl.toString(), {
          method: "GET",
          headers: { "Accept": "application/json" },
          cache: "no-store",
          redirect: "follow"
        });

        const data = await response.json();
        return NextResponse.json(data);
      } catch (err: unknown) {
        console.error("Error updating Google Sheet:", err);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Failed to update Google Sheet. Please verify your App Script permissions."
          },
          { status: 502 }
        );
      }
    }

    // Demo Mode update
    const lowerCode = inviteCode.toLowerCase();
    if (demoGuests[lowerCode]) {
      demoGuests[lowerCode] = {
        ...demoGuests[lowerCode],
        rsvp,
        countConform: Number(countConform) || 0,
        comment: comment || "",
        wish: wish || "",
        phoneNumber: phoneNumber || demoGuests[lowerCode].phoneNumber
      };

      return NextResponse.json<ApiResponse<GuestRsvp>>({
        success: true,
        message: "RSVP updated successfully! (Demo mode: Connect your Google Sheet in .env.local to save to your live spreadsheet)",
        data: demoGuests[lowerCode]
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Invitation code '${inviteCode}' not found.`
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error("Error parsing request:", err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

