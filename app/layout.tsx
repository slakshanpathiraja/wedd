import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Montserrat,
  Great_Vibes,
  Alex_Brush,
  Playfair_Display,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";
import Bg from "./components/Bg";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hansani and Lakshan",
  description: "Join us in celebrating our special wedding day.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${cormorant.variable} ${montserrat.variable} ${greatVibes.variable} ${alexBrush.variable} ${playfair.variable} ${pinyon.variable}`}
    >
      <body className="min-h-full flex flex-col text-stone-800 selection:bg-amber-100 selection:text-amber-900">
        <Bg>{children}</Bg>
      </body>
    </html>
  );
}

