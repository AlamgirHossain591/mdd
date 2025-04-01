import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ClientProviders from "./components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "আয়ান ফ্যাশন - বাংলাদেশের সেরা ফ্যাশন ওয়েবসাইট",
  description: "আয়ান ফ্যাশনে আপনি পাবেন সেরা মানের পোশাক ও ফ্যাশন আইটেম সবচেয়ে সাশ্রয়ী মূল্যে।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={inter.className}>
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow bg-gray-50">
              {children}
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
