import { createAppSlice } from "@/lib/createAppSlice";
import type { AuthState, Usuario, Permissoes } from "@/lib/types";
// 👇 Importar os novos utilitários
import { loadAuthState, saveAuthState, clearAuthState } from "@/lib/utils/storage";

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  usuario: Usuario;
  permissoes: Permissoes;
}

// Tenta carregar o estado persistido. Se não conseguir, usa o estado inicial padrão.
const persistedState = loadAuthState();

const initialState: AuthState = persistedState || {
  user: null,
  permissions: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    loginUser: create.asyncThunk<LoginResponse, LoginCredentials>(
      // ... (a lógica do asyncThunk permanece exatamente a mesma)
      async (credentials, { rejectWithValue }) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          const data = await response.json();
          if (!response.ok) {
            return rejectWithValue(data.message || 'Falha no login');
          }
          return data as LoginResponse;
        } catch (error: any) {
          return rejectWithValue(error.toString());
        }
      }
    ),
    
    // 👇 Atualizar o reducer de logout
    logout: create.reducer((state) => {
        state.user = null;
        state.permissions = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        // Limpa o estado do localStorage ao fazer logout
        clearAuthState();
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(authSlice.actions.loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(authSlice.actions.loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.usuario;
        state.permissions = action.payload.permissoes;
        // 👇 Salva o novo estado no localStorage após um login bem-sucedido
        saveAuthState(state);
      })
      .addCase(authSlice.actions.loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false; // Garante que não fique autenticado em caso de erro
        state.user = null;
        state.permissions = null;
        state.error = action.payload as string;
        // Limpa qualquer estado antigo em caso de falha no login
        clearAuthState();
      });
  },
});

export const { loginUser, logout } = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;