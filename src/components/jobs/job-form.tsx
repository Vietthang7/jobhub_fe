"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, ApiError, RateLimitError } from "@/lib/api/client";
import {
  EmploymentTypeSchema,
  JobCreateRequestSchema,
  type EmploymentType,
  type JobCreateRequest,
  type JobResponse,
} from "@/lib/api/schema";

const DESCRIPTION_MAX_LENGTH = 5000;

export const jobFormSchema = JobCreateRequestSchema.extend({
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề công việc không được để trống")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  description: z
    .string()
    .trim()
    .min(1, "Mô tả công việc không được để trống")
    .max(DESCRIPTION_MAX_LENGTH, `Mô tả tối đa ${DESCRIPTION_MAX_LENGTH} ký tự`),
  location: z.string().trim().optional(),
  salaryMin: z.number().nonnegative("Lương phải >= 0").optional(),
  salaryMax: z.number().nonnegative("Lương phải >= 0").optional(),
  employmentType: EmploymentTypeSchema,
}).refine(
  (data) => data.salaryMin == null || data.salaryMax == null || data.salaryMin <= data.salaryMax,
  {
    message: "Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa",
    path: ["salaryMax"],
  }
);

export type JobFormValues = z.infer<typeof jobFormSchema>;

const employmentTypeOptions: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "INTERNSHIP", label: "Thực tập" },
];

interface JobFormProps {
  mode: "create" | "edit";
  initialData?: JobResponse;
  onSuccess?: (job: JobResponse) => void;
}

function toPayload(values: JobFormValues): JobCreateRequest {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    location: values.location?.trim() || undefined,
    salaryMin: values.salaryMin,
    salaryMax: values.salaryMax,
    employmentType: values.employmentType,
  };
}

function fieldNameFromApi(name: string): keyof JobFormValues | null {
  if (["title", "description", "location", "salaryMin", "salaryMax", "employmentType"].includes(name)) {
    return name as keyof JobFormValues;
  }
  return null;
}

export function JobForm({ mode, initialData, onSuccess }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo<JobFormValues>(
    () => ({
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      salaryMin: initialData?.salaryMin,
      salaryMax: initialData?.salaryMax,
      employmentType: initialData?.employmentType ?? "FULL_TIME",
    }),
    [initialData]
  );

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  const descriptionValue = form.watch("description") ?? "";
  const submitLabel = mode === "create" ? "Đăng tin" : "Lưu thay đổi";

  async function handleSubmit(values: JobFormValues) {
    setIsSubmitting(true);
    try {
      const payload = toPayload(values);
      const job = await apiFetch<JobResponse>(mode === "create" ? "/jobs" : `/jobs/${initialData?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        body: JSON.stringify(payload),
      });

      toast.success(mode === "create" ? "Đã đăng tin tuyển dụng" : "Đã lưu thay đổi");
      onSuccess?.(job);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 && error.fields) {
          Object.entries(error.fields).forEach(([name, message]) => {
            const fieldName = fieldNameFromApi(name);
            if (fieldName) {
              form.setError(fieldName, { message: String(message) });
            }
          });
        }
        toast.error(error.message);
      } else if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 rounded-lg border bg-white p-5 shadow-card sm:p-7">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề công việc</FormLabel>
              <FormControl>
                <Input placeholder="VD: Senior Java Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employmentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại hình làm việc</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employmentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa điểm</FormLabel>
              <FormControl>
                <Input placeholder="VD: Hà Nội, TP.HCM, Từ xa..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="salaryMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương tối thiểu (VNĐ)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="VD: 15000000"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salaryMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương tối đa (VNĐ)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="VD: 30000000"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả công việc</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả công việc, yêu cầu, phúc lợi..."
                  className="min-h-[220px] resize-y"
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Mô tả công việc, yêu cầu, phúc lợi...</span>
                <span>
                  {descriptionValue.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => router.push("/employer/jobs")} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px] font-semibold">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
