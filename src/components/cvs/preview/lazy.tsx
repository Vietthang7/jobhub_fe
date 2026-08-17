import dynamic from "next/dynamic";

export const LazyCvPreview = dynamic(
  () => import("./cv-preview").then((m) => m.CvPreview),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-sm text-muted-foreground">
        Đang chuẩn bị preview...
      </div>
    ),
  },
);
