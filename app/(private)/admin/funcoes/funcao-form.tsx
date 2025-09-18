"use client"

import { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import {
  useGetFuncaoByIdQuery,
  useAddFuncaoMutation,
  useUpdateFuncaoMutation,
} from "@/lib/features/funcoes/funcoes-api-slice"
import { useGetTelasQuery } from "@/lib/features/screens/screen-api-slice"
import type { Tela, FuncaoDetalhada } from "@/lib/types" // Supondo que seus tipos estejam em @/lib/types

// Componentes da UI
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

const funcaoSchema = z.object({
  nome_funcao: z.string().min(1, "O nome da função é obrigatório."),
  descricao: z.string().default(""), 
  pode_ver_todas_filiais: z.boolean().default(false),
  permissoes: z
    .array(
      z.object({
        id_tela: z.number(),
        titulo_tela: z.string(),
        pode_ler: z.boolean().default(false),
        pode_criar: z.boolean().default(false),
        pode_atualizar: z.boolean().default(false),
        pode_deletar: z.boolean().default(false),
      }),
    )
    .default([]),
})

type FuncaoFormValues = z.infer<typeof funcaoSchema>

interface GrupoDePermissoes {
  id_menu: number
  titulo_menu: string
  telas_filhas: Tela[]
}

interface FuncaoFormProps {
  funcaoId: number | null
  onClose: () => void
}

const defaultFormValues: FuncaoFormValues = {
  nome_funcao: "",
  descricao: "",
  pode_ver_todas_filiais: false,
  permissoes: [],
}

export function FuncaoForm({ funcaoId, onClose }: FuncaoFormProps) {
  const isEditMode = funcaoId !== null

  const { data: funcaoData, isLoading: isLoadingFuncao } = useGetFuncaoByIdQuery(funcaoId!, { skip: !isEditMode })
  const { data: telas = [], isLoading: isLoadingTelas } = useGetTelasQuery()

  const [addFuncao, { isLoading: isAdding }] = useAddFuncaoMutation()
  const [updateFuncao, { isLoading: isUpdating }] = useUpdateFuncaoMutation()
  const isSaving = isAdding || isUpdating

  const form = useForm<FuncaoFormValues>({
    resolver: zodResolver(funcaoSchema),
    defaultValues: defaultFormValues,
  })

  useEffect(() => {

    if (!isLoadingTelas) {
      const todasAsTelasComRota = telas.filter((tela) => tela.rota)

      if (isEditMode && funcaoData) {
        const permissoesMapeadas = todasAsTelasComRota.map((tela) => {
          const permissaoExistente = funcaoData.permissoes.find((p) => p.id_tela === tela.id_tela)
          return {
            id_tela: tela.id_tela,
            titulo_tela: tela.titulo,
            pode_ler: permissaoExistente?.pode_ler ?? false,
            pode_criar: permissaoExistente?.pode_criar ?? false,
            pode_atualizar: permissaoExistente?.pode_atualizar ?? false,
            pode_deletar: permissaoExistente?.pode_deletar ?? false,
          }
        })

        form.reset({
          nome_funcao: funcaoData.nome_funcao,
          descricao: funcaoData.descricao ?? "",
          pode_ver_todas_filiais: funcaoData.pode_ver_todas_filiais,
          permissoes: permissoesMapeadas,
        })
      }
 
      else if (!isEditMode) {
        const permissoesIniciais = todasAsTelasComRota.map((tela) => ({
          id_tela: tela.id_tela,
          titulo_tela: tela.titulo,
          pode_ler: false,
          pode_criar: false,
          pode_atualizar: false,
          pode_deletar: false,
        }))
        form.reset({
          ...defaultFormValues,
          permissoes: permissoesIniciais,
        })
      }
    }
  }, [funcaoData, telas, isEditMode, form, isLoadingTelas])

  const { fields } = useFieldArray({
    control: form.control,
    name: "permissoes",
  })

  const permissoesAgrupadas = useMemo((): GrupoDePermissoes[] => {
    if (!telas.length) return []

    const menusPai = telas.filter((tela) => tela.id_tela_pai === null).sort((a, b) => a.ordem - b.ordem)

    return menusPai.map((menu) => ({
      id_menu: menu.id_tela,
      titulo_menu: menu.titulo,
      telas_filhas: telas
        .filter((tela) => tela.id_tela_pai === menu.id_tela || (tela.id_tela === menu.id_tela && tela.rota))
        .sort((a, b) => a.ordem - b.ordem),
    }))
  }, [telas])
  
  const onSubmit = async (data: FuncaoFormValues) => {
    const payload = {
      ...data,
      permissoes: data.permissoes.map(({ titulo_tela, ...rest }) => rest),
    }

    const promise = isEditMode
      ? updateFuncao({ id_funcao: funcaoId!, ...payload }).unwrap()
      : addFuncao(payload).unwrap()

    toast.promise(promise, {
      loading: "Salvando...",
      success: () => {
        onClose()
        return `Função ${isEditMode ? "atualizada" : "criada"} com sucesso!`
      },
      error: (err) => `Erro ao salvar: ${err.data?.message || "Tente novamente."}`,
    })
  }

  const isLoading = isLoadingFuncao || isLoadingTelas

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <SheetHeader className="flex-shrink-0 px-4 sm:px-6 pt-4 pb-2">
        <SheetTitle className="text-lg sm:text-xl">{isEditMode ? "Editar Função" : "Criar Nova Função"}</SheetTitle>
        <SheetDescription className="text-sm">
          {isEditMode
            ? "Altere os detalhes e permissões da função."
            : "Preencha os detalhes para criar uma nova função."}
        </SheetDescription>
      </SheetHeader>

      {isLoading ? (
        <div className="flex-1 p-4 sm:p-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 sm:px-6 py-4 space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome_funcao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nome da Função</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Vendedor Sênior" className="w-full" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o propósito e as responsabilidades desta função..."
                            className="w-full min-h-[80px] resize-none"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pode_ver_todas_filiais"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium cursor-pointer">
                            Permitir ver dados de todas as filiais
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-semibold">Permissões de Acesso</h3>

                  <div className="space-y-4">
                    {permissoesAgrupadas.map((grupo) => (
                      <div key={grupo.id_menu} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded">
                          {grupo.titulo_menu}
                        </h4>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30">
                                  <TableHead className="min-w-[200px] font-medium">Tela</TableHead>
                                  <TableHead className="text-center w-16 font-medium">Ler</TableHead>
                                  <TableHead className="text-center w-16 font-medium">Criar</TableHead>
                                  <TableHead className="text-center w-16 font-medium">Editar</TableHead>
                                  <TableHead className="text-center w-16 font-medium">Excluir</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {grupo.telas_filhas.map((tela) => {
                                  const index = fields.findIndex((f) => f.id_tela === tela.id_tela)
                                  if (index === -1) return null

                                  return (
                                    <TableRow key={fields[index].id} className="hover:bg-muted/20">
                                      <TableCell className="font-medium px-3 py-2">
                                        <span className="text-sm">{tela.titulo}</span>
                                      </TableCell>
                                      <TableCell className="text-center p-2">
                                        <FormField
                                          control={form.control}
                                          name={`permissoes.${index}.pode_ler`}
                                          render={({ field }) => (
                                            <FormItem className="flex justify-center">
                                              <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center p-2">
                                        <FormField
                                          control={form.control}
                                          name={`permissoes.${index}.pode_criar`}
                                          render={({ field }) => (
                                            <FormItem className="flex justify-center">
                                              <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center p-2">
                                        <FormField
                                          control={form.control}
                                          name={`permissoes.${index}.pode_atualizar`}
                                          render={({ field }) => (
                                            <FormItem className="flex justify-center">
                                              <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center p-2">
                                        <FormField
                                          control={form.control}
                                          name={`permissoes.${index}.pode_deletar`}
                                          render={({ field }) => (
                                            <FormItem className="flex justify-center">
                                              <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                              </FormControl>
                                            </FormItem>
                                          )}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="flex-shrink-0 px-4 sm:px-6 py-3 border-t bg-background">
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-transparent"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      )}
    </div>
  )
}
