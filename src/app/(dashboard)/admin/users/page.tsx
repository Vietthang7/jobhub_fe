import { Suspense } from "react";
import { AdminUsersClient } from "./client";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <AdminUsersClient />
    </Suspense>
  );
}
