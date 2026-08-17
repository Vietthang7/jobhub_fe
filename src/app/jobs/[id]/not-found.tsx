import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JobNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-page px-4 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary">
        <SearchX className="h-10 w-10" />
      </div>
      <h1 className="font-display text-3xl font-bold text-text-primary">Không tìm thấy công việc</h1>
      <p className="mt-3 max-w-md text-base text-text-secondary">
        Công việc này có thể đã bị xoá, đã đóng, hoặc đường dẫn không hợp lệ.
      </p>
      <Button asChild className="mt-6">
        <Link href="/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách việc làm
        </Link>
      </Button>
    </div>
  );
}
