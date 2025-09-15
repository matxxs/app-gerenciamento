"use-client";

import { useState, FormEvent, useEffect } from "react"; 
import { useRouter } from "next/navigation"; 
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loginUser, selectAuthStatus, selectAuthError } from "@/lib/features/auth/authSlice";
import styles from "./LoginForm.module.css";

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const router = useRouter();

  const [email, setEmail] = useState("bruno.gerente@techsolutions.com");
  const [senha, setSenha] = useState("123");

  useEffect(() => {
    if (authStatus === 'succeeded') {
      // aqui tem que pegar a primeira tela que o usuario tem acesso
      router.push('/dashboard');
    }
  }, [authStatus, router]); 

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (email && senha) {
      dispatch(loginUser({ email, senha }));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        {authStatus === 'failed' && authError && (
          <p className={styles.error}>{authError}</p>
        )}
        <button type="submit" disabled={authStatus === 'loading'} className={styles.submitButton}>
          {authStatus === 'loading' ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};