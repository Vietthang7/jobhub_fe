import { Suspense } from "react";
import { AdminAuditLogsClient } from "./client";

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <AdminAuditLogsClient />
    </Suspense>
  );
}
