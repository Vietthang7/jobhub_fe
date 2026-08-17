import Link from "next/link";
import { Briefcase, LinkIcon, MessageCircle, PlayCircle } from "lucide-react";

const footerColumns = [
  {
    title: "Về JobHub",
    links: [
      { href: "#", label: "Giới thiệu" },
      { href: "#", label: "Điều khoản" },
      { href: "#", label: "Bảo mật" },
      { href: "#", label: "Liên hệ" },
    ],
  },
  {
    title: "Ứng viên",
    links: [
      { href: "/jobs", label: "Tìm việc làm" },
      { href: "/register", label: "Tạo hồ sơ" },
      { href: "/login", label: "Đăng nhập" },
    ],
  },
  {
    title: "Nhà tuyển dụng",
    links: [
      { href: "/register", label: "Đăng tin tuyển dụng" },
      { href: "/login", label: "Đăng nhập" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border/50 bg-gradient-to-b from-slate-50 to-slate-100/80">
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2" aria-label="JobHub">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Briefcase className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-bold text-primary">JobHub</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Nền tảng tuyển dụng kết nối ứng viên phù hợp với cơ hội nghề nghiệp chất lượng.
            </p>
            <div className="mt-5 flex items-center gap-3 text-text-secondary">
              <Link href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xs transition-all duration-200 hover:shadow-sm hover:text-primary hover:-translate-y-0.5">
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xs transition-all duration-200 hover:shadow-sm hover:text-primary hover:-translate-y-0.5">
                <PlayCircle className="h-5 w-5" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xs transition-all duration-200 hover:shadow-sm hover:text-primary hover:-translate-y-0.5">
                <LinkIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-base font-semibold text-foreground">{column.title}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href} className="transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <p className="text-center">© 2026 JobHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
