import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-page px-4 py-16">
      <div className="w-full max-w-lg rounded-lg border bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SearchX className="h-10 w-10" />
        </div>
        <div className="mt-6 font-display text-7xl font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40">
          404
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm text-muted-foreground">Trang bạn tìm không tồn tại hoặc đã bị xóa</p>
        <Button asChild className="mt-8">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </main>
  );
}
