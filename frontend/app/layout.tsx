import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { RTL_LOCALES } from "@/i18n/config";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Allsale — Indian Bazaar, delivered worldwide",
    template: "%s · Allsale",
  },
  description:
    "Handpicked craftsmanship from India, shipped to New Zealand, Australia, the US, the UK and Canada. Sarees, jewellery, spices, home decor and more.",
  keywords: [
    "Indian fashion NZ",
    "Indian groceries Australia",
    "sarees online New Zealand",
    "Indian handicrafts global shipping",
    "Allsale",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "x-default": SITE,
      "en-NZ": SITE,
      "en-AU": SITE,
      "en-US": SITE,
      "en-GB": SITE,
      "en-CA": SITE,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Allsale",
    title: "Allsale — Indian Bazaar, delivered worldwide",
    description:
      "Cross-border marketplace for authentic Indian craftsmanship. Pay in NZD, AUD, USD, GBP or CAD.",
    locale: "en_NZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allsale — Indian Bazaar, delivered worldwide",
    description: "Cross-border marketplace for authentic Indian craftsmanship.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = (RTL_LOCALES as readonly string[]).includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={manrope.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col" data-testid="app-root">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <main className="flex-1" data-testid="main-content">
              {children}
            </main>
            <Footer />
            <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 3500 }} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
