import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "আয়ান ফ্যাশন অ্যাডমিন প্যানেল",
  description: "আয়ান ফ্যাশন ই-কমার্স অ্যাডমিন প্যানেল",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
} 