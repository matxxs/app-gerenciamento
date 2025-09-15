import Link from 'next/link';
import styles from './AccessDenied.module.css';

export const AccessDenied = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>403</h1>
      <h2 className={styles.title}>Acesso Negado</h2>
      <p className={styles.message}>
        Você não tem as permissões necessárias para visualizar esta página.
      </p>
      <Link href="/dashboard" className={styles.link}>
        Voltar para o Dashboard
      </Link>
    </div>
  );
};