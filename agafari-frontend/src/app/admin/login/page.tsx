import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-boot">
          <p className="c-muted c-small">Loading…</p>
        </div>
      }
    >
      <AdminLogin />
    </Suspense>
  );
}
