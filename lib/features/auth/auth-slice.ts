import { createAppSlice } from "@/lib/hooks/create-app-slice";
import type { AuthState, Usuario, Permissoes } from "@/lib/types";
import { loadAuthState, saveAuthState, clearAuthState } from "@/lib/utils/storage";

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  usuario: Usuario;
  permissoes: Permissoes;
}

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
        } catch (_error: unknown) { // 
          console.error("Login API Error:", _error);
          return rejectWithValue("Não foi possível conectar ao servidor. Verifique sua conexão.");
        }
      },
      {
        pending: (state) => {
          state.status = 'loading';
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = 'succeeded';
          state.isAuthenticated = true;
          state.user = action.payload.usuario;
          state.permissions = action.payload.permissoes;
          saveAuthState(state);
        },
        rejected: (state, action) => {
          state.status = 'failed';
          state.isAuthenticated = false;
          state.user = null;
          state.permissions = null;
          state.error = action.payload as string;
          clearAuthState();
        },
      }
    ),
    
    logout: create.reducer((state) => {
      state.user = null;
      state.permissions = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      clearAuthState();
    }),
  }),
});

export const { loginUser, logout } = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectPermissions = (state: { auth: AuthState }) => state.auth.permissions;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;