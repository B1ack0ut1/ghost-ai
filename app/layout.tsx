import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: [
    {
      path: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../node_modules/next/dist/next-devtools/server/font/geist-latin-ext.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: [
    {
      path: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin-ext.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "A dark technical workspace for AI-assisted system design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-base text-copy-primary antialiased">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              borderRadius: "0.75rem",
              colorBackground: "var(--bg-surface)",
              colorDanger: "var(--state-error)",
              colorForeground: "var(--text-primary)",
              colorInput: "var(--bg-elevated)",
              colorInputForeground: "var(--text-primary)",
              colorMutedForeground: "var(--text-secondary)",
              colorPrimary: "var(--accent-primary)",
              fontFamily: "var(--font-geist-sans)",
            },
            elements: {
              card: "border border-surface-border bg-surface shadow-2xl",
              footerActionLink: "text-brand hover:text-brand",
              formButtonPrimary: "bg-brand text-base hover:bg-brand/90",
              formFieldInput:
                "border-surface-border bg-elevated text-copy-primary",
              headerSubtitle: "text-copy-secondary",
              headerTitle: "text-copy-primary",
              socialButtonsBlockButton:
                "border-surface-border bg-elevated text-copy-primary hover:bg-subtle",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
