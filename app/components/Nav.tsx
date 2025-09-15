"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { selectUser, selectPermissions, logout } from "@/lib/features/auth/authSlice";
import styles from "./Nav.module.css";
import { type TelaPermissaoNode } from "@/lib/types"; // Supondo que você tenha um arquivo de tipos

// --- Subcomponente para renderizar cada item do menu de forma recursiva ---
const MenuItem = ({ item }: { item: TelaPermissaoNode }) => {
    const pathname = usePathname();
    const hasChildren = item.filhos && item.filhos.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    const isActive = pathname === item.rota;

    // Se for um item pai (sem rota), o click expande/recolhe o submenu
    const handleToggle = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        }
    };
    
    // Define a classe do item com base se está ativo ou é um item pai
    const itemClass = `${styles.menuItem} ${isActive ? styles.active : ''} ${hasChildren ? styles.parentItem : ''}`;

    return (
        <li className={itemClass}>
            {item.rota ? (
                // Se tem rota, é um link navegável
                <Link href={item.rota}>
                    {item.icone && <i className={item.icone}></i>}
                    <span>{item.titulo}</span>
                </Link>
            ) : (
                // Se não tem rota, é um menu pai que abre/fecha
                <div onClick={handleToggle}>
                    {item.icone && <i className={item.icone}></i>}
                    <span>{item.titulo}</span>
                    {hasChildren && <span className={`${styles.caret} ${isOpen ? styles.caretDown : ''}`}></span>}
                </div>
            )}

            {/* Renderização recursiva dos filhos se o submenu estiver aberto */}
            {hasChildren && isOpen && (
                <ul className={styles.submenu}>
                    {item.filhos.map((child) => (
                        <MenuItem key={child.id_tela} item={child} />
                    ))}
                </ul>
            )}
        </li>
    );
};


// --- Componente Principal da Navegação ---
export const Nav = () => {
    const user = useAppSelector(selectUser);
    const permissions = useAppSelector(selectPermissions);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        router.push('/');
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.navHeader}>
                <h3>Dashboard</h3>
                {user && <span className={styles.userName}>Olá, {user.nome_completo.split(' ')[0]}!</span>}
            </div>

            <ul className={styles.menuList}>
                {permissions?.telas.map((tela) => (
                   tela.pode_ler && <MenuItem key={tela.id_tela} item={tela} />
                ))}
            </ul>

            <button onClick={handleLogout} className={styles.logoutButton}>
                Sair
            </button>
        </nav>
    );
};