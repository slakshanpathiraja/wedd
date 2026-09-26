import { getGuestByCode } from "@/lib/sheet";
import WeddingCard from "./components/WeddingCard";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawParam =
    resolvedSearchParams.ic ||
    resolvedSearchParams.code ||
    resolvedSearchParams.invite;

  const ic =
    typeof rawParam === "string"
      ? rawParam.trim()
      : Array.isArray(rawParam)
      ? rawParam[0]?.trim()
      : undefined;

  let guest = undefined;
  let codeError: string | undefined = undefined;

  if (ic) {
    const res = await getGuestByCode(ic);
    if (res.success && res.guest) {
      guest = res.guest;
    } else {
      codeError = res.error || `Invitation code '${ic}' was not found.`;
    }
  }

  // Always render the invitation card first, with guest passed into it
  return (
    <main className="w-full h-screen overflow-hidden flex items-center justify-center">
      <WeddingCard guest={guest} initialCode={ic} codeError={codeError} />
    </main>
  );
}

