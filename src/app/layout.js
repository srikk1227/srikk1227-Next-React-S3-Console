import "../app/globals.css";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClerkProvider } from "@clerk/nextjs";
import { Lato } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });

export const metadata = {
  title: "Next-React-S3-Console - AWS S3 File Manager",
  description:
    "Your intelligent AWS S3 file manager with AI-powered summaries. Securely connect your AWS account and effortlessly organize, browse, and manage your cloud storage.",
  keywords: [
    "AWS S3",
    "file manager",
    "cloud storage",
    "S3 browser",
    "S3 dashboard",
    "S3 UI",
    "Next-React-S3-Console",
    "file management",
    "cloud file browser",
    "AI file summaries",
  ],
  authors: [{ name: "Next-React-S3-Console Team" }],
  creator: "Next-React-S3-Console",
  publisher: "Next-React-S3-Console",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Next-React-S3-Console - AWS S3 File Manager",
    description:
      "Your intuitive AWS S3 file manager. Securely connect your AWS account and effortlessly organize, browse, and manage your cloud storage.",
    url: "https://next-react-s3-console.com/",
    siteName: "Next-React-S3-Console",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Next-React-S3-Console - AWS S3 File Manager",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next-React-S3-Console - AWS S3 File Manager",
    description:
      "Your intuitive AWS S3 file manager. Securely connect your AWS account and effortlessly organize, browse, and manage your cloud storage.",
    creator: "@next-react-s3-console",
  },
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "google": "notranslate",
    "googlebot": "notranslate",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const themeColor = "#3B82F6";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lato.className} translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <meta name="googlebot" content="notranslate" />
        <meta name="robots" content="notranslate" />
      </head>
      <body translate="no" className="notranslate ltr">
        <ErrorBoundary>
          <ThemeProvider>
            <ClerkProvider
              localization={{
                locale: "en-US",
                locales: ["en-US"],
                defaultLocale: "en-US"
              }}
            >
              <Navigation />
              {children}
            </ClerkProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
