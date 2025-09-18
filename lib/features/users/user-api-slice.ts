import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Usuario, UsuarioLista, UsuarioTelaAcesso } from "@/lib/types";

interface ApiResponse<T> {
  data: T;
}

type AddUsuarioPayload = {
    nome_completo: string;
    email: string;
    senha: string;
    id_funcao: number;
    id_empresa: number;
    ativo: boolean;
    telasAcesso: UsuarioTelaAcesso[];
};

type UpdateUsuarioPayload = {
  id: number;
  dados: Partial<Omit<Usuario, 'id_usuario'>> & { id_empresa: number }; 
};

type DeleteUsuarioPayload = {
  id: number;
  id_empresa: number;
};

type UpdatePermissoesPayload = {
  id: number;
  id_empresa: number;
  telasAcesso: UsuarioTelaAcesso[];
};

export const usersApiSlice = createApi({
  reducerPath: "usersApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getUsers: builder.query<UsuarioLista[], number | undefined>({
      query: (id_empresa) => id_empresa ? `/usuarios?id_empresa=${id_empresa}` : "/usuarios",
      transformResponse: (response: ApiResponse<UsuarioLista[]>) => response.data,
      providesTags: (result) => result
        ? [...result.map(({ id_usuario }) => ({ type: 'User' as const, id: id_usuario })), { type: 'User', id: 'LIST' }]
        : [{ type: 'User', id: 'LIST' }],
    }),
    getUserById: builder.query<Usuario & { telasAcesso: UsuarioTelaAcesso[] }, number>({
        query: (id) => `/usuarios/${id}`,
        transformResponse: (response: ApiResponse<Usuario & { telasAcesso: UsuarioTelaAcesso[] }>) => response.data,
        providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    addUser: builder.mutation<{ id_usuario: number }, AddUsuarioPayload>({
        query: (novoUsuario) => ({ url: '/usuarios', method: 'POST', body: novoUsuario }),
        invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<void, UpdateUsuarioPayload>({
      query: ({ id, dados }) => ({ url: `/usuarios/${id}`, method: 'PUT', body: dados }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
    deleteUser: builder.mutation<void, DeleteUsuarioPayload>({
      query: ({ id, id_empresa }) => ({ url: `/usuarios/${id}?id_empresa=${id_empresa}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
    updateUserPermissions: builder.mutation<void, UpdatePermissoesPayload>({
        query: ({ id, ...payload }) => ({ url: `/usuarios/${id}/permissoes`, method: 'PUT', body: payload }),
        invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserPermissionsMutation,
} = usersApiSlice;