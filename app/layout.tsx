import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono, Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import CookieBanner from "@/components/consent/CookieBanner";
import { consentDefaultsScript } from "@/lib/consent";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocale } from "@/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

// Marketing pages (homepage, navbar, footer) use the site's
// type pairing: Plus Jakarta Sans for headings, Inter for body copy.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: [],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

// Plus Jakarta Sans has no Cyrillic, so Russian headings fall through to
// Manrope, a close geometric match (--font-display lists Jakarta first).
// Jakarta's own metric-adjusted Arial fallback would cover Cyrillic and stop
// that fall-through, hence adjustFontFallback/fallback off on Jakarta.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scholarizepath.xyz"),
  title: "ScholarizePath",
  description: "ScholarizePath",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${manrope.variable} ${inter.variable} antialiased`}>
        <Script id="consent-defaults" strategy="beforeInteractive">
          {consentDefaultsScript}
        </Script>
        <I18nProvider locale={locale}>
          <Providers>{children}</Providers>
          <CookieBanner />
        </I18nProvider>
      </body>
      <GoogleAnalytics gaId="G-GPE7XKV53Q" />
    </html>
  );
}
