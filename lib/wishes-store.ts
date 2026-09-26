import fs from "fs";
import path from "path";

export interface WishEntry {
  id?: string;
  name: string;
  initial?: string;
  wish: string;
  createdAt?: string;
}

const WISHES_FILE = path.join(process.cwd(), "scratch", "wishes.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function getLocalWishes(): WishEntry[] {
  try {
    if (!fs.existsSync(WISHES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(WISHES_FILE, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (w) => typeof w.wish === "string" && w.wish.trim().length > 0
      );
    }
    return [];
  } catch (err) {
    console.error("Error reading local wishes:", err);
    return [];
  }
}

export function saveLocalWish(newWish: WishEntry): void {
  try {
    const trimmed = (newWish.wish || "").trim();
    if (!trimmed) return;

    ensureDirectoryExistence(WISHES_FILE);
    const existing = getLocalWishes();

    // Check if duplicate already exists
    const duplicate = existing.some(
      (w) =>
        w.name.trim().toLowerCase() === newWish.name.trim().toLowerCase() &&
        w.wish.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (!duplicate) {
      existing.unshift({
        id: newWish.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: newWish.name.trim(),
        initial: (newWish.initial || "").trim(),
        wish: trimmed,
        createdAt: newWish.createdAt || new Date().toISOString(),
      });
      fs.writeFileSync(WISHES_FILE, JSON.stringify(existing, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error saving local wish:", err);
  }
}

