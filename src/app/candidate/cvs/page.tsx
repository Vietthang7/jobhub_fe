import type { Metadata } from "next";
import ManageCvsClient from "./client";

export const metadata: Metadata = {
  title: "Quản lý CV | JobHub",
};

export default function ManageCvsPage() {
  return <ManageCvsClient />;
}
