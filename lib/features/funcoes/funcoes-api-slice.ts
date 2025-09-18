// lib/features/funcoes/funcoes-api-slice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Funcao, FuncaoDetalhada, ApiResponse } from "@/lib/types";

export const funcoesApiSlice = createApi({
  reducerPath: "funcoesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Funcoes"],
  endpoints: (builder) => ({
    getFuncoes: builder.query<Funcao[], void>({
      query: () => "/funcoes",
      transformResponse: (response: ApiResponse<Funcao[]>) => response.data,
      providesTags: (result = []) => [
          { type: 'Funcoes', id: 'LIST' },
          ...result.map(({ id_funcao }) => ({ type: 'Funcoes' as const, id: id_funcao })),
      ],
    }),
    getFuncaoById: builder.query<FuncaoDetalhada, number>({
        query: (id) => `/funcoes/${id}`,
        providesTags: (result, error, id) => [{ type: 'Funcoes', id }],
    }),
    addFuncao: builder.mutation<void, Omit<FuncaoDetalhada, 'id_funcao'>>({
        query: (funcao) => ({
            url: '/funcoes',
            method: 'POST',
            body: funcao,
        }),
        invalidatesTags: [{ type: 'Funcoes', id: 'LIST' }],
    }),
    updateFuncao: builder.mutation<void, FuncaoDetalhada>({
        query: ({ id_funcao, ...rest }) => ({
            url: `/funcoes/${id_funcao}`,
            method: 'PUT',
            body: rest,
        }),
        invalidatesTags: (result, error, { id_funcao }) => [{ type: 'Funcoes', id: id_funcao }, { type: 'Funcoes', id: 'LIST' }],
    }),
    // Adicione o endpoint de delete se necessário
    deleteFuncao: builder.mutation<void, number>({
        query: (id) => ({
            url: `/funcoes/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: [{ type: 'Funcoes', id: 'LIST' }],
    })
  }),
});

export const { 
    useGetFuncoesQuery, 
    useGetFuncaoByIdQuery, 
    useAddFuncaoMutation, 
    useUpdateFuncaoMutation,
    useDeleteFuncaoMutation
} = funcoesApiSlice;