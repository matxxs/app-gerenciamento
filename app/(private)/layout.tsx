"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { selectIsAuthenticated } from "@/lib/features/auth/authSlice";
import { Nav } from "@/app/components/Nav";
import styles from "@/app/styles/layout.module.css";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isClient, router]);

  if (!isClient || !isAuthenticated) {
    return null; 
  }

  return (
    <div className={styles.container}>
      <Nav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}