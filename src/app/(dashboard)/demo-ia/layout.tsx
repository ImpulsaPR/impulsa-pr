import type { Metadata } from "next";
export const metadata: Metadata = { title: "Demo IA" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
