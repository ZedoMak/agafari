import type { Metadata } from "next";
import { AccessForm } from "@/components/clarity/access-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AccessPage() {
  return <AccessForm />;
}
