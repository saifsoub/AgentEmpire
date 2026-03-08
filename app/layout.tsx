import "./globals.css";
import type { Metadata } from "next";
import { RoleProvider } from "@/components/role-context";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "Personal Empire OS",
  description: "AI-powered personal empire management system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RoleProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
