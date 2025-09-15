"use client";

import { LoginForm } from "@/app/components/auth/LoginForm";
import styles from "@/app/styles/layout.module.css"; 

export default function LoginPage() {
  return (
    <main className={styles.mainCentered}>
      <LoginForm />
    </main>
  );
}