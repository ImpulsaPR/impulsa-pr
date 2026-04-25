import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: true, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
