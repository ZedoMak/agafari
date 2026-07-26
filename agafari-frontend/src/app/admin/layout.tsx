import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { ADMIN_PALETTE } from "@/lib/admin/palette";
import "../sites/clarity.css";
import "./admin.css";

const display = Source_Serif_4({
  variable: "--font-clarity-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Agafari Admin", template: "%s · Agafari Admin" },
  description: "Manage your organization's site, knowledge, and assistant.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`clarity admin-root ${display.variable}`}
      style={ADMIN_PALETTE}
    >
      {children}
    </div>
  );
}
