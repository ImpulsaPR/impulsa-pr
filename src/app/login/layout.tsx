import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: true, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
