"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParamsSetter } from "@/hooks/use-search-params-setter";
import { FilterX, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const employmentTypes = [
  { id: "FULL_TIME", label: "Full-time" },
  { id: "PART_TIME", label: "Part-time" },
  { id: "CONTRACT", label: "Contract" },
  { id: "INTERNSHIP", label: "Internship" },
];

const salaryPresets = [
  { label: "Dưới 10 triệu", salaryMaxLte: 10000000 },
  { label: "10-20 triệu", salaryMinGte: 10000000, salaryMaxLte: 20000000 },
  { label: "20-30 triệu", salaryMinGte: 20000000, salaryMaxLte: 30000000 },
  { label: "Trên 30 triệu", salaryMinGte: 30000000 },
];

const popularLocations = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Khác"];

export function FilterSidebar({ disabled }: { disabled?: boolean }) {
  const searchParams = useSearchParams();
  const { setParams, reset } = useSearchParamsSetter();
  const selectedType = searchParams.get("employmentType") || "";
  const currentLocation = searchParams.get("location") || "";
  const salaryMinParam = searchParams.get("salaryMinGte") || "";
  const salaryMaxParam = searchParams.get("salaryMaxLte") || "";
  const [salaryMin, setSalaryMin] = useState(salaryMinParam);
  const [salaryMax, setSalaryMax] = useState(salaryMaxParam);
  const [location, setLocation] = useState(currentLocation);

  useEffect(() => {
    setSalaryMin(salaryMinParam);
    setSalaryMax(salaryMaxParam);
    setLocation(currentLocation);
  }, [salaryMinParam, salaryMaxParam, currentLocation]);

  const hasAnyFilter = Boolean(
    selectedType || currentLocation || salaryMinParam || salaryMaxParam || searchParams.get("q")
  );

  const applySalaryRange = () => {
    setParams({
      salaryMinGte: salaryMin ? Number(salaryMin) : "",
      salaryMaxLte: salaryMax ? Number(salaryMax) : "",
    });
  };

  const applyLocation = () => {
    setParams({ location: location.trim() });
  };

  return (
    <aside className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-text-primary">Bộ lọc</h2>
          {hasAnyFilter && (
            <Button variant="ghost" size="sm" onClick={reset} disabled={disabled} className="h-8 px-2 text-text-secondary">
              <FilterX className="mr-1 h-4 w-4" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
          <span className="h-4 w-1 rounded-full bg-primary" />
          Loại hình
        </h3>
        <div className="space-y-3">
          {employmentTypes.map((type) => (
            <label key={type.id} className="flex cursor-pointer items-center gap-3 text-base text-text-primary">
              <input
                type="checkbox"
                checked={selectedType === type.id}
                onChange={() => setParams({ employmentType: selectedType === type.id ? "" : type.id })}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary/20"
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
          <span className="h-4 w-1 rounded-full bg-primary" />
          Mức lương
        </h3>
        <div className="grid gap-2">
          {salaryPresets.map((preset) => {
            const active =
              String(preset.salaryMinGte || "") === salaryMinParam &&
              String(preset.salaryMaxLte || "") === salaryMaxParam;
            return (
              <Button
                key={preset.label}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setParams({
                    salaryMinGte: preset.salaryMinGte || "",
                    salaryMaxLte: preset.salaryMaxLte || "",
                  })
                }
                disabled={disabled}
                className="justify-start"
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Tối thiểu"
            value={salaryMin}
            onChange={(event) => setSalaryMin(event.target.value)}
            disabled={disabled}
          />
          <Input
            type="number"
            placeholder="Tối đa"
            value={salaryMax}
            onChange={(event) => setSalaryMax(event.target.value)}
            disabled={disabled}
          />
        </div>
        <Button type="button" size="sm" onClick={applySalaryRange} disabled={disabled} className="mt-2 w-full">
          Áp dụng mức lương
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
          <span className="h-4 w-1 rounded-full bg-primary" />
          Địa điểm
        </h3>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyLocation();
            }}
            placeholder="Nhập địa điểm"
            className="pl-9"
            disabled={disabled}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularLocations.map((item) => (
            <Button
              key={item}
              type="button"
              variant={currentLocation === item ? "default" : "outline"}
              size="sm"
              onClick={() => setParams({ location: currentLocation === item ? "" : item })}
              disabled={disabled}
              className="rounded-full"
            >
              {item}
            </Button>
          ))}
        </div>
        <Button type="button" size="sm" onClick={applyLocation} disabled={disabled} className="mt-2 w-full">
          Áp dụng địa điểm
        </Button>
      </div>
    </aside>
  );
}
