import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import "./homepagecss.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIP Service 4U - Your Hookah, Your Way",
  description: "Your Hookah, Your Way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased`}
      >
        {/* <ThemeContextProvider> */}
          <Toaster theme="light" position="top-right" />
          <AuthProvider>{children}</AuthProvider>
        {/* </ThemeContextProvider> */}
      </body>
    </html>
  );
}
