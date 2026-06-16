import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Allsale — Indian Bazaar, delivered worldwide",
  description:
    "Handpicked craftsmanship from India, shipped to New Zealand, Australia, the US, the UK and Canada. Sarees, jewellery, spices, home decor and more.",
  keywords: [
    "Indian fashion NZ",
    "Indian groceries Australia",
    "sarees online New Zealand",
    "Indian handicrafts global shipping",
    "Allsale",
  ],
  openGraph: {
    title: "Allsale — Indian Bazaar, delivered worldwide",
    description:
      "Cross-border marketplace for authentic Indian craftsmanship. Pay in NZD, AUD, USD, GBP or CAD.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        {/* Cabinet Grotesk via Fontshare (free CDN) */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col" data-testid="app-root">
        <Providers>
          <Header />
          <main className="flex-1" data-testid="main-content">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{ duration: 3500 }}
          />
        </Providers>
      </body>
    </html>
  );
}
