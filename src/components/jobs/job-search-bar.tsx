"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParamsSetter } from "@/hooks/use-search-params-setter";
import { MapPin, Search } from "lucide-react";

export function JobSearchBar({ disabled }: { disabled?: boolean }) {
  const searchParams = useSearchParams();
  const { setParams } = useSearchParamsSetter();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setLocation(searchParams.get("location") || "");
  }, [searchParams]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setParams({ q: q.trim(), location: location.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/60 bg-white p-4 shadow-sm transition-all duration-200 focus-within:border-primary/30 focus-within:shadow-md"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Vị trí tuyển dụng, tên công ty..."
            className="h-11 pl-9"
            disabled={disabled}
          />
        </div>
        <div className="relative md:w-[240px]">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Địa điểm"
            className="h-11 pl-9"
            disabled={disabled}
          />
        </div>
        <Button type="submit" className="h-11 px-6 font-semibold" disabled={disabled}>
          <Search className="mr-2 h-4 w-4" />
          Tìm kiếm
        </Button>
      </div>
    </form>
  );
}
