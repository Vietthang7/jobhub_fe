import { JobResponse, JobResponseSchema } from "@/lib/api/schema";

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://localhost:9527/jobhub/api/v1";

export class ServerApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ServerApiError";
  }
}

export async function fetchJobById(id: string): Promise<JobResponse> {
  const res = await fetch(`${BACKEND_ORIGIN}/jobs/${id}`, {
    next: { revalidate: 30 },
  });

  if (res.status === 404) {
    throw new ServerApiError(404, "Job không tồn tại");
  }

  if (!res.ok) {
    throw new ServerApiError(res.status, "Không thể tải thông tin công việc");
  }

  const data = await res.json();
  return JobResponseSchema.parse(data);
}
