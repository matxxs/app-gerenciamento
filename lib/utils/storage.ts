import type { AuthState } from "@/lib/types";

const AUTH_STATE_KEY = "authState";

/**
 * Carrega o estado de autenticação do localStorage.
 * Retorna o estado ou null se não houver nada ou ocorrer um erro.
 */
export const loadAuthState = (): AuthState | undefined => {
  try {
    const serializedState = localStorage.getItem(AUTH_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const state: AuthState = JSON.parse(serializedState);
    // Verificação simples para garantir que o estado carregado é válido
    if (state.isAuthenticated && state.user) {
        return state;
    }
    return undefined;
  } catch (err) {
    console.error("Não foi possível carregar o estado do localStorage", err);
    return undefined;
  }
};

/**
 * Salva o estado de autenticação no localStorage.
 * @param state O estado de autenticação a ser salvo.
 */
export const saveAuthState = (state: AuthState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(AUTH_STATE_KEY, serializedState);
  } catch (err) {
    console.error("Não foi possível salvar o estado no localStorage", err);
  }
};

/**
 * Remove o estado de autenticação do localStorage.
 */
export const clearAuthState = (): void => {
  try {
    localStorage.removeItem(AUTH_STATE_KEY);
  } catch (err) {
    console.error("Não foi possível remover o estado do localStorage", err);
  }
};