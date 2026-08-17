import { SearchX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white px-6 py-16 text-center shadow-card">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-primary-100 text-primary">
        <SearchX className="h-8 w-8" />
      </div>
      <h3 className="font-display text-xl font-bold text-text-primary">Không tìm thấy việc làm phù hợp</h3>
      <p className="mt-2 max-w-md text-base text-text-secondary">
        Hãy thử thay đổi từ khóa, địa điểm hoặc nới rộng bộ lọc để xem thêm cơ hội mới.
      </p>
    </div>
  );
}
