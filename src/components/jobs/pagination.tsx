"use client";

import { useSearchParamsSetter } from "@/hooks/use-search-params-setter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const { setParams } = useSearchParamsSetter();

  if (totalPages <= 1) return null;

  const handlePage = (newPage: number) => {
    setParams({ page: newPage }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - 2);
    let end = Math.min(totalPages - 1, page + 2);

    if (end - start + 1 < maxVisible) {
      if (start === 0) end = Math.min(totalPages - 1, start + maxVisible - 1);
      else if (end === totalPages - 1) start = Math.max(0, end - maxVisible + 1);
    }

    if (start > 0) {
      pages.push(
        <Button key={0} variant="outline" size="icon" onClick={() => handlePage(0)} className="h-9 w-9 transition-all duration-150">
          1
        </Button>
      );
      if (start > 1) pages.push(<MoreHorizontal key="ellipsis-start" className="mx-1 h-4 w-4 text-text-secondary" />);
    }

    for (let index = start; index <= end; index++) {
      pages.push(
        <Button
          key={index}
          variant={index === page ? "default" : "outline"}
          size="icon"
          onClick={() => handlePage(index)}
          className={`h-9 w-9 transition-all duration-150${index === page ? " shadow-sm" : ""}`}
        >
          {index + 1}
        </Button>
      );
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) pages.push(<MoreHorizontal key="ellipsis-end" className="mx-1 h-4 w-4 text-text-secondary" />);
      pages.push(
        <Button
          key={totalPages - 1}
          variant="outline"
          size="icon"
          onClick={() => handlePage(totalPages - 1)}
          className="h-9 w-9 transition-all duration-150"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePage(page - 1)}
        disabled={page <= 0}
        className="h-9 w-9 transition-all duration-150"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">{renderPages()}</div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePage(page + 1)}
        disabled={page >= totalPages - 1}
        className="h-9 w-9 transition-all duration-150"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
