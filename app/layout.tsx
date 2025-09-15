import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import "./styles/globals.css";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <html lang="pt-BR">
        <body suppressHydrationWarning={true}>{children}</body>
      </html>
    </StoreProvider>
  );
}