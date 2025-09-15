import type { Metadata } from "next";
import IndexPage from ".";

export default function Page() {
  return (
    <div>
        <IndexPage />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Dashboard - Sistema de Gestão",
};