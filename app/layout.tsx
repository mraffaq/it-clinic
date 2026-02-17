import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IT Clinic - Service & Tech Store",
  description: "Professional IT services, laptop repair, PC repair, networking solutions, and tech products. Your trusted technology partner.",
  authors: [{ name: "Raffa Qomarul" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <ErrorBoundary>
              <main className="flex-1">{children}</main>
            </ErrorBoundary>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
