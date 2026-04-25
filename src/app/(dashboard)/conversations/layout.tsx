import type { Metadata } from "next";
export const metadata: Metadata = { title: "Conversaciones" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
