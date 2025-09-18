
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Tela, ApiResponse } from "@/lib/types";

export const telasApiSlice = createApi({
  reducerPath: "telasApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Telas"],
  endpoints: (builder) => ({
    getTelas: builder.query<Tela[], void>({
      query: () => "/telas",
      transformResponse: (response: ApiResponse<Tela[]>) => response.data,
      providesTags: (result = []) => [
        { type: 'Telas', id: 'LIST' },
        ...result.map(({ id_tela }) => ({ type: 'Telas' as const, id: id_tela })),
      ],
    }),
  }),
});

export const { useGetTelasQuery } = telasApiSlice;