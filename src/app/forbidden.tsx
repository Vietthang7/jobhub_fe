import Link from "next/link";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-page px-4 py-16">
      <div className="w-full max-w-lg rounded-lg border bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Ban className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground">
          403 — Không có quyền truy cập
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Bạn không có quyền truy cập trang này</p>
        <Button asChild className="mt-8">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </main>
  );
}
