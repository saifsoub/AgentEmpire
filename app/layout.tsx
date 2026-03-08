import "./globals.css";
import type { Metadata } from "next";
import { RoleProvider } from "@/components/role-context";

export const metadata: Metadata = {
  title: "Personal Empire OS",
  description: "AI-powered personal empire management system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
