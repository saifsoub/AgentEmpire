import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Empire OS",
  description: "AI-powered personal empire system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
