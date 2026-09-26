/**
 * Google Apps Script for Wedding RSVP
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open your Google Sheet ("Wedding planning").
 * 2. Click "Extensions" > "Apps Script" in the top menu.
 * 3. Delete any existing code in Code.gs and paste all of this code.
 * 4. Click "Save" (floppy disk icon).
 * 5. Click "Deploy" (blue button at top right) > "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Fill in:
 *    - Description: "Wedding RSVP API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (Crucial: allows the Next.js app to read & write)
 * 8. Click "Deploy".
 * 9. Authorize access if prompted (click "Advanced" > "Go to Wedding RSVP API (unsafe)" > "Allow").
 * 10. Copy the "Web app URL" (looks like https://script.google.com/macros/s/.../exec).
 * 11. Add it to your .env.local file:
 *     GOOGLE_SHEET_APP_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 */

const SHEET_NAME = "rsvp";

// Column index mapping (1-based for Google Sheets getRange)
const COL = {
  PHONE: 1,       // A: Phone Number
  INITIAL: 2,     // B: Initial
  NAME: 3,        // C: Name
  RSVP: 4,        // D: RSVP
  COUNT_INVITE: 5,// E: Count_invite
  COUNT_CONFORM: 6,// F: Count_conform
  COMMENT: 7,     // G: Comment
  WISH: 8,        // H: Wish
  INVITE_CODE: 9  // I: Invite_code
};

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    const sheets = ss.getSheets();
    for (let s of sheets) {
      if (s.getName().trim().toLowerCase() === SHEET_NAME.toLowerCase()) {
        sheet = s;
        break;
      }
    }
  }
  return sheet;
}

/**
 * Handles GET requests:
 * 1. ?action=get&ic=INVITE_CODE
 * 2. ?action=update&ic=...&rsvp=...&countConform=...&comment=...&wish=...&phone=...
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = (params.action || "get").toLowerCase();

    if (action === "update") {
      return handleUpdate(params);
    }

    // Default: Get guest by invite code
    const inviteCode = (params.ic || params.invite_code || "").toString().trim();

    if (!inviteCode) {
      return jsonResponse({
        success: false,
        error: "Missing invite code parameter (?ic=...)"
      });
    }

    const sheet = getSheet();
    if (!sheet) {
      return jsonResponse({
        success: false,
        error: `Sheet '${SHEET_NAME}' not found.`
      });
    }

    const data = sheet.getDataRange().getValues();
    // Row 0 is header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const codeInSheet = (row[COL.INVITE_CODE - 1] || "").toString().trim();

      if (codeInSheet.toLowerCase() === inviteCode.toLowerCase()) {
        const guestData = {
          phoneNumber: (row[COL.PHONE - 1] || "").toString(),
          initial: (row[COL.INITIAL - 1] || "").toString(),
          name: (row[COL.NAME - 1] || "").toString(),
          rsvp: (row[COL.RSVP - 1] || "").toString(),
          countInvite: Number(row[COL.COUNT_INVITE - 1]) || 0,
          countConform: Number(row[COL.COUNT_CONFORM - 1]) || 0,
          comment: (row[COL.COMMENT - 1] || "").toString(),
          wish: (row[COL.WISH - 1] || "").toString(),
          inviteCode: codeInSheet
        };

        return jsonResponse({
          success: true,
          data: guestData
        });
      }
    }

    return jsonResponse({
      success: false,
      error: `No invitation found for code '${inviteCode}'.`
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Handles POST requests
 */
function doPost(e) {
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (pErr) {
        body = e.parameter || {};
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    return handleUpdate(body);
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Core update logic for updating the matching RSVP row
 */
function handleUpdate(params) {
  const inviteCode = (params.inviteCode || params.ic || "").toString().trim();
  if (!inviteCode) {
    return jsonResponse({
      success: false,
      error: "Missing inviteCode parameter"
    });
  }

  const sheet = getSheet();
  if (!sheet) {
    return jsonResponse({
      success: false,
      error: `Sheet '${SHEET_NAME}' not found.`
    });
  }

  const data = sheet.getDataRange().getValues();
  let targetRowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    const codeInSheet = (data[i][COL.INVITE_CODE - 1] || "").toString().trim();
    if (codeInSheet.toLowerCase() === inviteCode.toLowerCase()) {
      targetRowIndex = i + 1; // Google Sheets row is 1-indexed
      break;
    }
  }

  if (targetRowIndex === -1) {
    return jsonResponse({
      success: false,
      error: `No invitation found for code '${inviteCode}'.`
    });
  }

  // Check if RSVP has already been submitted (permanent lock against modifications)
  const existingRsvp = (data[targetRowIndex - 1][COL.RSVP - 1] || "").toString().trim();
  if (existingRsvp !== "") {
    return jsonResponse({
      success: false,
      error: "RSVP has already been submitted for this invitation and is locked against modifications."
    });
  }

  // Update cells in this row
  if (params.rsvp !== undefined) {
    sheet.getRange(targetRowIndex, COL.RSVP).setValue(params.rsvp);
  }
  if (params.countConform !== undefined) {
    sheet.getRange(targetRowIndex, COL.COUNT_CONFORM).setValue(Number(params.countConform) || 0);
  }
  if (params.comment !== undefined) {
    sheet.getRange(targetRowIndex, COL.COMMENT).setValue(params.comment);
  }
  if (params.wish !== undefined) {
    sheet.getRange(targetRowIndex, COL.WISH).setValue(params.wish);
  }
  if (params.phoneNumber !== undefined && params.phoneNumber !== "") {
    sheet.getRange(targetRowIndex, COL.PHONE).setValue(params.phoneNumber);
  }

  // Return the updated data
  const updatedRow = sheet.getRange(targetRowIndex, 1, 1, 9).getValues()[0];
  const guestData = {
    phoneNumber: (updatedRow[COL.PHONE - 1] || "").toString(),
    initial: (updatedRow[COL.INITIAL - 1] || "").toString(),
    name: (updatedRow[COL.NAME - 1] || "").toString(),
    rsvp: (updatedRow[COL.RSVP - 1] || "").toString(),
    countInvite: Number(updatedRow[COL.COUNT_INVITE - 1]) || 0,
    countConform: Number(updatedRow[COL.COUNT_CONFORM - 1]) || 0,
    comment: (updatedRow[COL.COMMENT - 1] || "").toString(),
    wish: (updatedRow[COL.WISH - 1] || "").toString(),
    inviteCode: (updatedRow[COL.INVITE_CODE - 1] || "").toString()
  };

  return jsonResponse({
    success: true,
    message: "RSVP updated successfully",
    data: guestData
  });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

