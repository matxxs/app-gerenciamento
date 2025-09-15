import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UsuarioLista } from "@/lib/types";

interface ApiResponse {
  data: UsuarioLista[];
}

export const usersApiSlice = createApi({
  reducerPath: "usersApi",
  
  tagTypes: ["User"],

  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),

  endpoints: (builder) => ({
    getUsers: builder.query<UsuarioLista[], void>({
      query: () => "/usuarios",
      transformResponse: (response: ApiResponse) => response.data,
      providesTags: (result) => 
        result 
          ? [...result.map(({ id_usuario }) => ({ type: 'User' as const, id: id_usuario })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),
    // Futuramente, você adicionaria aqui as "mutations" para adicionar, editar e deletar usuários.
    // ex: addUser: builder.mutation(...)
  }),
});

export const { useGetUsersQuery } = usersApiSlice;