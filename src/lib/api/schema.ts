import { z } from "zod";

// ==========================================
// Enums
// ==========================================
export const RoleSchema = z.enum(["ADMIN", "EMPLOYER", "CANDIDATE"]);
export type Role = z.infer<typeof RoleSchema>;

export const EmploymentTypeSchema = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;

export const JobStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const ApplicationStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

// ==========================================
// Auth Schemas
// ==========================================
export const RegisterRequestSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
  fullName: z.string().min(1, { message: "Họ và tên không được để trống" }),
  role: z.enum(["EMPLOYER", "CANDIDATE"]),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Mật khẩu không được để trống" }),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  userId: z.number(),
  email: z.string(),
  roles: z.array(RoleSchema).or(z.set(RoleSchema)).transform((val) => Array.from(val)),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ==========================================
// Job Schemas
// ==========================================
export const JobCreateRequestSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề công việc không được để trống" }),
  description: z.string().min(1, { message: "Mô tả công việc không được để trống" }),
  location: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  employmentType: EmploymentTypeSchema,
});
export type JobCreateRequest = z.infer<typeof JobCreateRequestSchema>;

export const JobUpdateRequestSchema = JobCreateRequestSchema.partial();
export type JobUpdateRequest = z.infer<typeof JobUpdateRequestSchema>;

export const JobResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  employerName: z.string(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  employmentType: EmploymentTypeSchema,
  status: JobStatusSchema,
  applicationCount: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type JobResponse = z.infer<typeof JobResponseSchema>;

export const JobSummaryResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  location: z.string().optional(),
  employerName: z.string(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  employmentType: EmploymentTypeSchema,
});
export type JobSummaryResponse = z.infer<typeof JobSummaryResponseSchema>;

export const JobSearchQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  employmentType: EmploymentTypeSchema.optional(),
  salaryMinGte: z.number().optional(),
  salaryMaxLte: z.number().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
  sort: z.string().optional(),
});
export type JobSearchQuery = z.infer<typeof JobSearchQuerySchema>;

// ==========================================
// Application Schemas
// ==========================================
export const ApplyRequestSchema = z.object({
  jobId: z.number(),
  coverLetter: z.string().optional(),
  cvUrl: z.string().optional(),
  cvId: z.number().optional(),
});
export type ApplyRequest = z.infer<typeof ApplyRequestSchema>;

export const ApplicationResponseSchema = z.object({
  id: z.number(),
  jobId: z.number(),
  candidateId: z.number(),
  jobTitle: z.string(),
  candidateName: z.string(),
  coverLetter: z.string().optional(),
  cvUrl: z.string().optional(),
  status: ApplicationStatusSchema,
  appliedAt: z.string(),
});
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const UpdateStatusRequestSchema = z.object({
  status: ApplicationStatusSchema,
});
export type UpdateStatusRequest = z.infer<typeof UpdateStatusRequestSchema>;

// ==========================================
// Admin Schemas
// ==========================================
export const AdminUserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  fullName: z.string(),
  roles: z.array(RoleSchema),
  banned: z.boolean(),
  createdAt: z.string(),
});
export type AdminUserResponse = z.infer<typeof AdminUserResponseSchema>;

export const AdminStatsResponseSchema = z.object({
  users: z.object({
    total: z.number(),
    admin: z.number(),
    employer: z.number(),
    candidate: z.number(),
    banned: z.number(),
  }),
  jobs: z.object({
    total: z.number(),
    open: z.number(),
    closed: z.number(),
  }),
  applications: z.object({
    total: z.number(),
    pending: z.number(),
    accepted: z.number(),
    rejected: z.number(),
  }),
});
export type AdminStatsResponse = z.infer<typeof AdminStatsResponseSchema>;

export const AuditLogEntrySchema = z.object({
  id: z.number(),
  actorUserId: z.number().optional(),
  action: z.string(),
  targetType: z.string().optional(),
  targetId: z.number().optional(),
  metadata: z.string().nullable().optional(),
  ip: z.string().optional(),
  createdAt: z.string(),
});
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

// ==========================================
// Candidate CV Schemas
// ==========================================
export const CandidateCvSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  key: z.string().optional(),
  originalFilename: z.string(),
  contentType: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  default: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CandidateCv = z.infer<typeof CandidateCvSchema>;

/** Backend trả plain array CandidateCv[] cho GET /candidates/me/cvs */
export const CandidateCvListSchema = z.array(CandidateCvSchema);
export type CandidateCvList = z.infer<typeof CandidateCvListSchema>;

export const UploadCvResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
  cvId: z.number().optional(),
  originalFilename: z.string().optional(),
  contentType: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
});
export type UploadCvResponse = z.infer<typeof UploadCvResponseSchema>;

export const DeleteCvResponseSchema = z.object({
  deleted: z.boolean(),
  id: z.number(),
  nextDefaultCvId: z.number().nullable().optional(),
});
export type DeleteCvResponse = z.infer<typeof DeleteCvResponseSchema>;

// ==========================================
// Page<T> Helper
// ==========================================
export function pageSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    content: z.array(itemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    size: z.number(),
    number: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
  });
}

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
