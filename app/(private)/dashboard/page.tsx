import type { Metadata } from "next";

export default function Page() {
  return (
    <div>
      <h1>Bem-vindo ao Dashboard!</h1>
      <p>Selecione uma opção no menu ao lado para começar.</p>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Dashboard - Sistema de Gestão",
};